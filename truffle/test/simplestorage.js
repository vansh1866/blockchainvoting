const Election = artifacts.require("Election");

contract('Election', () => {
  it('should read newly written values', async() => {
    const electionInstance = await Election.deployed();
    var value = (await electionInstance.getPhase()).toNumber();
    assert.equal(value, 0, "0 wasn't the initial value");
    await electionInstance.addContestant("C1")
    await electionInstance.addContestant("C2")
    await electionInstance.voterRegisteration("0x4a1069fbee6fC79Eb523a1901D64D39fC2C2002E")
    await electionInstance.changeState(1);
    await electionInstance.vote(1)
    await electionInstance.changeState(2)
    console.log((await electionInstance.getPhase()).toNumber())
    var res = (await electionInstance.getResult())
    console.log(res[0].toNumber() , res[1].toNumber())
  });
});
