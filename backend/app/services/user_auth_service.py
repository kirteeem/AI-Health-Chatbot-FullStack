import sqlite3
from dataclasses import dataclass


@dataclass
class UserRecord:
    id: int
    email: str
    name: str


class UserAuthService:
    def create_user(self, conn: sqlite3.Connection, email: str, password_hash: str, name: str) -> UserRecord:
        cur = conn.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
            (email.lower().strip(), password_hash, name.strip()),
        )
        uid = int(cur.lastrowid)
        return UserRecord(id=uid, email=email.lower().strip(), name=name.strip())

    def get_by_email(self, conn: sqlite3.Connection, email: str) -> tuple[UserRecord, str] | None:
        cur = conn.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = ?",
            (email.lower().strip(),),
        )
        row = cur.fetchone()
        if not row:
            return None
        rec = UserRecord(id=row["id"], email=row["email"], name=row["name"])
        return rec, row["password_hash"]

    def get_by_id(self, conn: sqlite3.Connection, user_id: int) -> UserRecord | None:
        cur = conn.execute("SELECT id, email, name FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            return None
        return UserRecord(id=row["id"], email=row["email"], name=row["name"])
