import React , {useState} from "react";
import logo from "../images/voting-logo.png";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'
import axios from "axios";
import Cookies from 'universal-cookie';
import {Link} from "@mui/material";
import {useNavigate} from "react-router-dom";

const btn = {
    fontSize: '1.2vw',
    backgroundColor: '#45A29E',
    padding: '10px',
    width: '10vw',
    '&:hover': {
        backgroundColor: '#327e79'
    }
}


const input = {
    '.MuiInputBase-input': { fontSize: '1.5rem' },
    width: '15vw',
    height: '3vh',
    '.MuiInputLabel-root': {
        fontSize:'1.5rem'
    }
}
export const Login = () => {

    const [aadhaar , setAadhaar] = useState("")
    const [password , setPassword] = useState("")
    const navigator = useNavigate()

    function onLoginClick() {
        const form = new FormData()
        form.set("username" , aadhaar)
        form.set("password" , password)

        axios.post("http://localhost:8000/tokenVoter" , form).then(res => {if(res.status === 200){const cookie = new Cookies(); cookie.set('voter_token' , res.data.access_token , {maxAge : 300}); cookie.set("wallet" , res.data.wallet_id , {maxAge : 300}); console.log(res.data); navigator("/vote");}})
    }

    return(
        <>
        <div id="login-mid-box" >
            <div id="login-left">
                <img src={logo} alt="logo"/>
                <p>Votechain <br/> The Future of Voting</p>
            </div>

            <div id="login-right">
                <p>Login</p>
                <TextField  sx={input} label="Aadhaar" variant="standard" type="number" id="aadhaar" onChange={e => setAadhaar(e.target.value)}/>
                <TextField  sx={input} label="Password" variant="standard" type="password" id="password" onChange={e => setPassword(e.target.value)}/>

                <div id="login-small-buttons">
                    <Link href={"/voterRegister"}><Button variant='text'  id='login-reg-btn'>Register</Button></Link>
                    <Link href={"/adminLogin"}><Button variant='text' id='login-admin-btn'>Admin Login</Button></Link>
                </div>

                <Button variant="contained" size="14px" id="login-button" type="submit" sx={btn} onClick={onLoginClick}>
                    Login
                </Button>
            </div>
        </div>
        </>
    )
}
