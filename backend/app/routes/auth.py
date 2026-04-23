import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from ..core.security import create_access_token, get_current_user_id, hash_password, verify_password
from ..db.database import get_db
from ..services.user_auth_service import UserAuthService

router = APIRouter(prefix="/auth", tags=["auth"])
_auth = UserAuthService()


class RegisterBody(BaseModel):
    email: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=80)

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        s = v.strip().lower()
        if "@" not in s:
            raise ValueError("Invalid email: missing @")
        local, _, domain = s.partition("@")
        if not local or not domain:
            raise ValueError("Invalid email: enter both name and domain (e.g. you@example.com)")
        # Typical addresses need a dot in the domain (excludes a few rare RFC forms).
        if "." not in domain and domain != "localhost":
            raise ValueError("Invalid email: use a domain with a dot, e.g. you@gmail.com")
        return s


class LoginBody(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterBody, conn: Annotated[sqlite3.Connection, Depends(get_db)]):
    try:
        ph = hash_password(body.password)
        user = _auth.create_user(conn, body.email, ph, body.name)
        token = create_access_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "name": user.name},
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already registered")


@router.post("/login")
def login(body: LoginBody, conn: Annotated[sqlite3.Connection, Depends(get_db)]):
    row = _auth.get_by_email(conn, body.email.strip().lower())
    if not row or not verify_password(body.password, row[1]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = row[0]
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name},
    }


@router.get("/me")
def me(user_id: Annotated[int, Depends(get_current_user_id)], conn: Annotated[sqlite3.Connection, Depends(get_db)]):
    user = _auth.get_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "name": user.name}
