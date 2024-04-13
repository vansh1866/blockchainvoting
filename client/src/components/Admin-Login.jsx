import React, {useState} from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import Cookies from "universal-cookie";
import Link from "@mui/material";
import {useNavigate} from "react-router-dom";

const btn = {
    fontSize : '2rem',
    backgroundColor:'#c3073f',
    '&:hover': {
        backgroundColor:'#9d0933'
    }
}

const input = {
    '.MuiInputBase-input': { fontSize: '1.5rem' },
    width:'18vw',
    '.MuiInputLabel-root': {
        fontSize:'1.5rem'
    }
}

export const AdminLogin = () => {

    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const navigator = useNavigate()

    function onLoginClick() {
        const form = new FormData()
        form.set("username" , email)
        form.set("password" , password)

        axios.post("http://localhost:8000/tokenAdmin" , form).then(res => {if(res.status === 200){const cookie = new Cookies(); cookie.set('admin_token' , res.data.access_token , {maxAge : 30 * 60}); navigator("/admin")}})
    }

    return(
        <div id='admin-login-background'>
            <div id='admin-login-center-box'>

                <div id="admin-login-title">
                    <p>Admin Login</p>
                </div>

                <TextField  sx={input} variant='standard' type="text" id="admin-uname" label="Username" required onChange={e => setEmail(e.target.value)}/>
                <TextField  sx={input} variant='standard' type="password" id="admin-pass" label="Password" required onChange={e => setPassword(e.target.value)}/>

                <Button id="admin-login-button" variant='contained' sx={btn} onClick={onLoginClick}>Login</Button>

            </div>
        </div>
    )
}