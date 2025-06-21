from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
load_dotenv()
url = os.getenv("MONGO_URI")

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
class User(BaseModel):
    usermail: str


@app.post('/user')
async def check_user(user: User):
    usermail = user.usermail
    if not usermail:
        return{ "error": "Email is required."}
    user_data = await collection.find_one({"usermail": usermail})
    if user_data:
        return {"message": "User already exists."}
    else:
        return {"message": "User does not exist."}
    
    
@app.post("/login")
async def login(user: Login):
    usermail = user.usermail
    password = user.password
    if not usermail or not password:
        return {"error": "Email and password are required."}
    user_data = await collection.find_one({"usermail": usermail})
    if not user_data:
        passworde = pwd_context.hash(user.password) 
        new_user = await collection.insert_one({"usermail": usermail, "password": passworde})
        return {"message": "User created successfully."}
    else:
        if pwd_context.verify(password, user_data["password"]):
            return {"message": "Login successful."}
        else:
            return {"error": "Invalid password."}
         

   