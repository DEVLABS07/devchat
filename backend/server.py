from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from config import Settings
settings = Settings()
url = settings.mongodb_url

app = FastAPI()
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_headers=["*"],
    allow_methods=["*"])

cluster = AsyncIOMotorClient(url)
database = cluster["Authentication"]
collection = database["login"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Login(BaseModel):
    usermail: str
    password: str


@app.post("/login")
async def login(user: Login):
    usermail = user.usermail
    password = pwd_context.hash(user.password) 
    if not usermail or not password:
        return {"error": "Email and password are required."}
    user_data = await collection.find_one({"usermail": usermail})
    if not user_data:
        new_user = await collection.insert_one({"usermail": usermail, "password": password})
        return {"message": "User created successfully."}
    elif pwd_context.verify(password, user_data["password"]):
        return {"message": "Login successful."}
    else:
        return {"error": "Invalid password."}   