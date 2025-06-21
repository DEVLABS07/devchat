from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel


app = FastAPI()
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_headers=["*"],
    allow_methods=["*"])

cluster = AsyncIOMotorClient("mongodb+srv://devlabs07:0rsKIrtlWd1h0Fn6@cluster0.0onzi5k.mongodb.net/")
database = cluster["Authentication"]
collection = database["login"]

class Login(BaseModel):
    usermail: str
    password: str


@app.post("/login")
async def login(user: Login):
    usermail = user.usermail
    password = user.password
    if not usermail or not password:
        return {"error": "Email and password are required."}
    user_data = await collection.find_one({"usermail": usermail})
    if not user_data:
        new_user = await collection.insert_one({"usermail": usermail, "password": password})
        return {"message": "User created successfully."}
    elif user_data["password"] == password:
        return {"message": "Login successful."}
    else:
        return {"error": "Invalid password."}   