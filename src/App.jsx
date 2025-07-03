import { use, useEffect } from 'react'
import './App.css'
import logo from './assets/logo2.jpg'
import axios from 'axios'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import Forgot from './Forgot'
import Chat from './Chat'


function Lander() {
   const navigate = useNavigate();

   useEffect(() => {
      const json = localStorage.getItem("token");
      if(json){
         navigate('/chat');
      }
   },[])
   const fetchData = async () => {
      const userMail = document.querySelector('.email').value;
      if (!userMail.trim() || !userMail.includes('@')) {
         const useremail = document.querySelector('.email');
         useremail.focus();
         useremail.placeholder = 'Please enter your email';
         useremail.style.border = '1px solid red';
         return;
      }
      try {
         const response = await axios.post('http://127.0.0.1:8000/user', {
            usermail: userMail,
         })
         console.log(response.data);
         if (response.data.message == 'User already exists.') {
            localStorage.setItem('login', 'true');
            navigate('/login');
         } else {
            localStorage.setItem('login', 'false');
            navigate('/login');
         }
      }
      catch (error) {
         console.error('Error fetching data:', error);
      }
   }

   function signUp() {
      localStorage.setItem('login', 'false');
      navigate('/login');
   }

   return (
      <div className="main-page">
         <div className="login-box">
            <div className="login-box-top">
               <img src={logo} />
               <h1>Login in to ThumbsUp</h1>
               <button onClick={signUp}>Sign Up</button>
               <hr></hr>
            </div>
            <div className="login-box-bottom">
               <input className='email' type="email" placeholder="Email" autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false" />
               <button onClick={fetchData}>Login</button>
            </div>

         </div>
      </div>
   )
}

function App() {

   return (
      <Router>
         <Routes>
            <Route path="/" element={<Lander />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/chat" element={<Chat />} />
         </Routes>
      </Router>
   )
}

export default App
