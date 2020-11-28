'use strict'

const Web3 = require('./web3')

require('dotenv').config()
const ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "uniswapV2RouterAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "stateMutability": "payable",
        "type": "receive",
        "payable": true
    },
    {
        "inputs": [],
        "name": "context",
        "outputs": [
            {
                "internalType": "address",
                "name": "uniswapV2RouterAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "wethAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "pairAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "gToken",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "tokenTAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountGIn",
                "type": "uint256"
            }
        ],
        "name": "quickScope",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
        "payable": true
    }
]

const quickScopeAddress = process.env[`${process.env.MODE}_QUICK_SCOPE_ADDRESS`]
const quickScopeContract = new Web3.eth.Contract(ABI, quickScopeAddress)

module.exports = quickScopeContract

