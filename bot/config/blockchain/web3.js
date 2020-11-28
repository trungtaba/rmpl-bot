require('dotenv').config()

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env[`${process.env.MODE}_INFURA_HTTP`]))

module.exports = web3
