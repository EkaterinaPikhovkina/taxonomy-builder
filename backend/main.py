from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import taxonomy_router

app = FastAPI(
    title="Taxonomy Builder",
    description="API for building and managing RDF-like taxonomies."
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    ["*"]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(taxonomy_router.router)


@app.get("/", tags=["Root/Status"])
async def root_status():
    return {"status": "ok", "message": "Taxonomy API is running"}
