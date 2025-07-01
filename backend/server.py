from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from random import randint
import os
from dotenv import load_dotenv
import yagmail 
from typing import List

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
collection1 = database["Otp"]
collection3 = database["Assignments"]
collection4 = database["Chats"]
collection5 = database["Groups"]
collection6 = database["Requests"] 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




class Login(BaseModel):
    usermail: str
    password: str
class User(BaseModel):
    usermail: str
class saveotp(BaseModel):
    usermail: str
class data(BaseModel):
    Data: str
class assign(BaseModel):
    task: str
    person: str
class assignDel(BaseModel):
    task: str
class Check(BaseModel):
    username: str
    otp: str
class schema(BaseModel):
    group: str
    sender: str
    message: str
    key: int
class chat(BaseModel):
    group: str
    messages: List[schema]
class getChat(BaseModel):
    group:str
    
class newGroup(BaseModel):
    username: str
    group: str
    member: List

class req(BaseModel):
    username: str
    group: str    
    
class reqCondition(BaseModel):
    username: str
    group: str
    response: str
    
@app.post('/req')
async def save_req(data:req):
    try:
        response = await collection6.insert_one({ "username": data.username, "group": data.group })    
        return {"message" : "Request sent successfully"}
    except Exception as e:
        return {"Error": e}
    
@app.post('/getreqs')
async def get_reqs(data:User):
    try:
        response = await collection5.find({"Admin":data.usermail}).to_list(length=None)
        requests = []
        for i in response:
            reqs = await collection6.find({"group": i['Group']}).to_list(length=None)
            for j in reqs:
                j['_id']= str(j['_id'])
                requests.append(j)
        return {"message": requests}     
    except Exception as e:
        return {"Error": e}


@app.post('/handreq')
async def handle_request(data: reqCondition):
    try:
        condition = data.response
        if condition == "reject":
            response = await collection6.delete_one({"username": data.username, "group": data.group})
            return {"Message": "Request Deleted Successfully"}
        else:
            group = await collection5.find_one({"Group": data.group})
            newmem = group['Members']
            newmem.append(data.username)
            modify = await collection5.update_one({"Group": data.group}, {"$set":{"Members": newmem}})
            await collection6.delete_one({"username": data.username, "group": data.group})
            return {"Message": "Request Deleted Successfully"}            
    except Exception as e:
        return {"Error": e}
    
@app.post('/exitgroup')
async def exitgroup(data:req):
    try:
        response = await collection5.find_one({"Group": data.group})
        members = response["Members"]
        if response["Admin"] == data.username:
            respond = await collection5.delete_one({"Group": data.group})
            respond = await collection4.delete_one({"group": data.group})
            return {"Message": "Successfully Deleted the Group"}
        newmembers = []
        for i in members:
            if i != data.username:
                newmembers.append(i)
        newresponse = await collection5.update_one({"Group": data.group}, {"$set": {"Members": newmembers}})
        return{"Message": "Successfully removed from the group"}
                
    except Exception as e:
        return {"Error": e}    

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
         

@app.post("/saveotp")
async def send_otp(user: saveotp):
    usermail = user.usermail
    ya = yagmail.SMTP(email,password)
    if not usermail:
        return {"error": "Email is required."}
    else:
        random = randint(100000, 999999)
        try:
            send = ya.send(to=usermail, subject="OTP for ThumbsUp", contents=f"Your OTP is {random}")
            saveOTP = await collection1.insert_one({"Otp":random,"username": usermail})
        except Exception as e:
            return { "details": str(e)}
        return {"message": "OTP sent successfully.", "otp":True}

@app.post("/checkotp")
async def check_otp(check: Check):
    try:
        username = check.username
        otp = check.otp
        num = int(otp)
        response = await collection1.find_one({ "username": username })
        if num == response['Otp']:
            response = await collection1.delete_one({"username": username})
            return {"message": "OTP is Verified"}
        else:
            response = await collection1.delete_one({"username": username})
            return {"message": "Invalid OTP"}
    except Exception as e:
        return {"Error": e}

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

@app.post("/savechat")
async def saveChat(chatdata:chat):
    try:
        exist = await collection4.find_one({"group": chatdata.group})
        if(exist):
            modifydata = await collection4.update_one({"group": chatdata.group}, {"$set":{ "message": [msg.dict() for msg in chatdata.messages], "group": chatdata.group}})
            return {"message": "Message Modified"}
        else:
            saveData = await collection4.insert_one({ "message": [msg.dict() for msg in chatdata.messages], "group": chatdata.group})
            return {"message": "Messages Saved"}
    except Exception as e:
        return {"message": e}
    
    
@app.post("/getchat")
async def getchat(data: getChat):
    try:
        response = await collection4.find_one({"group": data.group})
        if response:
            response['_id'] = str(response['_id'])
        return {"Message": response}
    except Exception as e:
        return {"Error": e}

@app.post("/newchat")
async def newchat(data: newGroup):
    try:
        checkGroup = await collection5.find_one({"Group": data.group})
        if(checkGroup):
            return {"message": "Group Already Exists. Please Enter a different Group Name", "code": 123}
        response = await collection5.insert_one({"Group": data.group, "Admin": data.username, "Members" : data.member})
        return {"message": "Group Created"}
    except Exception as e:
        return {"Error": e}
    
@app.post("/getgroup")
async def getchat(data: User):
    try:
        response = await collection5.find({"Members": data.usermail}).to_list(length = None)
        if(response):
            for i in response:
                i['_id'] = str(i['_id'])
            return {"message": response}
    except Exception as e:
        return {"Error": e} 
    
@app.get("/allgroups")
async def getallchats():
        response = await collection5.find({}).to_list(length=None)
        if response:
            for i in response:
                i['_id'] = str(i['_id'])
            return  {"Message": response}

    
clients = {}

@app.websocket('/ws/{group}')
async def webserver(websocket:WebSocket, group:str):
    await websocket.accept()
    if group not in clients:
        clients[group] = []
    clients[group].append(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            for client in clients[group]:
                if client!= websocket:
                    await client.send_json(message)
    except WebSocketDisconnect:
                clients[group].remove(websocket)