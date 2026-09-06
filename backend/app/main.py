from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.medical_records import ( router as medical_records_router,)
from app.routers.ai import router as ai_router
from app.routers.assistant import router as assistant_router
from app.routers.conversations import ( router as conversations_router, )
from app.routers.registration_ai import (router as registration_ai_router,)

from .config import settings
from .database import (
    check_database_connection,
    initialize_database,
)
from .routers.auth import router as auth_router
from .routers.patient import router as patient_router
from .routers.appointments import router as appointments_router
from app.routers.documents import (router as documents_router,)


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

allowed_origins = [
    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Production frontend URL from environment
if settings.frontend_url:
    allowed_origins.append(
        settings.frontend_url.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Routers
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(appointments_router)
app.include_router(medical_records_router)
app.include_router(ai_router)
app.include_router(assistant_router)
app.include_router(conversations_router)
app.include_router(documents_router)
app.include_router(registration_ai_router)

# --------------------------------------------------
# Basic endpoints
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "success": True,
        "message": "MediKiosk Backend is running",
    }


@app.get("/api/health")
async def health_check():

    database_status = check_database_connection()

    return {
        "success": True,
        "backend": "healthy",
        "database": (
            "connected"
            if database_status
            else "disconnected"
        ),
        "environment": settings.environment,
    }