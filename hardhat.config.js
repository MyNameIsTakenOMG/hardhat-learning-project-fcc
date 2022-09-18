require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require('hardhat-deploy')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.9",
  solidity: {
    compilers:[{version:'0.8.9'},{version:'0.6.6'}]
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_API_KEY
  },
  gasReporter:{
    enabled:true,
    noColors:true,
    token:'ETH',
    coinmarketcap:process.env.COINMARKETCAP_API_KEY,
    currency:'USD',
    outputFile:'gas-report.txt'
  },
  networks:{
    goerli:{
      url:process.env.GOERLI_RPC_URL,
      accounts:[process.env.PRIVATE_KEY],
      blockConfirmations:6
    }
  },
  namedAccounts:{
    deployer:{
      default:0
    },
    user:{
      default:1
    }
  }
};
