// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election{
	
	struct Contestant{
		uint id;
		string name;
		uint voteCount;
	}

	struct Voter{
		bool hasVoted;
		bool isRegistered;
	}

	address admin;
	mapping(uint => Contestant) public contestants; 
    mapping(address => Voter) public voters;
	uint public contestantsCount;
	enum PHASE{reg, voting , done}
	PHASE public state;

	modifier onlyAdmin(){
		require(msg.sender==admin);
		_;
	}
	
	modifier validState(PHASE x){
	    require(state==x);
	    _;
	}

	constructor(){
		admin=msg.sender;
        state=PHASE.reg;
	}

    function changeState(PHASE x) onlyAdmin public{
		require(x > state);
        state = x;
    }

	function addContestant(string memory _name) public onlyAdmin validState(PHASE.reg){
		contestantsCount++;
		contestants[contestantsCount]=Contestant(contestantsCount,_name,0);
	}

	function voterRegisteration(address user) public onlyAdmin validState(PHASE.reg){
		voters[user].isRegistered=true;
	}

	function vote(uint _contestantId) public validState(PHASE.voting){
        
		require(voters[msg.sender].isRegistered);
		require(!voters[msg.sender].hasVoted);
        require(_contestantId > 0 && _contestantId<=contestantsCount);
		contestants[_contestantId].voteCount++;
		voters[msg.sender].hasVoted=true;
	}

	function getContestantCount() public view returns (uint) {
		return contestantsCount;
	}

	function getPhase() public view returns (uint) {
		if(state == PHASE.reg){
			return 0;
		}
		else if(state == PHASE.voting){
			return 1;
		}
		return 2;
	}

	function getResult() public view validState(PHASE.done) returns (uint[] memory result){
		uint[] memory result = new uint[](contestantsCount);
		for(uint i = 1; i <= contestantsCount; i++){
			result[i - 1] = contestants[i].voteCount;
		}
		return result;
	}
}