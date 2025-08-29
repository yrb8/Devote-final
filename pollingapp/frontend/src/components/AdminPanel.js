import React, { useState, useEffect } from "react";
import {
  createElection,
  addCandidate,
  addVoter,
  getCandidates,
  getVoters,
  getElectionName,
  hasElectionStartedFromContract,
  startElection,
  endElection,
  hasElectionFinalizedFromContract,
  getWinner,
} from "../contract";
import { PINATA_JWT } from "../config";
import placeholderImage from "../Loading.png";

const AdminPanel = () => {
  const [electionName, setElectionName] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [addElectionName, setAddElectionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidates, setCandidates] = useState([]);

  const [voterAddress, setVoterAddress] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterAge, setVoterAge] = useState("");
  const [voters, setVoters] = useState([]);
  const [hasElectionStarted, setElectionStarted] = useState(false);
  const [hasElectionFinalized, setHasElectionFinalized] = useState(false);
  const [candidateImage, setCandidateImage] = useState(null);
  const [candidateImageHash, setCandidateImageHash] = useState("");
  const [mapCandidateImages, setmapCandidateImages] = useState({});

  const getFileFromIPFS = async (cid) => {
    try {
      if (!cid) throw new Error("CID is required to fetch the image.");
      const url = `https://ipfs.io/ipfs/${cid}`;
      const request = await fetch(url);
      const response = await request.blob();
      return response;
    } catch (error) {
      console.error("Error fetching image from IPFS:", error);
    }
  };

  const pinFileToIPFS = async (file) => {
    try {
      if (!file) throw new Error("No file selected.");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRequest = new Request(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${PINATA_JWT}` },
          body: formData,
        }
      );

      const response = await fetch(uploadRequest);
      if (!response.ok) throw new Error("Failed to upload file to IPFS via Pinata.");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesList = await getCandidates();
        setCandidates(candidatesList || []);
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchElectionName = async () => {
      try {
        const electionName = await getElectionName();
        setElectionName(electionName || "");
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchWinner = async () => {
      try {
        const winner = await getWinner();
        if (winner && winner.name) setWinnerName(winner.name);
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchVoters = async () => {
      try {
        const voters = await getVoters();
        setVoters(voters || []);
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchElectionState = async () => {
      try {
        const electionState = await hasElectionStartedFromContract();
        setElectionStarted(electionState);
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchElectionFinalizedState = async () => {
      try {
        const electionFinalizedState = await hasElectionFinalizedFromContract();
        setHasElectionFinalized(electionFinalizedState);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchCandidates();
    fetchElectionName();
    fetchVoters();
    fetchElectionState();
    fetchElectionFinalizedState();
    fetchWinner();
  }, []);

  useEffect(() => {
    if (candidates.length === 0) return;
    const fetchCandidateImages = async () => {
      const images = {};
      for (const candidate of candidates) {
        try {
          const imageBlob = await getFileFromIPFS(candidate.image);
          images[candidate.candidateAddress] = URL.createObjectURL(imageBlob);
        } catch (error) {
          console.error(
            `Error fetching image for candidate ${candidate.name}:`,
            error
          );
        }
      }
      setmapCandidateImages(images);
    };
    fetchCandidateImages();
  }, [candidates]);

  const handleCreateElection = async () => {
    try {
      await createElection(addElectionName, startDate, endDate);
      setElectionName(addElectionName);
      alert("Election created successfully!");
    } catch (error) {
      alert(`Error creating election: ${error.message}`);
    }
  };

  const handleAddCandidate = async () => {
    try {
      await addCandidate(
        candidateAddress,
        candidateName,
        candidateParty,
        candidateImageHash
      );
      setCandidates((prev) => [
        ...prev,
        {
          address: candidateAddress,
          name: candidateName,
          party: candidateParty,
        },
      ]);
      alert("Candidate added successfully!");
      setCandidateAddress("");
      setCandidateName("");
      setCandidateParty("");
      setCandidateImageHash("");
    } catch (error) {
      alert(`Error adding candidate: ${error.message}`);
    }
  };

  const handleAddVoter = async () => {
    try {
      await addVoter(voterAddress, voterName, voterAge);
      setVoters((prev) => [
        ...prev,
        { address: voterAddress, name: voterName, age: voterAge },
      ]);
      alert("Voter added successfully!");
      setVoterAddress("");
      setVoterName("");
      setVoterAge("");
    } catch (error) {
      alert(`Error adding voter: ${error.message}`);
    }
  };

  const handleEndElection = async () => {
    try {
      await endElection();
      alert("Election Finalized successfully!");
    } catch (error) {
      alert(`Error ending election: ${error.message}`);
    }
  };

  const handleStartElection = async () => {
    try {
      await startElection();
      alert("Election Started successfully!");
      setElectionStarted(true);
    } catch (error) {
      alert(`Error starting election: ${error.message}`);
    }
  };

  const handleUploadToIPFS = async () => {
    if (!candidateImage) {
      alert("Please select an image file first.");
      return;
    }
    try {
      const response = await pinFileToIPFS(candidateImage);
      alert(`File uploaded to IPFS with CID: ${response.IpfsHash}`);
      setCandidateImageHash(response.IpfsHash);
    } catch (error) {
      alert("Failed to upload file to IPFS.");
    }
  };

  // THEME STYLES (match VotingPanel/App.js)
  const styles = {
    container: {
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      maxWidth: "900px",
      margin: "40px auto",
      padding: "32px",
      background: "rgba(36, 40, 54, 0.92)",
      borderRadius: "18px",
      boxShadow: "0 0 32px #7f5af022, 0 0 4px #232946",
      color: "#eaeaea",
    },
    header: {
      textAlign: "center",
      color: "#7f5af0",
      marginBottom: "28px",
      fontSize: "2.2rem",
      letterSpacing: "2px",
      textShadow: "0 0 8px #232946, 0 0 2px #fff",
    },
    section: {
      marginBottom: "32px",
      background: "rgba(25, 28, 40, 0.98)",
      borderRadius: "14px",
      padding: "24px 18px",
      boxShadow: "0 2px 16px #7f5af022, 0 0 2px #232946",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "10px 0",
      border: "1px solid #232946",
      borderRadius: "6px",
      background: "#232946",
      color: "#eaeaea",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      fontSize: "1rem",
      outline: "none",
      transition: "border 0.2s",
    },
    button: {
      padding: "10px 18px",
      background: "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "7px",
      cursor: "pointer",
      fontWeight: "bold",
      letterSpacing: "1px",
      boxShadow: "0 0 8px #7f5af033, 0 0 2px #2cb67d",
      marginRight: "10px",
      marginTop: "8px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.1s",
    },
    sectionTitle: {
      fontSize: "1.2rem",
      color: "#7f5af0",
      borderBottom: "2px solid #7f5af0",
      paddingBottom: "5px",
      marginBottom: "18px",
      letterSpacing: "1px",
    },
    list: {
      listStyle: "none",
      padding: 0,
      marginTop: "18px",
    },
    listItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "18px",
      borderBottom: "1px solid #232946",
      paddingBottom: "10px",
    },
    candidateImage: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      objectFit: "cover",
      marginRight: "20px",
      border: "2px solid #7f5af0",
      background: "#232946",
      boxShadow: "0 0 8px #7f5af022",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Panel</h1>

      {/* Section to create election */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Election Details</h2>
        {electionName ? (
          <h2 style={{ color: "#2cb67d" }}>Election Name: {electionName}</h2>
        ) : (
          <>
            <h2 style={{ color: "#eaeaea" }}>Create Election</h2>
            <input
              style={styles.input}
              type="text"
              placeholder="Election Name"
              value={addElectionName}
              onChange={(e) => setAddElectionName(e.target.value)}
            />
            <input
              style={styles.input}
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleCreateElection} style={styles.button}>
              Create Election
            </button>
          </>
        )}
      </div>
      <div>
        {winnerName ? (
          <h3 style={{ color: "#2cb67d" }}>Winner Name: {winnerName}</h3>
        ) : null}
      </div>

      {/* Section to manage candidates */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Manage Candidates</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Address"
          value={candidateAddress}
          onChange={(e) => setCandidateAddress(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Name"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Candidate Party"
          value={candidateParty}
          onChange={(e) => setCandidateParty(e.target.value)}
        />
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          onChange={(e) => setCandidateImage(e.target.files[0])}
        />

        <button style={styles.button} onClick={handleAddCandidate}>
          Add Candidate
        </button>
        <button style={styles.button} onClick={handleUploadToIPFS}>
          Upload Image
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Candidate List</h2>
        <ul style={styles.list}>
          {candidates.length === 0 ? (
            <li style={{ color: "#b3c9e6" }}>No candidates available.</li>
          ) : (
            candidates.map((candidate, index) => {
              const candidateImg = mapCandidateImages[candidate.candidateAddress];
              return (
                <li key={index} style={styles.listItem}>
                  <img
                    src={candidateImg || placeholderImage}
                    alt={`${candidate.name}`}
                    style={styles.candidateImage}
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>Name:</strong> {candidate.name}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Party:</strong> {candidate.party}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Address:</strong> {candidate.candidateAddress}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Section to manage voters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Manage Voters</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="Voter Address"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Voter Name"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Voter Age"
          value={voterAge}
          onChange={(e) => setVoterAge(e.target.value)}
        />
        <button style={styles.button} onClick={handleAddVoter}>
          Add Voter
        </button>
        <ul style={styles.list}>
          {voters.length === 0 ? (
            <li style={{ color: "#b3c9e6" }}>No voters available.</li>
          ) : (
            voters.map((voter, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <strong>Name:</strong> {voter.name}{" "}
                <strong>Address:</strong> {voter.voterAddress}
              </li>
            ))
          )}
        </ul>
      </div>
      {hasElectionStarted ? (
        hasElectionFinalized ? null : (
          <button style={styles.button} onClick={handleEndElection}>
            End Election
          </button>
        )
      ) : hasElectionFinalized ? null : (
        <button style={styles.button} onClick={handleStartElection}>
          Start Election
        </button>
      )}
    </div>
  );

};

export default AdminPanel;