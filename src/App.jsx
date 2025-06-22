import { useEffect } from 'react'
import './App.css'
import logo from './assets/react.svg'
import axios from 'axios'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import Forgot from './Forgot'


function Lander() {
   const navigate = useNavigate();
   const fetchData = async () => {
      const userMail = document.querySelector('.email').value;
      if (!userMail.trim()) { alert('Please fill in all fields'); return; }
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

   return (
      <div className="main-page">
         <div className="login-box">
            <div className="login-box-top">
               <img src={logo} />
               <h1>Login in to DevChat</h1>
               <button>Login With Google</button>
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
         </Routes>
      </Router>
   )
}

export default App
