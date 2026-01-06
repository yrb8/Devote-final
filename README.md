# DeVote: Blockchain-Based E-Voting System

![Ethereum](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Smart Contract](https://img.shields.io/badge/Smart%20Contract-Solidity-black)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![License](https://img.shields.io/badge/License-MIT-green)

DeVote is a **decentralized web-based e-voting system** designed to enhance **security, transparency, and integrity** in digital elections by leveraging **blockchain technology and smart contracts**.  
This project was developed as an **academic prototype** to support a conference paper on blockchain-based voting systems.

---

## 📌 Abstract
Traditional electronic voting systems face persistent challenges, including vote manipulation, lack of transparency, and centralized control. DeVote addresses these issues by utilizing Ethereum blockchain and smart contracts to automate election rules, securely store votes, and ensure immutability without relying on a trusted central authority.

The system integrates a modern web interface with decentralized technologies, enabling voters to participate in elections securely while maintaining transparency and auditability.

---

## 🚀 Key Features
- ✅ Decentralized voting using Ethereum blockchain
- 🔐 Secure and immutable vote recording via smart contracts
- 🧠 Smart contract–based election rules enforcement
- 🧾 Transparent and verifiable voting process
- 🌐 Web-based user interface with wallet integration
- 🧪 Tested smart contracts using Hardhat framework

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Ethers.js
- MetaMask

### Backend / Blockchain
- Solidity
- Ethereum
- Hardhat
- Node.js

### Development Tools
- Hardhat Testing Framework
- npm

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- MetaMask browser extension
- Hardhat

### Steps
```bash
# Clone repository
git clone https://github.com/yrb8/Devote-final.git

# Navigate to backend
cd pollingapp/backend

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Run local blockchain
npx hardhat node

# Deploy smart contract
npx hardhat run scripts/deploy.js --network localhost

#Testing
npx hardhat test
```
Bryan Liem, Vincent Nicholas Hie, Zulfany Erlisa Rasjid. "Smart Contract Implementation in Web-Based E-Voting Systems: Blockchain Security and Transparency Analysis"
ICoABCD, 2025.

