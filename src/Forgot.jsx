import './forgot.css'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const Forgot = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState();
    useEffect(() => {
        if (otp) {
            const otpInput = document.querySelector('.otp');
            otpInput.classList.toggle('otp-active');
        }
    }, [otp]);



    const sendOTP = async () => {
        if (otp) {
            handleOTP();
            return;
        }
        const email = document.querySelector('input[type="email"]').value;
        if (!email) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/otp', { usermail: email });
            alert(response.data.message);
            setOtp(response.data.otp);
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Please try again.");
        }
    }


    const handleOTP = () => {
        const enteredOtp = document.querySelector('.otp').value;

        if (enteredOtp == otp) {
            document.querySelector('.passsword').classList.toggle('password-active');
            const passwordInput = document.querySelector('.passsword').value;
            if (passwordInput) {
                changePassword();
            } else {
                alert("Please enter a new password.");
            }
        } else {
            alert("Invalid OTP. Please try again.");
        }
    }

    const changePassword = async () => {
        const newPassword = document.querySelector('.passsword').value;
        const usermail = document.querySelector('input[type="email"]').value;
        if (!usermail) {
            alert("Please enter your email address.");
            return;
        }
        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }
        const sendNewpass = await axios.post('http://127.0.0.1:8000/newpass', { usermail: usermail, password: newPassword });
        console.log("Response from server:", sendNewpass.data);
        if (sendNewpass.data.message == 'Password updated successfully.') {
            alert("Password changed successfully!");
            navigate('/login');
        }
        else {
            alert("Failed to change password. Please try again.");
        }

        console.log("New password set:", newPassword);
        alert("Password changed successfully!");
    }

    return (
        <div className='main-box'>
            <div className='forgot-box'>
                <h1><span>Forgot</span> Password</h1>
                <p>Enter your email address to reset your password.</p>
                <input type='email' placeholder='Email' required autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false" />
                <input className='otp' type='number' placeholder='OTP' requiredautoComplete="off" autoCorrect="off" spellCheck="false" />
                <input className='passsword' type='password' placeholder='New Password' required autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false" />
                <button type='submit' onClickCapture={sendOTP}>{otp ? "Enter" : "Send OTP"}</button>
                <p className='back-to-login'>Remembered your password? <a href='/login'>Back to Login</a></p>
            </div>
        </div>
    )
}

export default Forgot