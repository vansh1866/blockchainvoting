from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta , date
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from backend.database import *
from backend.models import *
from eth_account import Account
import secrets , json , smtplib
from web3 import Web3
from email.message import EmailMessage


app = FastAPI()
app.add_middleware(CORSMiddleware , allow_origins = ["http://localhost:8080"] , allow_credentials = True , allow_headers = ['*'] , allow_methods = ['*'])
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES_VOTER = 5
ACCESS_TOKEN_EXPIRE_MINUTES_ADMIN = 30
blockchain_url = os.getenv("infura_url")
web3 = Web3(Web3.HTTPProvider(blockchain_url))
faucet_key = os.getenv("faucet_key")
faucet_addr = os.getenv("faucet_addr")
contract_addr = os.getenv("contract_addr")
abi = open("./backend/contracts/Election.json" , "r")
contract_abi = json.load(abi)["abi"]
abi.close()
contract = web3.eth.contract(address=contract_addr , abi=contract_abi)
s = smtplib.SMTP('smtp.gmail.com', 587)
s.starttls()
mail = "votingdapp123@gmail.com"
s.login(mail , os.getenv("mail_pass"))
chain_id = web3.eth.chain_id

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")




def calculateAge(year , month , day):
    birthDate = date(year , month , day)
    today = date.today()
    age = today.year - birthDate.year -((today.month, today.day) < (birthDate.month, birthDate.day))
    return age


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(aadhaar: int):
    if not checkAadhaarUsed(aadhaar):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User doesnt exist"
        )
    user = get_user_details(aadhaar)
    return user


async def authenticate_user(aadhaar: int, password: str):
    user : UserForm = await get_user(aadhaar)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/tokenVoter")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):

    user = await authenticate_user(int(form_data.username), form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES_VOTER)
    access_token = create_access_token(
        data={"sub": str(user.aadhaar) , "type" : "voter" , "eligible" : str(not user.disabled)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer" , "wallet_id" : user.wallet}


@app.get("/")
def default():
    return {"res" : "Hello World"}


async def transferEth(wallet : str , value : float , email : str):
    nonce = web3.eth.get_transaction_count(faucet_addr)
    tx = {
        'nonce': nonce,
        'to': wallet,
        'value': web3.to_wei(value, 'ether'),
        'gas': 2000000,
        'gasPrice': web3.eth.gas_price
    }
    signed_tx = Account.sign_transaction(tx , faucet_key)
    send_tx = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)["transactionHash"].hex()
    msg = EmailMessage()
    msg["Subject"] = "ETH transfer to you voter wallet"
    msg["From"] = mail
    msg["To"] = email
    ethscan_url = f"https://sepolia.etherscan.io/tx/{tx_receipt}"
    msg.set_content(f"Dear User,\n0.001 ETH transferred successfully to your voter wallet {wallet}.\nTransaction Hash : {tx_receipt}\nCheckout transaction of blockchain explorer at {ethscan_url}")
    s.send_message(msg)

    


@app.post("/createVoter")
async def create_user(first_name : str = Form(...) , last_name : str =  Form(...) , year : int = Form(...) , month : int = Form(...) , day : int = Form(...) , aadhaar : int = Form(...) , email : str = Form(...)):
    if checkAadhaarUsed(aadhaar):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists"
        )

    """Password is first four letter of first name in upper case + dob in format yyyymmdd
    Example : Voter with name Rahul Mishra born on 20/07/1995 will have password RAHU19950720
    """

    password = first_name[:4].upper() + str(year) + ("0" + str(month) if month < 10 else str(month)) + ("0" + str(day) if day < 10 else str(day))
    hashed = get_password_hash(password)
    age = calculateAge(year , month , day)
    if age < 18:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Age is less than 18"
        )
    priv = secrets.token_hex(32)
    private_key = "0x" + priv
    wallet = Account.from_key(private_key).address
    create_user_db(UserForm(first_name = first_name , last_name = last_name , email = email , year = year , month = month , day = day , aadhaar = aadhaar , disabled = True , password = hashed , wallet = wallet , private_key = private_key))
    return status.HTTP_201_CREATED

@app.post("/createAdmin")
async def create_admin(email : str = Form(...) , password : str = Form(...) , wallet : str = Form(...) , private_key : str = Form(...)):
    hashed = get_password_hash(password)
    create_admin_db(AdminForm(email = email , password = hashed , wallet = wallet , private_key = private_key))
    return status.HTTP_201_CREATED


async def authenticate_admin(email : str , password : str):
    admin = get_admin_details(email)
    if not admin :
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin doesnt exist"
        )
    if not verify_password(password , admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong password"
        )
    return admin
