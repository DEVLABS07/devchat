import { useEffect, useRef, useState } from 'react'
import './Chat.css'
import Logo from './assets/logo2.jpg'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const Chat = () => {
    const [user, setUser] = useState('');
    const [task, setTask] = useState([]);
    const [groupChange, setgroupChange] = useState(false);
    const [requestList, setRequestList] = useState([]);
    const [Admin, setAdmin] = useState('');
    const [members, setMembers] = useState([]);
    const wsa = useRef(null);
    const [lastMessage, setLastMessage] = useState();
    const [imgView, setImgView] = useState('');
    const [activateimgView, setActivateImgView] = useState(false);
    const [messageList, setMessageList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [groupName, setGroupName] = useState();
    const [searchData, setSearchData] = useState([]);
    const [pinnedlist, setPinnedlist] = useState([]);
    const [logo, setLogo] = useState();
    const [searchActivate, setSearchActivate] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const json = localStorage.getItem('token');
    const [img, setImg] = useState();


    useEffect(() => {
        const token = localStorage.getItem('token');
        const parsedjwt = jwtDecode(token);
        setUser(parsedjwt.sub);
        console.log(parsedjwt.sub);
        if (!token) {
            navigate('/login');
        }
    }, [])

    useEffect(() => {
        const fetchGroups = async () => {
            if (searchActivate) {
                const response = await axios.get("http://127.0.0.1:8000/allgroups",
                    {
                        headers: {
                            Authorization: `${json}`
                        }
                    }
                );
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


        wsa.current.onmessage = async (event) => {
            const parseddata = JSON.parse(event.data);
            if (!parseddata.message) return;
            setMessageList(prev => [...prev, {
                sender: parseddata.username,
                message: parseddata.message,
                key: 2,
                group: parseddata.group
            }]);

        }


        const getMessages = async () => {
            setMessageList([]);
            if (!groupName) return;
            const response = await axios.post('http://127.0.0.1:8000/getchat', {
                group: groupName
            },
                {
                    headers: {
                        Authorization: `${json}`
                    }
                }
            )
            if (response) {
                setMessageList(response.data.Message.message);
                setgroupChange(true);
            }
            else {
                setMessageList([]);
            }
        }
        getMessages();

        const getMembers = async () => {
            if (!groupName) return;
            const repsonse = await axios.post("http://127.0.0.1:8000/getMembers", {
                group: groupName
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
            setMembers(repsonse.data.message.Members);
            setAdmin(repsonse.data.message.Admin);
        }
        getMembers();


        const getTasks = async () => {
            try {
                if (!groupName) return;
                const response = await axios.post('http://127.0.0.1:8000/getassign', { group: groupName }, {
                    headers: {
                        Authorization: `${json}`
                    }
                });
                setTask(response.data.message);
            }
            catch (error) {
                console.log("Error fetching Tasks", error);
            }
        }
        getTasks();


        const getpinned = async () => {
            try {
                const response = await axios.post('http://127.0.0.1:8000/getpinned', {
                    group: groupName
                }, {
                    headers: {
                        Authorization: `${json}`
                    }
                })
                if (!response.data.message) {
                    setPinnedlist([]);
                    return
                }
                setPinnedlist(response.data.message)
            } catch (error) {
                console.log(error);
            }
        }
        getpinned();

        const getLogo = async () => {
            const response = await axios.post('http://127.0.0.1:8000/logo', {
                group: groupName
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
            setLogo(response.data.Logo);
        }
        getLogo();




        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };

    }, [groupName])



    useEffect(() => {
        if (groupList.length > 0)
            setGroupName(groupList[0].Group)
    }, [groupList])

    useEffect(() => {
        const getGroups = async () => {
            const response = await axios.post("http://127.0.0.1:8000/getgroup", {
                usermail: user
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
            console.log(user);
            console.log(response);
            setGroupList(response.data.message);
        }
        getGroups();

        const getReqs = async () => {
            if (user) {
                const response = await axios.post("http://127.0.0.1:8000/getreqs", {
                    usermail: user
                }, {
                    headers: {
                        Authorization: `${json}`
                    }
                })
                setRequestList(response.data.message);
            }

        }
        getReqs();

    }, [user])








    useEffect(() => {
        if (groupChange) {
            setgroupChange(false);
            return;
        }
        const saveChat = async () => {
            if (messageList.length == 0) return;
            const response = await axios.post('http://127.0.0.1:8000/savechat', {
                group: groupName,
                messages: messageList,
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
        }
        saveChat();
    }, [messageList])


    function appendArr() {
        const message = document.querySelector('.inputt').value;
        if (!message.trim()) return;
        setMessageList(prev => [...prev, { sender: user, message: message, key: 3, group: groupName, type: 'msg' }]);
        wsa.current.send(JSON.stringify({ message: message, username: user, group: groupName, type: message ? 'txt' : 'img' }));
        document.querySelector('.inputt').value = '';
    }

    const addModule = async () => {
        const assignment = prompt('Enter the assignment needed to be assigned');
        const person = prompt('Enter the name of the person');
        if (!assignment.trim() || !person.trim()) return;
        setTask(prev => [...prev, { task: assignment, person: person }]);
        try {
            const saveTask = await axios.post('http://127.0.0.1:8000/saveassign', {
                task: assignment,
                person: person,
                group: groupName
            }, {
                headers: {
                    Authorization: `${json}`
                }
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
            }, {
                headers: {
                    Authorization: `${json}`
                }
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
        } else {
            setLastMessage('');
        }
    }, [messageList])








    const createGroup = async () => {
        document.getElementById('group').classList.toggle('slide-bottom');
        const groupName = document.getElementById('groupname').value;
        if (!groupName.trim()) return;
        const saveGroup = await axios.post('http://127.0.0.1:8000/newchat', {
            username: user,
            logo: img ? img : 'null',
            group: groupName,
            member: [user]
        }, {
            headers: {
                Authorization: `${json}`
            }
        })
        if (saveGroup.data.code == 123) {
            alert(saveGroup.data.message);
            return;
        }
        else {
            setGroupList(prev => [...prev, { Group: groupName, Logo: img }]);
        }
    }

    const handleRequest = async (groupe) => {
        const json = localStorage.getItem('token');
        const response = await axios.post('http://127.0.0.1:8000/req', {
            username: user,
            group: groupe
        },
            {
                headers: {
                    Authorization: `${json}`
                }
            }
        )

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
        }, {
            headers: {
                Authorization: `${json}`
            }
        })
        document.querySelector('.request-tab').classList.toggle('active-tab')
    }

    const leaveGroup = async () => {
        document.querySelector('.options').classList.toggle('act');
        const response = await axios.post("http://127.0.0.1:8000/exitgroup", {
            group: groupName,
            username: user
        }, {
            headers: {
                Authorization: `${json}`
            }
        });
    }
    const savepinned = async (user, message) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/savepinned', {
                group: groupName,
                message: message,
                username: user
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
            setPinnedlist(prev => [{ message: message, username: user, group: groupName }, ...prev]);
        } catch (error) {
            console.error('Error', error);
        }
    }

    const getSearch = async () => {
        try {
            const query = document.getElementById('searchinput').value;
            if (!query.trim()) return;
            const response = await axios.post('http://127.0.0.1:8000/searchgroup', {
                query: query
            }, {
                headers: {
                    Authorization: `${json}`
                }
            })
            if (response.data.results == 0) {
                alert("No Groups are availabe with the Provided Name")
            }
            else {
                setSearchData(response.data.results);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post("http://localhost:8000/upload", formData, {
            headers: {
                Authorization: `${json}`
            }
        });
        setMessageList(prev => [...prev, {
            group: groupName,
            sender: user,
            message: `${res.data.url}`,
            key: 3,
            type: 'img'
        }])
        e.target.value = null;
    };

    const handleUploadimg = async (e) => {
        const file = e.target.files[0];
        try {
            if (!file) {
                setImg(null);
                return;
            }
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post("http://localhost:8000/upload", formData, {
                headers: {
                    Authorization: `${json}`
                }
            });
            setImg(res.data.url);

        } catch (err) {
            console.error("Upload failed", err);
        }
    }

    const handleImgView = (a) => {
        setImgView(a);
        setActivateImgView(true);
    }

    return (
        <div className='parent-container'>
            <div className="notification">
                <h1>Request Sent!</h1>
            </div>
            {activateimgView && <div className="img-view"><button onClick={() => setActivateImgView(false)}><i class="fa-solid fa-xmark"></i></button><img src={imgView}></img></div> }
            <div className="new-group" id='group'>
                <h1>Name of the Group</h1>
                <input id='groupname' placeholder="Enter your Group's Name" type='text'></input>
                <input
                    id="img-upload"
                    type="file"
                    onChange={handleUploadimg}
                />
                <button onClick={createGroup}>Create Group</button>
            </div>
            <div className="left-box">
                <div className="left-top">
                    <img src={Logo} />
                    <button onClick={() => document.getElementById('group').classList.toggle('slide-bottom')}><i class="fa-solid fa-plus"></i></button>
                </div>
                <div className="left-bottom">
                    <ul>
                        {groupList ? groupList.map((element, key) => (
                            <li key={key} onClick={() => setGroupName(element.Group)} style={{ backgroundColor: groupName == element.Group ? '#383636' : '' }}>
                                <img src={element.Logo == 'null' ? Logo : element.Logo} />
                                <div className="txt">
                                    <h1 className='chat-name'>{element.Group}</h1>
                                    {groupName == element.Group && <p>{lastMessage}</p>}
                                </div>
                            </li>
                        )) : ''}
                    </ul>
                </div>
            </div>
            <div className="center-box">
                <div className="center-top">
                    <div className="t-left">
                        {groupName && <img src={logo == 'null' ? Logo : logo} />}
                        <h1>{groupName}</h1>
                    </div>
                    <div className="t-right">
                        <button onClick={() => document.querySelector('.request-tab').classList.toggle('active-tab')}><i class="fa-solid fa-envelope"></i> <span>{requestList.length}</span></button>
                        <button onClick={() => document.querySelector('.search-nav').classList.toggle('active-nav')}><i class="fa-solid fa-magnifying-glass"></i></button>
                        {groupName && <button onClick={() => document.querySelector('.options').classList.toggle('act')}><i class="fa-solid fa-ellipsis-vertical"></i></button>}                       </div>

                </div>
                <div className="center-bottom">
                    <div className="options">
                        <p onClick={leaveGroup}>Delete Group</p>
                        <p>Group Info <span>Admin {members.map(element => (`${element == Admin ? `\n${element}\n Members` : `\n${element}`}`))}</span></p>
                    </div>
                    <ul ref={scrollRef}>
                        {messageList.map((element, key) => (
                            element.group ? element.type == 'img' ? <img onClick={() => handleImgView(element.message)} style={{ alignSelf: element.sender == user ? 'flex-end' : 'flex-start', marginLeft: element.sender == user ? 0 : 15, marginRight: element.sender == user ? 15 : 0, zIndex: 2000 }} src={element.message} id='img-chat'></img> : <li key={key} style={{ maxWidth: '50%', height: 'fit-content', background: 'transparent', padding: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: element.sender == user ? "#1db954" : 'white', color: 'white', listStyle: 'none', alignSelf: element.sender == user ? 'flex-end' : 'flex-start', marginLeft: element.sender == user ? 0 : 15, marginRight: element.sender == user ? 15 : 0 }}>{element.message}                         <p>{element.sender}</p><span onClick={() => savepinned(element.sender, element.message)}><i class="fa-solid fa-map-pin"></i></span></li> : ''
                        ))}
                    </ul>
                    <div className="input-box">
                        {groupName && <input className='inputt' type='text' placeholder='Enter your Message' onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                appendArr();
                            }
                        }}></input>}
                        {groupName && <button onClick={appendArr}><i class="fa-solid fa-paper-plane"></i></button>}
                        <label htmlFor="file-upload" className="custom-file-upload"><i class="fa-solid fa-file"></i></label>
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleUpload}
                            style={{ display: "none" }}
                        />                    </div>
                </div>
            </div>
            <div className="right-box">
                <div className="right-top">
                    <h1>{groupName}</h1>
                    {user == Admin ? <button className='right-button' onClick={addModule}><i class="fa-solid fa-plus"></i></button> : ''}
                    <ul>
                        {task.map((element, key) => (
                            <li key={key} style={{ opacity: element.task ? 1 : 0 }}>Module:  <span>{element.task}</span> <br></br> Developer: <span>{element.person}</span> {element.person == user ? <button className='complete' onClick={() => deltask(key, element.task)}><i class="fa-solid fa-check"></i></button> : ''}</li>
                        ))}
                    </ul>
                </div>
                <div className="right-bottom">
                    {groupName ? <h1>Pinned Messages - {groupName}</h1> : null}
                    <ul>
                        {pinnedlist.map((element, key) => (
                            <li key={key}>{element.message}<br /><span>{element.username}</span></li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="search-nav">
                <h1>Search New Groups</h1>
                <input id='searchinput' onChange={() => setSearchActivate(true)} placeholder="Enter your Group's name" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        getSearch();
                    }
                }}></input>
                <ul>
                    {searchData.map((element, key) => (
                        <li key={key}>
                            <h1>{element.Group}</h1>
                            {element.Admin == user || element.Members.includes(user) ? '' : <button onClick={() => handleRequest(element.Group)}>Join</button>}
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
            <div className="min-page">
                <h1>Oh Unfortunately, ThumbsUp is not available for Mobiles yet.</h1>
            </div>
        </div >

    )
}

export default Chat