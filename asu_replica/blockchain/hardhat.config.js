require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const {
  AMOY_RPC_URL,
  PRIVATE_KEY,
  POLYGONSCAN_API_KEY
} = process.env;

module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    // Polygon testnet (Amoy). Needs AMOY_RPC_URL and PRIVATE_KEY in .env
    polygonAmoy: {
      url: AMOY_RPC_URL || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY || ''
    }
  }
};
