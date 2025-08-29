import React, { useEffect, useState } from "react";
import { getCandidates, voteForCandidate, hasElectionFinalizedFromContract, getWinner } from "../contract";

const VotingPanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [hasFinalized, setHasFinalized] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerImageUrl, setWinnerImageUrl] = useState(null);

  // Dark decentralized dapp theme styles (match App.js)
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "50px auto",
      padding: "32px",
      maxWidth: "1000px",
      borderRadius: "18px",
      background: "rgba(36, 40, 54, 0.92)",
      boxShadow: "0 0 32px #7f5af022, 0 0 4px #232946",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    title: {
      fontSize: "2.1rem",
      color: "#7f5af0",
      marginBottom: "32px",
      textShadow: "0 0 8px #232946, 0 0 2px #fff",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      letterSpacing: "2px",
    },
    winnerBox: {
      background: "rgba(25, 28, 40, 0.98)",
      borderRadius: "14px",
      boxShadow: "0 2px 16px #7f5af022, 0 0 2px #232946",
      padding: "40px 32px",
      minWidth: "320px",
      textAlign: "center",
      color: "#2cb67d",
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginTop: "40px",
    },
    winnerName: {
      color: "#7f5af0",
      fontSize: "2.2rem",
      margin: "18px 0 0 0",
      letterSpacing: "2px",
      textShadow: "0 0 8px #232946, 0 0 2px #fff",
    },
    winnerParty: {
      color: "#b3c9e6",
      fontSize: "1.1rem",
      marginTop: "8px",
    },
    winnerImage: {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      margin: "18px auto 10px auto",
      border: "3px solid #7f5af0",
      background: "#232946",
      boxShadow: "0 0 16px #7f5af022",
      display: "block",
    },
    grid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "32px",
      justifyContent: "center",
      width: "100%",
    },
    card: {
      background: "rgba(25, 28, 40, 0.98)",
      borderRadius: "14px",
      boxShadow: "0 2px 16px #7f5af022, 0 0 2px #232946",
      padding: "28px 22px",
      minWidth: "220px",
      maxWidth: "240px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "transform 0.18s, box-shadow 0.18s, border 0.18s",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      border: "1.5px solid #232946",
    },
    cardHover: {
      transform: "translateY(-6px) scale(1.03)",
      boxShadow: "0 6px 32px #7f5af044, 0 0 8px #2cb67d44",
      border: "1.5px solid #7f5af0",
    },
    image: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "16px",
      border: "2.5px solid #7f5af0",
      background: "#232946",
      boxShadow: "0 0 12px #7f5af022",
    },
    name: {
      fontWeight: "bold",
      fontSize: "1.18rem",
      color: "#eaeaea",
      marginBottom: "6px",
      letterSpacing: "1px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    party: {
      fontSize: "1rem",
      color: "#b3c9e6",
      marginBottom: "10px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    voteCount: {
      fontSize: "0.98rem",
      color: "#2cb67d",
      marginBottom: "14px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    button: {
      padding: "9px 22px",
      fontSize: "1rem",
      color: "#fff",
      background: "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
      border: "none",
      borderRadius: "7px",
      cursor: "pointer",
      fontWeight: "bold",
      letterSpacing: "1px",
      boxShadow: "0 0 8px #7f5af033, 0 0 2px #2cb67d",
      transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.1s",
      marginTop: "8px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    buttonHover: {
      background: "linear-gradient(90deg, #232946 0%, #7f5af0 100%)",
      color: "#7f5af0",
      boxShadow: "0 0 18px #7f5af044, 0 0 6px #232946",
      transform: "translateY(-2px) scale(1.04)",
    },
  };

  // Helper to get IPFS image url
  const getImageUrl = (imageHash) => {
    if (!imageHash) return "https://via.placeholder.com/120?text=No+Image";
    if (imageHash.startsWith("http")) return imageHash;
    return `https://ipfs.io/ipfs/${imageHash}`;
  };

  useEffect(() => {
  const fetchStatus = async () => {
    try {
      const finalized = await hasElectionFinalizedFromContract();
      setHasFinalized(finalized);
      if (finalized) {
        const winnerData = await getWinner();
        setWinner(winnerData);

        // Ambil semua kandidat untuk mencari image pemenang
        const candidatesList = await getCandidates();

        // Misal winnerData[0] adalah nama kandidat
        const winnerCandidate = candidatesList.find(
          (c) => c.name === winnerData[0]
        );

        if (winnerCandidate && winnerCandidate.image) {
          setWinnerImageUrl(getImageUrl(winnerCandidate.image));
        } else {
          setWinnerImageUrl("https://via.placeholder.com/120?text=No+Image");
        }
      } else {
        const candidatesList = await getCandidates();
        setCandidates(candidatesList);
      }
    } catch (error) {
      // Optional: tampilkan error
    }
  };
  fetchStatus();
  // eslint-disable-next-line
}, []);

  const handleVote = async (candidateAddress) => {
    if (loading) return;
    setLoading(true);
    try {
      await voteForCandidate(candidateAddress);
      alert("Vote successfully cast!");
    } catch (error) {
      alert("Error casting vote.");
    }
    setLoading(false);
  };

  // Custom button hover
  function useButtonHover(ref, baseStyle, hoverStyle) {
    React.useEffect(() => {
      const node = ref.current;
      if (!node) return;
      const handleMouseEnter = () => Object.assign(node.style, hoverStyle);
      const handleMouseLeave = () => Object.assign(node.style, baseStyle);
      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter);
        node.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, [ref, baseStyle, hoverStyle]);
  }

  // Vote button with hover effect
  function VoteButton({ loading, onClick, styles }) {
    const btnRef = React.useRef();
    useButtonHover(btnRef, styles.button, styles.buttonHover);
    return (
      <button
        ref={btnRef}
        style={styles.button}
        disabled={loading}
        onClick={onClick}
      >
        Vote
      </button>
    );
  }

  // Jika sudah final, tampilkan winner
  if (hasFinalized && winner) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Voting Panel</h1>
        <div style={styles.winnerBox}>
          <div>The Winner is:</div>
          <img
          src={winnerImageUrl || "https://via.placeholder.com/120?text=No+Image"}
          alt={winner && winner[0]}
          style={styles.winnerImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/120?text=No+Image";
          }}
          />
          <div style={styles.winnerName}>{winner && winner[0]}</div>
          <div style={styles.winnerParty}>{winner && winner[1]}</div>
        </div>
      </div>
    );
  }

  // Jika belum final, tampilkan daftar kandidat untuk voting
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Voting Panel</h1>
      <div style={styles.grid}>
        {candidates.length === 0 && (
          <div style={{ color: "#b3c9e6", fontFamily: styles.name.fontFamily }}>No candidates found.</div>
        )}
        {candidates.map((candidate, idx) => (
          <div
            key={candidate.candidateAddress}
            style={{
              ...styles.card,
              ...(hovered === idx ? styles.cardHover : {}),
            }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <img
              src={getImageUrl(candidate.image)}
              alt={candidate.name}
              style={styles.image}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100?text=No+Image";
              }}
            />
            <div style={styles.name}>{candidate.name}</div>
            <div style={styles.party}>{candidate.party}</div>
            <div style={styles.voteCount}>
              Votes: {candidate.voteCount?.toString?.() || "0"}
            </div>
            <VoteButton
              loading={loading}
              onClick={() => handleVote(candidate.candidateAddress)}
              styles={styles}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingPanel;