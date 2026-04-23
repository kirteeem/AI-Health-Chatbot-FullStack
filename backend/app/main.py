from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.logging import configure_logging
from .core.settings import settings
from .db.database import init_database
from .middleware.request_context import RequestContextMiddleware
from .middleware.security import InMemoryRateLimiter, SecurityMiddleware
from .routes.auth import router as auth_router
from .routes.chat import router as chat_router
from .routes.plan import router as plan_router
from .routes.predict import router as predict_router
from .routes.user_health import router as user_health_router

configure_logging()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_database()
    yield


app = FastAPI(
    title=settings.app_name,
    description="AI Health Platform API",
    version="2.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    SecurityMiddleware,
    limiter=InMemoryRateLimiter(requests_per_minute=settings.rate_limit_per_minute),
    max_body_size=settings.request_size_limit_bytes,
)

app.include_router(chat_router, prefix="/api/v1", tags=["chat"])
app.include_router(auth_router, prefix="/api")
app.include_router(user_health_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(plan_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI Health Platform API", "version": "2.0.0"}
