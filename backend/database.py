import pymongo as pymongo
from pymongo.server_api import ServerApi
from fastapi.encoders import jsonable_encoder
from backend.models import *


client = pymongo.MongoClient(os.getenv("mongo_db_url") , server_api=ServerApi('1'))
db = client.Voting_DAPP
voters = db.voters
admins = db.admins
candidates = db.candidates


"""
Voter attributes
#first name
#lastname
#dob
#aadhaar
#email
#wallet id
#password hashed
#eligibility for voting

Admin attributes
#email
#wallet id
#wallet key
#hashed password

"""


def checkAadhaarUsed(aadhaar : int):
    query = {"aadhaar"  : aadhaar}
    res = list(voters.find(query))
    if len(res) == 0:
        return False
    return True

def create_user_db(user : UserForm):
    voters.insert_one(jsonable_encoder(user))

def get_user_details(aadhaar : int):
    query = {"aadhaar": aadhaar}
    res = list(voters.find(query))
    return UserForm(**res[0])

def create_admin_db(admin : AdminForm):
    admins.insert_one(jsonable_encoder(admin))

def get_admin_details(email : str):
    query = {"email" : email}
    res = list(admins.find(query))
    return AdminForm(**res[0])

def set_voter_eligible(aadhaar : int):
    query = {"aadhaar" : aadhaar}
    updated_value = {"$set" : {"disabled" : False}}
    voters.update_one(query , updated_value)

def create_candidate_db(candidate : Candidate):
    candidates.insert_one(jsonable_encoder(candidate))

def get_candidate_details(id : int):
    query = {"id" : id}
    res = list(candidates.find(query))
    return Candidate(**res[0])

def set_tx_hash(aadhaar : int , tx_hash : str):
    query = {"aadhaar": aadhaar}
    updated_value = {"$set": {"tx_hash": tx_hash}}
    voters.update_one(query , updated_value)

