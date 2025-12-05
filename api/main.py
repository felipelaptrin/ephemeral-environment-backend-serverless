from random import randint

from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def healthcheck():
    return "API is healthy"


@app.get("/random")
def random():
    return {"number": randint(1, 10)}
