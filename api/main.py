import uvicorn

from fastapi import FastAPI
from apps.comment import comment_router

app = FastAPI()
app.include_router(comment_router, prefix="/comments")

if __name__ == "__main__":
    uvicorn.run("main:app", port=7000)