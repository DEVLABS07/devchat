import { useEffect } from 'react'
import './App.css'
import logo from './assets/logo.jpg'
import axios from 'axios'
import './login.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    useEffect(() => {
        const storedLogin = localStorage.getItem('login');
        if (storedLogin == 'true') {
            setLogin('Login');
        } else {
            setLogin('Sign Up');
        }
    }, []);

    const fetchData = async () => {
        const usermail = document.querySelector('.email').value;
        const password = document.querySelector('.password').value;
        if (!usermail.trim() || !password.trim()) {
            if(!usermail.trim()) {
            const useremail = document.querySelector('.email');
            useremail.style.border = '1px solid red';
            }
            if(!password.trim()) {
            const userpassword = document.querySelector('.password');
            userpassword.style.border = '1px solid red';
            }
            return;
        }
        try {
            const response = await axios.post('http://127.0.1:8000/login', {
                usermail: usermail,
                password: password
            })
            console.log('Response:', response.data);
            if(response.data.message == 'Login successful.'){
                localStorage.setItem('user', usermail);
                navigate('/chat');
            }
            else{
                alert('Invalid Credentials');
            }
        }
        catch (error) {
            console.log('Error fetching data:', error);

        }
    }


    return (
        <div className="main-page">
            <div className="login-box">
                <div className="login-box-top">
                    <img src={logo} alt="React Logo" />
                    <h1>{login} to ThumbsUp</h1>
                    <hr />
                </div>
                <div className="login-box-bottom">
                    <input className='email' type="email" placeholder="Email" autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false" />
                    <input className='password' type="password" placeholder="Password" autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false" />
                {login == 'Login'? <p onClick={() => navigate('/forgot')}>Forgot Password?</p>:''}   
                    <button onClick={fetchData}>{login}</button>
                </div>
            </div>
        </div>
    )
}

export default Login
