import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import VotingPanel from "./components/VotingPanel";
import FundmePanel from "./components/FundmePanel";

// Custom hook for hover effect
function useHoverStyle(ref, baseStyle, hoverStyle) {
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

function Home({ styles }) {
  const navigate = useNavigate();
  const btnRef = React.useRef();
  useHoverStyle(btnRef, styles.button, styles.buttonHover);

  return (
    <div style={styles.heroContainer}>
      <h1 style={styles.heroTitle}>Welcome to DeVote</h1>
      <p style={styles.heroSubtitle}>
        Empower your community by organizing decentralized elections and funding candidates with ease.
      </p>
      <button
        ref={btnRef}
        style={styles.button}
        onClick={() => navigate("/voting")}
      >
        Go to Voting Panel
      </button>
    </div>
  );
}

function App() {
  // Decentralized dark theme styles
  const styles = {
    body: {
      background: "radial-gradient(ellipse at top left, #232946 60%, #16161a 100%)",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
    },
    navbar: {
      background: "rgba(22, 22, 26, 0.98)",
      padding: "18px 32px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#eaeaea",
      borderBottom: "1.5px solid #2d2e36",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      letterSpacing: "1px",
      boxShadow: "0 2px 16px 0 #1a223355",
      backdropFilter: "blur(2px)",
    },
    navContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: "1200px",
    },
    navTitle: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#7f5af0",
      letterSpacing: "2px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      textShadow: "0 2px 8px #7f5af055",
      userSelect: "none",
    },
    navLinks: {
      display: "flex",
      gap: "28px",
    },
    navLink: {
      textDecoration: "none",
      color: "#eaeaea",
      fontSize: "1.08rem",
      fontWeight: "bold",
      padding: "7px 20px",
      borderRadius: "7px",
      transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      background: "transparent",
      boxShadow: "none",
      border: "none",
      outline: "none",
      cursor: "pointer",
    },
    navLinkHover: {
      background: "rgba(127,90,240,0.12)",
      color: "#7f5af0",
      boxShadow: "0 2px 12px #7f5af022",
    },
    mainContent: {
      maxWidth: "1200px",
      margin: "40px auto",
      padding: "20px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      background: "transparent",
      minHeight: "calc(100vh - 120px)",
    },
    heroContainer: {
      textAlign: "center",
      marginTop: "80px",
      background: "rgba(36, 40, 54, 0.85)",
      borderRadius: "18px",
      boxShadow: "0 0 32px #7f5af022, 0 0 4px #232946",
      padding: "60px 30px",
      maxWidth: "700px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    heroTitle: {
      fontSize: "2.6rem",
      color: "#7f5af0",
      marginBottom: "22px",
      textShadow: "0 0 8px #232946, 0 0 2px #fff",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
      letterSpacing: "2px",
    },
    heroSubtitle: {
      fontSize: "1.2rem",
      color: "#b3c9e6",
      lineHeight: "1.7",
      marginBottom: "30px",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    button: {
      marginTop: "30px",
      padding: "14px 38px",
      fontSize: "1.13rem",
      background: "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      letterSpacing: "1px",
      boxShadow: "0 0 12px #7f5af033, 0 0 2px #2cb67d",
      transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.1s",
      fontFamily: "'Fira Mono', 'Menlo', 'Consolas', monospace",
    },
    buttonHover: {
      background: "linear-gradient(90deg, #232946 0%, #7f5af0 100%)",
      color: "#7f5af0",
      boxShadow: "0 0 24px #7f5af044, 0 0 6px #232946",
      transform: "translateY(-2px) scale(1.04)",
    },
  };

  // Set body background color for dark mode
  React.useEffect(() => {
    Object.assign(document.body.style, styles.body);
    return () => {
      document.body.style.background = "";
    };
    // eslint-disable-next-line
  }, []);

  // Add hover effect for nav links
  React.useEffect(() => {
    const navLinks = document.querySelectorAll("a[style]");
    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        Object.assign(link.style, styles.navLinkHover);
      });
      link.addEventListener("mouseleave", () => {
        Object.assign(link.style, styles.navLink);
      });
    });
    return () => {
      navLinks.forEach((link) => {
        link.removeEventListener("mouseenter", () => {});
        link.removeEventListener("mouseleave", () => {});
      });
    };
    // eslint-disable-next-line
  }, []);

  // Add Fira Mono font from Google Fonts
  React.useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fira+Mono:wght@500;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Router>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <h1 style={styles.navTitle}>DeVote</h1>
          <div style={styles.navLinks}>
            <Link to="/admin" style={styles.navLink}>
              Admin Panel
            </Link>
            <Link to="/voting" style={styles.navLink}>
              Voting Panel
            </Link>
            <Link to="/fund" style={styles.navLink}>
              Fund Candidate
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/voting" element={<VotingPanel />} />
          <Route path="/fund" element={<FundmePanel />} />
          <Route
            path="/"
            element={<Home styles={styles} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;