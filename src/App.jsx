import { useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {

        const fetchData = async () => {
         const userMail = document.querySelector('.email').value;
         const password = document.querySelector('.password').value;
         if(!userMail.trim() || !password.trim()){ alert('Please fill in all fields'); return; }
            try{
               const response = await axios.post('http://127.0.0.1:8000/login',{
                  usermail: userMail ,
                  password: password
               })
               console.log(response.data);
            }
            catch(error){
               console.error('Error fetching data:', error);
            }
         }

  return (
     <div className="main-page">
         <nav><h1>Login</h1></nav>
         <div className="login-box">
            <input className='email' type="email" placeholder="Username" />
            <input className='password' type="password" placeholder="Password" />
            <button onClick={fetchData}>Login</button>
         </div>
     </div>       
  )
}

export default App
