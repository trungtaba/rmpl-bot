
const web3 = require("web3")
let HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = '147eac298c46e2e75d79cb2aabc8602c741a63063e176b52b31466bf88dca52d'
// const liveNetwork = process.env['ETH_LIVE_NETWORK']
const liveNetwork = 'https://mainnet.infura.io/v3/f2473914890349138c8b03e3ef79d165'
const testNetwork = 'https://ropsten.infura.io/v3/f2473914890349138c8b03e3ef79d165'
module.exports = {
  networks: {
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, testNetwork),
      network_id: 3,       // Ropsten's id
      gas: 7000000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, liveNetwork),
      network_id: 1,
      gas: 3000000,
      confirmations: 2,
      timeoutBlocks: 400,
      gasPrice: web3.utils.toWei('25', 'gwei'),
      skipDryRun: true
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
  },
  compilers: {
    solc: {
      version: "^0.7.0"
    }
  }
}
