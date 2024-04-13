from pydantic import BaseModel
from dotenv import load_dotenv
import os


load_dotenv("./variables.env")

class UserForm(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name : str | None = None
    disabled : bool | None = None
    aadhaar : int | None = None
    day : int | None = None
    month : int | None = None
    year : int | None = None
    wallet : str | None = None
    password : str | None = None
    private_key : str | None = None
    tx_hash : str | None = None


class UserData(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    disabled: bool | None = None
    aadhaar: int | None = None


class Token(BaseModel):
    access_token: str
    token_type: str


class AdminForm(BaseModel):
    email : str | None = None
    wallet: str | None = None
    password: str | None = None
    private_key: str | None = None

class Candidate(BaseModel):
    id : int | None = None
    name : str | None = None
    party_photo_url : str | None = None
    party_name : str | None = None