import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import Cookies from "universal-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Container} from "@mui/material";
import {AdminNav} from "./AdminNav";
import TextField from "@mui/material/TextField";

export const AdminVerify = () => {
    const [aadhaar, setAadhaar] = useState(0)

    const cookie = new Cookies()
    const jwt = cookie.get("admin_token")

    const navigator = useNavigate()

    function onClick() {
        const form = new FormData()
        form.set("aadhaar" , aadhaar)
        form.set("token_admin" , jwt)

        axios.post("http://localhost:8000/verifyVoter" , form).then(res => {if(res.status === 200){ console.log("candidate added");}})
    }


    return(
        <div className='admin-page'>
            <AdminNav />
            <Container id="voter-form">
                <TextField  sx={input} variant='standard' type="number"  label="Voter Aadhaar Number" required onChange={e => setAadhaar(e.target.value)}/>

                <Button id="admin-login-button" variant='contained' sx={btn} onClick={onClick}>Verify Voter</Button>
            </Container>
        </div>
    )
}

const btn = {
    fontSize : '1.6rem',
    padding : '15px',
    color: 'white',
    backgroundColor:'#c3073f',
    '&:hover': {
        backgroundColor:'#9d0933'
    }
}

const btn2 = {
    fontSize : '1.4rem',
    padding : '15px',
    color: 'white',
    marginRight: '10px',
    '&:hover': {
        backgroundColor:'#9d0933'
    }
}

const input = {
    '.MuiInputBase-input': { fontSize: '1.5rem' },
    backgroundColor: 'white',
    padding: 1,
    borderRadius: 2,
    width:'18vw',
    '.MuiInputLabel-root': {
        fontSize:'1.5rem',
        padding:1,
    }
}