import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import Cookies from "universal-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Container} from "@mui/material";
import {AdminNav} from "./AdminNav";
import TextField from "@mui/material/TextField";

export const AdminAddCandidate = () => {
    const [name, setName] = useState("")
    const [photo, setPhoto] = useState("")
    const [partyName, setPartyName] = useState("")

    const cookie = new Cookies()
    const jwt = cookie.get("admin_token")

    const navigator = useNavigate()

    const[Candidates, setCandidates] = useState([])

    useEffect( () => {
        axios.get("http://localhost:8000/allCandidates").then(res => {if (res.status === 200){setCandidates(res.data.candidates)}})
    }, [])

    function onClick() {
        const form = new FormData()
        form.set("name" , name)
        form.set("party_photo_url" , photo)
        form.set("party_name" , partyName)
        form.set("token_admin" , jwt)

        axios.post("http://localhost:8000/addCandidate" , form).then(res => {if(res.status === 200){ console.log("candidate added");}})
    }


    return(
    <div className='admin-page'>
        <AdminNav />
        <Container id="cand-form">
            <TextField  sx={input} variant='standard' type="text"  label="Candidate Name" required onChange={e => setName(e.target.value)}/>
            <TextField  sx={input} variant='standard' type="text"  label="Party Photo" required onChange={e => setPhoto(e.target.value)}/>
            <TextField  sx={input} variant='standard' type="text"  label="Party Name" required onChange={e => setPartyName(e.target.value)}/>

            <Button id="admin-login-button" variant='contained' sx={btn} onClick={onClick}>Add Candidate</Button>
            <h1>Current candidates</h1>
        </Container>
        <Container id='voting-cont'>
            {
                Candidates.map((element, index) => {
                    return (
                        <div className='card2' key={index}>
                            <img src={element.party_photo_url} alt="candidate symbol" className='card2-img'/>
                            <div className='card2-content'>
                                <p>{element.name}</p>
                            </div>
                        </div>
                    )
                })
            }

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
    '.MuiInputBase-input': { fontSize: '1.5rem', color: 'white'},
    padding: 1,
    borderRadius: 2,
    width:'18vw',
    color: 'white',
    '.MuiInputLabel-root': {
        fontSize:'1.5rem',
        padding:1,
        color: 'white'
    }
}