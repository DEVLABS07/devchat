import { useEffect, useRef, useState } from 'react'
import './Chat.css'
import img from './assets/dp01.jpg'
import logo from './assets/logo.jpg'
import axios from 'axios'

const Chat = () => {
    const [user, setUser] = useState('');
    const [task, setTask] = useState([{}]);
    const wsa = useRef(null);
    const [messageList, setMessageList] = useState([]);
    useEffect(() => {
        const ws = new WebSocket(`http://127.0.0.1:8000/ws`);
        wsa.current = ws;
        wsa.current.onmessage = (event) => {
            const parseddata = JSON.parse(event.data);
            console.log(parseddata.username);
            setMessageList(prev => [...prev, { sender: parseddata.username, message: parseddata.message, key: 2 }])
        }
        const username = localStorage.getItem('user');
        setUser(username);
    }, [])

    useEffect(() => {
        const getTasks = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/getassign');
                console.log(response.data.message);
                setTask(response.data.message);
            }
            catch (error) {
                console.log("Error fetching Tasks", error);
            }
        }
        getTasks();
    }, [])


    function appendArr() {
        const message = document.querySelector('.inputt').value;
        if (!message.trim()) return;
        document.querySelector('.inputt').value = '';
        setMessageList(prev => [...prev, { sender: user, message: message, key: 3 }]);
        const actualmess = JSON.stringify({ username: user, message: message, to: 'jram6269@gmail.com' });
        wsa.current.send(JSON.stringify({ message: message, username: user }));
    }

    const addModule = async () => {
        const assignment = prompt('Enter the assignment needed to be assigned');
        const person = prompt('Enter the name of the person');
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
    
    const deltask = async( key, task ) => {
        try{
          const response = await axios.post('http://127.0.0.1:8000/deltask',{
            task: task
          })
          setTask(prev => prev.filter((_, i) => i !== key))
        }
        catch(error){
          console.log("Error Deleting:",error);
        }
    }


    return (
        <div className='parent-container'>
            <div className="left-box">
                <div className="left-top">
                    <img src={logo} />
                    <h1>Thumbs Up</h1>

                </div>
                <div className="left-bottom">
                    <ul>
                        <li><img src={img} /><h1 className='chat-name'>DevLabs</h1></li>
                    </ul>
                </div>

            </div>
            <div className="center-box">
                <div className="center-top">
                    <div className="t-left">
                        <img src={img} />
                        <h1>Dev Labs</h1>
                    </div>
                    <div className="t-right">
                        <button><i class="fa-solid fa-phone"></i></button>
                    </div>

                </div>
                <div className="center-bottom">
                    <ul>
                        {messageList.map((element, key) => (
                            <li key={key} style={{ maxWidth: '50%', height: 'fit-content', background: 'transparent', padding: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: element.sender == user ? "#1db954" : 'white', color: 'white', listStyle: 'none', alignSelf: element.sender == user ? 'flex-end' : 'flex-start', marginLeft: element.sender == user ? 0 : 15, marginRight: element.sender == user ? 15 : 0 }}>{element.message}                         <p>{element.sender}</p></li>
                        ))}
                    </ul>
                    <div className="input-box">
                        <input className='inputt' type='text' placeholder='Enter your Message' onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                appendArr();
                            }
                        }}></input>
                        <button onClick={appendArr}><i class="fa-solid fa-paper-plane"></i></button>
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
                            element.person == user ? <li key={key}>Your Module: <span>{element.task}</span>  <button onClick={ () => deltask(key, element.task)}><i class="fa-solid fa-check"></i></button></li> : ''
                        ))}
                    </ul>
                </div>
            </div>
        </div >
    )
}

export default Chat