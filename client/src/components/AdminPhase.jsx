import Button from "@mui/material/Button";
import {useEffect, useState} from "react";
import Cookies from "universal-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Container} from "@mui/material";
import {AdminNav} from "./AdminNav";

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
export const AdminPhase = () => {

    const[phase, setPhase] = useState("");
    const cookie = new Cookies()
    const jwt = cookie.get("admin_token")
    const navigator = useNavigate()

    useEffect( () => {
        axios.get("http://localhost:8000/getPhase").then(res=> {if(res.status === 200){setPhase(res.data.phase)}
    })},[])

    function changePhase(){
        console.log(jwt.toString())
        const form = new FormData()
        form.set("token_admin" , jwt)
        form.set("phase", (phase+1))
        axios.post("http://localhost:8000/changePhase", form).then(res => {
            if(res.status === 200 ){
                console.log(phase);
            }
        })
    }

    let phaseName
    console.log(phase)

    if(phase ===0){
        phaseName = "Registration Phase"
    }
    else if(phase === 1){
        phaseName = "Voting Phase"
    }
    else if(phase === 2){
        phaseName = "Results Phase"
    }

    console.log(phaseName);
    return(
    <div className='admin-page'>
        <AdminNav />
        <Container id="phase-cont">
            <p>Current Phase : {phaseName}</p>
            <Button sx={btn} onClick={changePhase}>Change Phase</Button>
        </Container>
    </div>
        )
}