from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from random import randint
import os
from dotenv import load_dotenv
import yagmail 


load_dotenv()
url = os.getenv("MONGO_URI")
email = os.getenv("EMAIL")
password = os.getenv("PASSWORD")

app = FastAPI()
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_headers=["*"],
    allow_methods=["*"])


cluster = AsyncIOMotorClient(url)
database = cluster["Authentication"]
collection = database["login"]
collection2 = database["History"]
collection3 = database["Assignments"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




class Login(BaseModel):
    usermail: str
    password: str
class User(BaseModel):
    usermail: str
class otp(BaseModel):
    usermail: str
class data(BaseModel):
    Data: str
class assign(BaseModel):
    task: str
    person: str
class assignDel(BaseModel):
    task: str



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
         

@app.post("/otp")
async def send_otp(user: otp):
    usermail = user.usermail
    ya = yagmail.SMTP(email,password)
    if not usermail:
        return {"error": "Email is required."}
    else:
        random = randint(100000, 999999)
        try:
            send = ya.send(to=usermail, subject="OTP for DevChat", contents=f"Your OTP is {random}")
        except Exception as e:
            return { "details": str(e)}
        return {"message": "OTP sent successfully.", "otp": random}
    
@app.post("/newpass")
async def new_password(user: Login):
    usermail = user.usermail
    password = user.password
    if not usermail or not password:
        return {"error": "Email and password are required."}
    user_data = await collection.find_one({"usermail": usermail})
    if not user_data:
        return {"error": "User does not exist."}
    else:
        new_password = pwd_context.hash(password)
        await collection.update_one({"usermail": usermail}, {"$set": {"password": new_password}})
        return {"message": "Password updated successfully."}
    
@app.post("/saveassign")
async def save_assign(data:assign):
    try:
        save_assign = await collection3.insert_one({"task": data.task, "person": data.person})
        return {"message": "Added Successfully"}
    except Exception as e:
        return {"Error": e}
    
@app.get("/getassign")
async def get_assign():
    try:
        get_assign = await collection3.find({}).to_list(length=None)
        for doc in get_assign:
            doc["_id"] = str(doc["_id"])
        return {"message": get_assign}
    except Exception as e:
        return {'Error':str(e)}

@app.post("/deltask")
async def del_assign(dela:assignDel):
    try:
        response = await collection3.delete_one({ "task":dela.task })
        return {"message": "Successfully Deleted"}
    except Exception as e:
        return {"message": str(e)}
    


    
clients = []

@app.websocket('/ws')
async def webserver(websocket:WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            for client in clients:
                if client!= websocket:
                    await client.send_json(message)
    except WebSocketDisconnect:
                clients.remove(websocket)