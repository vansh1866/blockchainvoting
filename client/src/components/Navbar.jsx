import React from "react";
import Logo from "../images/voting-logo.png";
import Button from "@mui/material/Button";
import {Link} from "@mui/material";
import Cookies from "universal-cookie";


const btn = {
    fontSize : '1.5rem',
    color : '#C5C6C7'
}


export const Navigator = () => {

    const voterCookie = new Cookies();
    const wallet_id = voterCookie.get("wallet");

    function logout(){
        voterCookie.remove("voter_token");
        window.location.reload(true);
    }
    return(
        <nav>
            <div id="nav-left">
                <img src={Logo} alt="logo" id="nav-logo"/>
                <a id='wallet-id' href={`https://sepolia.etherscan.io/address/${wallet_id}`} target='_blank'>WALLET ID: {wallet_id}</a>
                <Link href={"/vote"}><Button className="nav-btn" sx={btn}>Voting</Button></Link>
                <Link href={"/result"}><Button className="nav-btn" sx={btn}>Result</Button></Link>
            </div>
            <Button className="nav-btn" id='logout-btn' sx={btn} onClick={logout}>Logout</Button>
        </nav>
    )
}