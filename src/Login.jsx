import { useEffect } from 'react'
import './App.css'
import logo from './assets/react.svg'
import axios from 'axios'
import './login.css'
import { useState } from 'react';

function Login() {



    const [login, setLogin] = useState('');
    useEffect(() => {
        const storedLogin = localStorage.getItem('login');
        if (storedLogin == 'true') {
            setLogin('Login');
        }else{
            setLogin('Sign Up');
        }
    }, []);
    
    const fetchData = async () => {
        const usermail = document.querySelector('.email').value;
        const password = document.querySelector('.password').value;
        if (!usermail.trim() || !password.trim()) { 
            alert('Please fill in all fields'); 
            return; 
        }
        try{
            const response = await axios.post('http://127.0.1:8000/login', {
                usermail: usermail,
                password: password
            })        }
        catch(error){
            console.log('Error fetching data:', error);

        }
    }





    return (
        <div className="main-page">
            <div className="login-box">
                <div className="login-box-top">
                    <img src={logo} alt="React Logo" />
                    <h1>{login} to DevChat</h1>
                    <hr/>
                </div>
                <div className="login-box-bottom">
                    <input className='email' type="email" placeholder="Email" />
                    <input className='password' type="password" placeholder="Password" />
                    <button onClick={fetchData}>{login}</button>
                </div>
            </div>
        </div>
    )
}

export default Login
