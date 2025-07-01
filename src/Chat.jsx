import { useEffect, useRef, useState } from 'react'
import './Chat.css'
import img from './assets/dp02.jpg'
import logo from './assets/logo.jpg'
import axios from 'axios'

const Chat = () => {
    const [user, setUser] = useState('');
    const [task, setTask] = useState([]);
    const [requestList, setRequestList] = useState([]);
    const wsa = useRef(null);
    const [lastMessage, setLastMessage] = useState();
    const [messageList, setMessageList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [groupName, setGroupName] = useState(groupList[1]);
    const [searchData, setSearchData] = useState([]);
    const [searchActivate, setSearchActivate] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        const fetchGroups = async () => {
            if (searchActivate) {
                const response = await axios.get("http://127.0.0.1:8000/allgroups");
                setSearchData(response.data.Message);
            }
        }
        fetchGroups();
    }, [searchActivate])


    useEffect(() => {
        const username = localStorage.getItem('user');
        setUser(username);
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${groupName}`);
        wsa.current = ws;
        wsa.current.onmessage = (event) => {
            const parseddata = JSON.parse(event.data);
            setMessageList(prev => [...prev, { sender: parseddata.username, message: parseddata.message, key: 2, group: parseddata.group }])
        }

        const getMessages = async () => {
            setMessageList([]);
            const response = await axios.post('http://127.0.0.1:8000/getchat', {
                group: groupName
            })
            if (response) {
                setMessageList(response.data.Message.message);
            }
            else {
                setMessageList([]);
            }
        }
        getMessages();
    }, [groupName])

    useEffect(() => {
        const getGroups = async () => {
            const response = await axios.post("http://127.0.0.1:8000/getgroup", {
                usermail: user
            })
            setGroupList(response.data.message);
        }
        getGroups();

        const getReqs = async () => {
            if (user) {
                console.log(user);
                const response = await axios.post("http://127.0.0.1:8000/getreqs", {
                    usermail: user
                })
                console.log(response.data.message);
                setRequestList(response.data.message);
            }

        }
        getReqs();

    }, [user])


    useEffect(() => {
        const getTasks = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/getassign');
                setTask(response.data.message);
            }
            catch (error) {
                console.log("Error fetching Tasks", error);
            }
        }
        getTasks();
    }, [])





    useEffect(() => {
        const saveChat = async () => {
            if (messageList.length == 0) return;
            const response = await axios.post('http://127.0.0.1:8000/savechat', {
                group: groupName,
                messages: messageList,
            })
        }
        saveChat();
    }, [messageList])


    function appendArr() {
        const message = document.querySelector('.inputt').value;
        if (!message.trim()) return;
        document.querySelector('.inputt').value = '';
        setMessageList(prev => [...prev, { sender: user, message: message, key: 3, group: groupName }]);
        const actualmess = JSON.stringify({ username: user, message: message, to: 'jram6269@gmail.com' });
        wsa.current.send(JSON.stringify({ message: message, username: user, group: groupName }));
    }

    const addModule = async () => {
        const assignment = prompt('Enter the assignment needed to be assigned');
        const person = prompt('Enter the name of the person');
        if (!assignment.trim() || !person.trim()) return;
        setTask(prev => [...prev, { task: assignment, person: person }]);
        try {
            const saveTask = await axios.post('http://127.0.0.1:8000/saveassign', {
                task: assignment,
                person: person
            });
        }
        catch (error) {
            console.log("Error Saving assignment: ", error);
        }
    }

    const deltask = async (key, task) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/deltask', {
                task: task
            })
            setTask(prev => prev.filter((_, i) => i !== key))
        }
        catch (error) {
            console.log("Error Deleting:", error);
        }
    }

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        if (messageList && messageList.length > 0) {
            const lastobj = messageList[messageList.length - 1];
            setLastMessage(lastobj.message);
        }
    }, [messageList])

    const createGroup = async () => {
        const groupName = prompt("Enter the name for the Group");
        if (!groupName.trim()) return;
        const saveGroup = await axios.post('http://127.0.0.1:8000/newchat', {
            username: user,
            group: groupName,
            member: [user]
        })
        if (saveGroup.data.code == 123) {
            alert(saveGroup.data.message);
            return;
        }
        else {
            setGroupList(prev => [...prev, { Group: groupName }]);
        }


    }

    const handleRequest = async (groupe) => {
        const response = await axios.post('http://127.0.0.1:8000/req', {
            username: user,
            group: groupe
        })

        document.querySelector('.search-nav').classList.toggle('active-nav');
        document.querySelector('.notification').classList.toggle('not-act');
        setTimeout(() => {
            document.querySelector('.notification').classList.toggle('not-act');
        }, 2000);
    }

    const reqCondition = async (name, condition, group) => {
        const response = await axios.post("http://127.0.0.1:8000/handreq", {
            username: name,
            group: group,
            response: condition
        })
        document.querySelector('.request-tab').classList.toggle('active-tab')
    }

    const leaveGroup = async () => {
        document.querySelector('.options').classList.toggle('act');
        const response = await axios.post("http://127.0.0.1:8000/exitgroup",{
            group: groupName,
            username: user
        });
        console.log(response);
    }


    return (
        <div className='parent-container'>
            <div className="notification">
                <h1>Request Sent!</h1>
                <div className="buttons">
                </div>
            </div>
            <div className="left-box">
                <div className="left-top">
                    <img src={logo} />
                    <h1>ThumbsUp</h1>
                    <button onClick={createGroup}><i class="fa-solid fa-plus"></i></button>
                </div>
                <div className="left-bottom">
                    <ul>
                        {groupList.map((element, key) => (
                            <li key={key} onClick={() => setGroupName(element.Group)} style={{ backgroundColor: groupName == element.Group ? '#383636' : '' }}>
                                <img src={img} />
                                <div className="txt">
                                    <h1 className='chat-name'>{element.Group}</h1>
                                    {groupName == element.Group && <p>{lastMessage}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
            <div className="center-box">
                <div className="center-top">
                    <div className="t-left">
                        {groupName && <img src={img} />}
                        <h1>{groupName}</h1>
                    </div>
                    <div className="t-right">
                        {groupName && <button><i class="fa-solid fa-phone"></i></button>}
                        <button onClick={() => document.querySelector('.request-tab').classList.toggle('active-tab')}><i class="fa-solid fa-envelope"></i> <span>{requestList.length}</span></button>
                        <button onClick={() => document.querySelector('.search-nav').classList.toggle('active-nav')}><i class="fa-solid fa-magnifying-glass"></i></button>
                        <button onClick={() => document.querySelector('.options').classList.toggle('act')}><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>

                </div>
                <div className="center-bottom">
                    <div className="options">
                         <p onClick={leaveGroup}>Delete Group</p>
                    </div>
                    <ul ref={scrollRef}>
                        {messageList.map((element, key) => (
                            element.group ? <li key={key} style={{ maxWidth: '50%', height: 'fit-content', background: 'transparent', padding: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: element.sender == user ? "#1db954" : 'white', color: 'white', listStyle: 'none', alignSelf: element.sender == user ? 'flex-end' : 'flex-start', marginLeft: element.sender == user ? 0 : 15, marginRight: element.sender == user ? 15 : 0 }}>{element.message}                         <p>{element.sender}</p></li> : ''
                        ))}
                    </ul>
                    <div className="input-box">
                        {groupName && <input className='inputt' type='text' placeholder='Enter your Message' onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                appendArr();
                            }
                        }}></input>}
                        {groupName && <button onClick={appendArr}><i class="fa-solid fa-paper-plane"></i></button>}
                    </div>
                </div>
            </div>
            <div className="right-box">
                <div className="right-top">
                    {user == 'jram6269@gmail.com' ? <button onClick={addModule}><i class="fa-solid fa-plus"></i></button> : ''}
                    <ul>
                        {task.map((element, key) => (
                            <li key={key} style={{ opacity: element.task ? 1 : 0 }}>Module:  <span>{element.task}</span> <br></br> Developer: <span>{element.person}</span></li>
                        ))}
                    </ul>
                </div>
                <div className="right-bottom">
                    <ul>
                        {task.map((element, key) => (
                            element.person == user ? <li key={key}>Your Module: <span>{element.task}</span>  <button onClick={() => deltask(key, element.task)}><i class="fa-solid fa-check"></i></button></li> : ''
                        ))}
                    </ul>
                </div>
            </div>
            <div className="search-nav">
                <h1>Search New Groups</h1>
                <input onChange={() => setSearchActivate(true)} placeholder="Enter your Group's name"></input>
                <ul>
                    {searchData.map((element, key) => (
                        <li key={key}>
                            <h1>{element.Group}</h1>
                            <button onClick={() => handleRequest(element.Group)}>Join</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="request-tab">
                <h1>Requests</h1>
                <ul>
                    {requestList &&
                        requestList.map((element, key) => (
                            <li key={key}>
                                <div className="txt">
                                    <h1>{element.username}</h1>
                                    <p>{element.group}</p>
                                </div>
                                <button onClick={() => {
                                    reqCondition(element.username, "accept", element.group)
                                    setRequestList(prev => prev.filter(item => item != element))
                                }}>Accept</button>
                                <button onClick={() => {
                                    reqCondition(element.username, "reject", element.group)
                                    setRequestList(prev => prev.filter(item => item != element))
                                }}>Reject</button>
                            </li>
                        ))
                    }

                </ul>
            </div>
        </div >

    )
}

export default Chat