@app.post("/tokenAdmin" , response_model=Token)
async def login_for_admin_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    admin = await authenticate_admin(form_data.username , form_data.password)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES_ADMIN)
    access_token = create_access_token(
        data={"sub": admin.email, "type": "admin"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


async def registerVoter(admin_addr , admin_key , voter_addr , voter_email):
    nonce = web3.eth.get_transaction_count(admin_addr)
    call_function = contract.functions.voterRegisteration(voter_addr).build_transaction({"from" : admin_addr , "nonce" : nonce , "chainId" : chain_id})
    signed_tx = web3.eth.account.sign_transaction(call_function , private_key=admin_key)
    send_tx = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)["transactionHash"].hex()
    msg = EmailMessage()
    msg["Subject"] = "Successful Registeration"
    msg["From"] = mail
    msg["To"] = voter_email
    ethscan_url = f"https://sepolia.etherscan.io/tx/{tx_receipt}"
    msg.set_content(
        f"Dear User,\nYou have been successfully registered and are eligible to vote in the election.\nTransaction Hash : {tx_receipt}\nCheckout transaction on blockchain explorer at {ethscan_url}")
    s.send_message(msg)



@app.post("/verifyVoter")
async def verify_voter(aadhaar : int = Form(...) , token_admin : str =  Form(...)):
    payload = jwt.decode(token_admin , SECRET_KEY , algorithms=[ALGORITHM])
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only admin can verify voters"
        )
    if not checkAadhaarUsed(aadhaar):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voter not found in database"
        )
    set_voter_eligible(aadhaar)
    user = get_user_details(aadhaar)
    admin  = get_admin_details(payload.get("sub"))
    if web3.from_wei(web3.eth.get_balance(user.wallet) , "ether") < 0.001:
        await transferEth(user.wallet , 0.001 , user.email)
    await registerVoter(admin.wallet , admin.private_key , user.wallet , user.email)


@app.post("/addCandidate")
async def add_Candidate(name : str = Form(...) , party_photo_url : str = Form(...) , party_name : str = Form(...) , token_admin :str = Form(...)):
    payload = jwt.decode(token_admin, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only admin can add candidates"
        )
    admin = get_admin_details(payload.get("sub"))
    id = contract.functions.getContestantCount().call() + 1
    create_candidate_db(Candidate(id = id , name = name , party_name = party_name , party_photo_url = party_photo_url))
    nonce = web3.eth.get_transaction_count(admin.wallet)
    call_function = contract.functions.addContestant(name).build_transaction({"from" : admin.wallet , "nonce" : nonce , "chainId" : chain_id})
    signed_tx = web3.eth.account.sign_transaction(call_function, private_key=admin.private_key)
    send_tx = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)["transactionHash"].hex()
    print(tx_receipt)
    return status.HTTP_201_CREATED


@app.get("/allCandidates")
def get_all_candidates():
    candidate_list = []
    count = contract.functions.getContestantCount().call()
    for i in range(1, count + 1):
        candidate_list.append(get_candidate_details(i))
    return {
        "candidates" : candidate_list
    }

@app.post("/changePhase")
async def change_phase(phase : int = Form(...) , token_admin : str = Form(...)):
    payload = jwt.decode(token_admin, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only admin can change phase of election"
        )
    admin = get_admin_details(payload.get("sub"))
    curr_phase = contract.functions.getPhase().call()
    if curr_phase >= phase:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cannot change phase to previous one or same one"
        )
    nonce = web3.eth.get_transaction_count(admin.wallet)
    call_function = contract.functions.changeState(phase).build_transaction({"from" : admin.wallet , "nonce" : nonce , "chainId" : chain_id})
    signed_tx = web3.eth.account.sign_transaction(call_function, private_key=admin.private_key)
    send_tx = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)["transactionHash"].hex()
    print(tx_receipt)


async def sendVote(user: UserForm , candidate_id : int ):
    nonce_user = web3.eth.get_transaction_count(user.wallet)
    call_function = contract.functions.vote(candidate_id).build_transaction({"from" : user.wallet , "nonce" : nonce_user , "chainId" : chain_id})
    signed_tx = web3.eth.account.sign_transaction(call_function, private_key=user.private_key)
    send_tx = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)["transactionHash"].hex()
    print(tx_receipt)
    msg = EmailMessage()
    msg["Subject"] = "Vote cast Successfully"
    msg["From"] = mail
    msg["To"] = user.email
    ethscan_url = f"https://sepolia.etherscan.io/tx/{tx_receipt}"
    msg.set_content(
        f"Dear User,\nThank You for exercising your Right to Vote. Your vote has been successfully cast.\nTransaction Hash : {tx_receipt}\nCheckout transaction on blockchain explorer at {ethscan_url}")
    s.send_message(msg)
    return tx_receipt

@app.post("/castVote")
async def cast_vote(token_voter : str = Form(...) , id : int = Form(...)):
    try:
       payload = jwt.decode(token_voter , SECRET_KEY , algorithms=[ALGORITHM])
       if not str(payload.get("eligible")):
           raise HTTPException(
               status_code=status.HTTP_403_FORBIDDEN,
               detail="Voter has not been verified to vote in this election or has already voted"
           )
    except:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Login window timed out"
        )
    current_phase = contract.functions.getPhase().call()
    if current_phase != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votes accepted only in voting phase"
        )
    user = get_user_details(int(payload.get("sub")))
    tx_hash = await sendVote(user , id)
    set_tx_hash(user.aadhaar , tx_hash)
    return {"hash" : tx_hash}

@app.get("/getResult")
def get_result():
    current_phase = contract.functions.getPhase().call()
    if current_phase != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Result declared after voting phase finishes"
        )
    result = contract.functions.getResult().call()
    print(result)
    return{"result" : result}

@app.get("/getPhase")
def get_phase():
    current_phase = contract.functions.getPhase().call()
    return {"phase":current_phase}

@app.get("/didVote")
def did_vote(token_voter : str):
    payload = jwt.decode(token_voter, SECRET_KEY, algorithms=[ALGORITHM])
    user = get_user_details(int(payload.get("sub")))
    return {"tx_hash" : user.tx_hash}
