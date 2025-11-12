const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SingleElectionVoting", function () {
  let voting, owner, addr1, addr2, addr3;
  const electionName = "Pemilu 2025";
  let now;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("SingleElectionVoting");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    voting = await Voting.deploy();
    now = (await ethers.provider.getBlock("latest")).timestamp;
  });

  it("Should return empty candidates and voters if none added", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    const candidates = await voting.getCandidates();
    expect(candidates.length).to.equal(0);
    const voters = await voting.getVoters();
    expect(voters.length).to.equal(0);
  });

  it("Should handle multiple voters and candidates", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob");
    await voting.addCandidate(owner.address, "Owner", "Partai C", "ipfs://owner");
    await voting.addVoter(addr3.address, "Charlie", 30);
    await voting.addVoter(addr2.address, "Bob", 25);
    await voting.addVoter(owner.address, "Owner", 40);
    const candidates = await voting.getCandidates();
    expect(candidates.length).to.equal(3);
    expect(candidates[2].name).to.equal("Owner");
    const voters = await voting.getVoters();
    expect(voters.length).to.equal(3);
    expect(voters[2].name).to.equal("Owner");
  });
});

describe("SingleElectionVoting", function () {
  let voting, owner, addr1, addr2, addr3;
  const electionName = "Pemilu 2025";
  let now;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("SingleElectionVoting");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    voting = await Voting.deploy();
    // await voting.deployed();
    now = (await ethers.provider.getBlock("latest")).timestamp;
  });

  it("Should deploy and set admin as owner", async function () {
    expect(await voting.admin()).to.equal(owner.address);
  });


  it("Should create an election", async function () {
    const startDate = now + 3 * 86400; // 3 hari dari sekarang
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    expect(await voting.getElectionName()).to.equal(electionName);
  });

  it("Should add candidates and voters before election starts", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob");
    await voting.addVoter(addr3.address, "Charlie", 30);
    const candidates = await voting.getCandidates();
    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Alice");
    expect(candidates[1].name).to.equal("Bob");
    const voters = await voting.getVoters();
    expect(voters.length).to.equal(1);
    expect(voters[0].name).to.equal("Charlie");
  });

  it("Should not allow non-admin to create election or add candidate/voter", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await expect(
      voting.connect(addr1).createElection(electionName, startDate, endDate)
    ).to.be.revertedWith("Only admin can perform this action.");
    await voting.createElection(electionName, startDate, endDate);
    await expect(
      voting.connect(addr1).addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice")
    ).to.be.revertedWith("Only admin can perform this action.");
    await expect(
      voting.connect(addr1).addVoter(addr3.address, "Charlie", 30)
    ).to.be.revertedWith("Only admin can perform this action.");
  });

  it("Should start and end election by admin", async function () {
  const startDate = now + 3 * 86400;
  const endDate = startDate + 86400;
  await voting.createElection(electionName, startDate, endDate);
  await voting.addCandidate(addr1.address, "AdminCandidate", "PartaiAdmin", "ipfs://admin");
  await voting.startElection();
  expect(await voting.hasElectionStarted()).to.equal(true);
  await voting.endElection();
  expect(await voting.hasElectionFinalized()).to.equal(true);
  });

  it("Should allow eligible voter to vote and not double vote", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addVoter(addr2.address, "Bob", 25);
    await voting.startElection();
    await voting.connect(addr2).vote(addr1.address);
    // Cek tidak bisa double vote
    await expect(
      voting.connect(addr2).vote(addr1.address)
    ).to.be.revertedWith("You have already voted.");
    // Cek voteCount bertambah
    const candidates = await voting.getCandidates();
    expect(candidates[0].voteCount).to.equal(1);
  });

  it("Should not allow non-registered voter to vote", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.startElection();
    await expect(
      voting.connect(addr2).vote(addr1.address)
    ).to.be.revertedWith("You are not eligible to vote.");
  });

  it("Should not allow voting before election started", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addVoter(addr2.address, "Bob", 25);
    await expect(
      voting.connect(addr2).vote(addr1.address)
    ).to.be.reverted;
  });

  it("Should return winner after election finalized", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob");
    await voting.addVoter(addr3.address, "Charlie", 30);
    await voting.startElection();
    await voting.connect(addr3).vote(addr2.address);
    await voting.endElection();
    const winner = await voting.getWinner();
    expect(winner.name).to.equal("Bob");
    expect(winner.party).to.equal("Partai B");
    expect(winner.voteCount).to.equal(1);
  });

  it("Should revert getWinner if election not finalized", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await expect(voting.getWinner()).to.be.revertedWith("Election has not been finalized.");
  });

  it("Should revert addCandidate if already added", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await expect(
      voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice")
    ).to.be.revertedWith("Candidate already added.");
  });

  it("Should revert addVoter if already added", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addVoter(addr2.address, "Bob", 25);
    await expect(
      voting.addVoter(addr2.address, "Bob", 25)
    ).to.be.revertedWith("Voter already added.");
  });

  it("Should return all candidates and voters", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob");
    await voting.addVoter(addr3.address, "Charlie", 30);
    const candidates = await voting.getCandidates();
    expect(candidates.length).to.equal(2);
    const voters = await voting.getVoters();
    expect(voters.length).to.equal(1);
  });

  it("Should return 'No winner' if no candidate has votes after finalized", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.startElection();
    await voting.endElection();
    const winner = await voting.getWinner();
    expect(winner[0]).to.equal("No winner");
  });

  it("Should revert addCandidate after election started (onlyBefore)", async function () {
    const startDate = now + 10; // 10 detik dari sekarang
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    // Advance time agar block.timestamp > startDate - 1 days
    await network.provider.send("evm_increaseTime", [86400]); // maju 1 hari
    await network.provider.send("evm_mine");
    await expect(
      voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob")
    ).to.be.revertedWith("Action not allowed after this time.");
  });

  it("Should revert addVoter after election finalized (notFinalized)", async function () {
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.startElection();
    await voting.endElection();
    await expect(
      voting.addVoter(addr2.address, "Bob", 25)
    ).to.be.revertedWith("Election sudah difinalisasi.");
  });

  it("Should revert testOnlyDuring outside range", async function () {
    const nowTs = Math.floor(Date.now() / 1000);
    await expect(
      voting.testOnlyDuring(nowTs + 100, nowTs + 200)
    ).to.be.revertedWith("Action only allowed during the election.");
  });

  it("Should pass testOnlyDuring inside range", async function () {
    const block = await ethers.provider.getBlock('latest');
    const nowTs = block.timestamp;
    const start = nowTs + 5;
    const end = start + 100;
    await network.provider.send("evm_increaseTime", [10]); // maju 10 detik
    await network.provider.send("evm_mine");
    await voting.testOnlyDuring(start, end); // block.timestamp = nowTs + 10, start = nowTs + 5, end = nowTs + 105
  });

  it("Should revert testOnlyAfter before timestamp", async function () {
    const block = await ethers.provider.getBlock('latest');
    const nowTs = block.timestamp;
    const timestamp = nowTs + 100;
    // Jangan advance time, block.timestamp < timestamp
    await expect(
      voting.testOnlyAfter(timestamp)
    ).to.be.revertedWith("Action only allowed after this time.");
  });

  it("Should pass testOnlyAfter after timestamp", async function () {
    const nowTs = Math.floor(Date.now() / 1000);
    await network.provider.send("evm_increaseTime", [200]);
    await network.provider.send("evm_mine");
    await voting.testOnlyAfter(nowTs + 100);
  });

  it("Should revert vote with invalid candidate", async function () {
    const block = await ethers.provider.getBlock('latest');
    const nowTs = block.timestamp;
    const startDate = nowTs + 10;
    const endDate = startDate + 100;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addVoter(addr2.address, "Bob", 25);
    await voting.startElection();
    await expect(
      voting.connect(addr2).vote(addr1.address)
    ).to.be.revertedWith("Invalid candidate.");
  });

  it("Should revert double voting", async function () {
    // Isolated double voting test: only call vote twice by the same voter
    const startDate = now + 3 * 86400;
    const endDate = startDate + 86400;
    await voting.createElection(electionName, startDate, endDate);
    await voting.addCandidate(addr1.address, "Alice", "Partai A", "ipfs://alice");
    await voting.addVoter(addr2.address, "Bob", 25);
    await voting.startElection();
    await voting.connect(addr2).vote(addr1.address);
    await expect(
      voting.connect(addr2).vote(addr1.address)
    ).to.be.revertedWith("You have already voted.");
  });

  it("Should revert addCandidate at exact onlyBefore timestamp", async function () {
    const block = await ethers.provider.getBlock('latest');
    const nowTs = block.timestamp;
    const startDate = nowTs + 86400; // 1 hari dari sekarang
    const endDate = startDate + 100;
    await voting.createElection(electionName, startDate, endDate);
    // Advance time ke startDate - 1 days
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");
    await expect(
      voting.addCandidate(addr2.address, "Bob", "Partai B", "ipfs://bob")
    ).to.be.revertedWith("Action not allowed after this time.");
  });
});
