import {Navigator} from "./Navbar";
import {Container} from "@mui/material";
import React, {useEffect} from "react";
import {useState} from "react";
import axios from "axios";


export const Result = () => {
    const [results, setResults] = useState([])
    const[Candidates, setCandidates] = useState([])
    const[phase, setPhase] = useState("")

    useEffect(() => {
        axios.get("http://localhost:8000/getPhase").then(res=> {if(res.status === 200){setPhase(res.data.phase)}
            if (res.data.phase === 2){
                return axios.get("http://localhost:8000/allCandidates")
            }
        })
            .then(res => {if (res.status === 200){setCandidates(res.data.candidates); console.log(Candidates)}})
    },[])

    useEffect(() => {
        axios.get("http://localhost:8000/getResult").then(res => {if(res.status === 200){
            setResults(res.data.result);
        }})
    },[])

    if(phase!== 2){
        return (
            <div>
                <Navigator />
                <Container id='voting-cont'>
                    <h3 id='no-voting-msg'>Results will be announced after voting is over</h3>
                </Container>
            </div>
        )
    }
    else {
        return (
            <div>
                <Navigator/>
                <Container id='result-cont'>
                    {
                        Candidates.map((element, index) => {
                            return (
                                <div className='card2' key={index}>
                                    <img src={element.party_photo_url} alt="candidate symbol" className='card2-img'/>
                                    <div className='card2-content'>
                                        <p>{element.name}</p>
                                        <p>Votes = {results[index]}</p>
                                    </div>
                                </div>
                            )

                        })


                    }


                </Container>
            </div>
        )
    }
}