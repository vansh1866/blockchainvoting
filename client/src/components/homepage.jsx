import React from "react";
import homeBackground from "../images/homepage.avif";
import Button from "@mui/material/Button";
import {Link} from "@mui/material";
import Logo from "../images/voting-logo.png"

const btn = {
    fontSize : '2rem',
    backgroundColor:'#2b9d82',
    '&:hover': {
        backgroundColor:'#2d8d79'
    }
}

export const Homepage = () => {
    return (
        <div className="homepage">
            <img src={homeBackground} alt='background image' id="home-bg-img"/>
            <div className='home-right'>
                <div id='home-content'>
                    <img src={Logo} alt="logo" id="home-logo" />
                    <h4 id="home-text"><strong>VOTECHAIN</strong><br/>Democracy meets Technology</h4>
                </div>
                <div id="home-buttons">
                <Link href={"/voterLogin"}><Button id='home-login-btn' variant="contained" sx={btn}>Login</Button></Link>
                <Link href={"/voterRegister"} ><Button id='home-register-btn' variant='contained' sx={btn}>Register</Button></Link>
                </div>

            </div>
        </div>
    )
}