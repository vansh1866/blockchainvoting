import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import Cookies from "universal-cookie";
import {Link} from "@mui/material";

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

export const AdminNav = () => {

    const cookie = new Cookies();
    const jwt = cookie.get("admin_token")
    const navigator = useNavigate()

    useEffect( () => {
        if (jwt === undefined) {
            navigator("/adminLogin")
        }
    })

    function logout(){
        cookie.remove("admin_token");
        window.location.reload(true);
    }


    return(
        <div id="admin-nav">
            <div>
                <Link href={"/admin"}><Button sx={btn2}>Change Phase</Button></Link>
                <Link href={"/verifyVoter"}><Button sx={btn2}>Verify Voter</Button></Link>
                <Link href={"/addCandidate"}><Button sx={btn2}>Add candidate</Button></Link>
            </div>
            <Button sx={btn} onClick={logout}>Log Out</Button>
        </div>
    )
}