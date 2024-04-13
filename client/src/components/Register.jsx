import React, {useState} from 'react'
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button"
import axios from "axios";

const btn = {
    fontSize : '2rem',
    backgroundColor:'#2b9d82',
    '&:hover': {
        backgroundColor:'#2d8d79'
    }
}


const input = {
    '.MuiInputBase-input': { fontSize: '1.5rem' },
    '.MuiInputLabel-root': {
        fontSize:'1.5rem'
    }
}


export const Register = () =>  {

    const [FirstName , setFirstName] = useState("")
    const [LastName , setLastName] = useState("")
    const [Day ,  setDay] = useState("")
    const [Month, setMonth] = useState("")
    const [Year , setYear] = useState("")
    const [email , setEmail] = useState("")
    const [aadhaar , setAadhaar] = useState("")

    function onSubmitRegisterForm() {
        const form = new FormData()
        form.set("first_name" , FirstName)
        form.set("last_name" , LastName)
        form.set("day" , parseInt(Day))
        form.set("month" , parseInt(Month))
        form.set("year" , parseInt(Year))
        form.set("email" , email)
        form.set("aadhaar" , parseInt(aadhaar))
        axios.post("http://localhost:8000/createVoter" , form).then(res => {console.log(res.data , res.status); })
    }

    return (
        <div id='reg-background'>

    <div id="reg-center-box">

        <div id="reg-Top-text">
            <p>Sign up</p>
        </div>

        <div id="reg-Form-top">

            <div id="reg-Form-top-left">
                <TextField className="Text-input" sx={input} variant='standard' type="text"  id="First-name" label="First Name" required onChange={(e) => setFirstName(e.target.value)}/>
                <TextField className="Text-input" sx={input} variant='standard' type="date"  id="DOB" label="Date of Birth"  onChange={(e) => {const strDate = e.target.value.split("-"); setDay(strDate[2]); setMonth(strDate[1]); setYear(strDate[0]) }}/>
            </div>

            <div id="reg-Form-top-right">
                <TextField className="Text-input" sx={input} variant='standard' type="text" id="Last-name" label="Last Name" required onChange={(e) => setLastName(e.target.value)}/>
                <TextField className="Text-input" sx={input} variant='standard' type="number" id="aadhaar" label="Aadhar number" required onChange={(e) => setAadhaar(e.target.value)}/>
            </div>
        </div>

        <div id="reg-Form-bottom">

            <TextField className="Text-input2" sx={input} variant='standard' type="text" id="Email" label="Email Address" required onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <Button id="Register-button" type={"submit"} variant='contained' sx={btn} onClick={onSubmitRegisterForm}>Register</Button>
    </div>
        </div>
    )
}
