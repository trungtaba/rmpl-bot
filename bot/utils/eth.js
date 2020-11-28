const web3 = require('../config/blockchain/web3')
const Tx = require("ethereumjs-tx").Transaction
const {convertExpToDec}=require('./math')

//contract
const quickScopeContract = require('../config/blockchain/quick-scope')
const uniswapV2Route02Contract = require('../config/blockchain/UniswapV2Router02')

const ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "who",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]

async function getBalance(erc20Address, decimals, account) {
    const erc20Contract = new web3.eth.Contract(ABI, erc20Address)
    let balance = (await erc20Contract.methods.balanceOf(account).call({ from: process.env[`${process.env.MODE}_ACCCOUNT_ADDRESS`] }) / 10 ** decimals)
    return balance
}

async function createQuickScopeTransaction(from, privateKey, pairAddress, gToken, tToken, amountGIn) {
    try {
        // Use BigNumber
        let decimals = web3.utils.toBN(0);
        const amount = web3.utils.toBN(parseInt(amountGIn))
        let value = '0x' + amount.mul(web3.utils.toBN(10).pow(decimals)).toString('hex');
        console.log(value)
        var count = await web3.eth.getTransactionCount(from);
        console.log(count)
        var data = quickScopeContract.methods.quickScope(pairAddress, gToken, tToken, value)
        let gasPrice = web3.utils.toHex(web3.utils.toWei(process.env[`${process.env.MODE}_GAS_PRICE`].toString(), 'gwei'))
        const gasLimit = process.env[`${process.env.MODE}_GAS_LIMIT`]

        var rawTransaction = {
            "from": from,
            "nonce": web3.utils.toHex(count),
            "gasPrice": web3.utils.toHex(gasPrice),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": process.env[`${process.env.MODE}_QUICK_SCOPE_ADDRESS`],
            "value": web3.utils.toHex(0),
            "data": data.encodeABI(),
            "chainId": process.env[`${process.env.MODE}_CHAIN_ID`]
        }

        var privKey = Buffer.from(privateKey, 'hex');
        var tx = new Tx(rawTransaction, { 'chain': process.env[`${process.env.MODE}_CHAIN_NAME`] });

        tx.sign(privKey);
        var serializedTx = tx.serialize();
        let transaction = '0x' + serializedTx.toString('hex')
        return transaction
    } catch (error) {
        console.log(error)
    }
}

async function getCurrentBlock() {
    return await web3.eth.getBlockNumber()
}

async function getCurrentTimestamp() {
    const currentBlock = await getCurrentBlock()
    const currentBlockHeader = await web3.eth.getBlock(currentBlock)
    return currentBlockHeader.timestamp
}

async function createSwapTransaction(from, privateKey, amountIn, amountOutMin, token1, token2, decimals1) {
    try {
        let current = await getCurrentTimestamp()
        console.log(current)
        current = web3.utils.toBN(current)
        const path = [token1, token2]
        // Use BigNumber
        decimals1 = web3.utils.toBN(decimals1)

        // console.log(BigInt(amountOuctMin*(10**decimals2)).toString())
        amountIn = web3.utils.toBN(BigInt(amountIn*(10**decimals1)).toString())
        amountOutMin = web3.utils.toBN(BigInt(amountOutMin).toString())
        amountIn = '0x' + amountIn.toString('hex')
        amountOutMin = '0x' + amountOutMin.toString('hex')
        const deadline = '0x' + current.add(web3.utils.toBN(1000)).toString('hex')
        var count = await web3.eth.getTransactionCount(from)
        let data
        if (token1 == process.env[`${process.env.MODE}_WETH_TOKEN_ADDRESS`]) {
            data = uniswapV2Route02Contract.methods.swapExactETHForTokens(amountOutMin, path, from, deadline)
        } else if (token2 == process.env[`${process.env.MODE}_WETH_TOKEN_ADDRESS`]) {
            data = uniswapV2Route02Contract.methods.swapExactTokensForETH(amountOutMin, path, from, deadline)
        } else {
            data = uniswapV2Route02Contract.methods.swapExactTokensForTokens(amountIn, amountOutMin, path, from, deadline)
        }
        let gasPrice = web3.utils.toHex(web3.utils.toWei(process.env[`${process.env.MODE}_GAS_PRICE`].toString(), 'gwei'))
        const gasLimit = process.env[`${process.env.MODE}_GAS_LIMIT`]

        var rawTransaction = {
            "from": from,
            "nonce": web3.utils.toHex(count),
            "gasPrice": web3.utils.toHex(gasPrice),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": process.env[`${process.env.MODE}_UNISWAP_V2_ROUTE_02_ADDRESS`],
            "value": web3.utils.toHex(0),
            "data": data.encodeABI(),
            "chainId": process.env[`${process.env.MODE}_CHAIN_ID`]
        }

        var privKey = Buffer.from(privateKey, 'hex');
        var tx = new Tx(rawTransaction, { 'chain': process.env[`${process.env.MODE}_CHAIN_NAME`] });

        tx.sign(privKey);
        var serializedTx = tx.serialize();
        let transaction = '0x' + serializedTx.toString('hex')
        return transaction
    } catch (error) {
        console.log(error)
    }
}

async function performSwapTransaction(from, privateKey, amountIn, amountOutMin, token1, token2, decimals1, decimals2) {
    try {
        const transaction = await createSwapTransaction(from, privateKey, amountIn, amountOutMin, token1, token2, decimals1, decimals2)
        return await performTransaction(transaction)
    } catch (error) {
        console.log(`error = ${error}`)
    }
}

async function performTransaction(transaction) {
    try {
        const receipt = await web3.eth.sendSignedTransaction(transaction)
        // console.log(`performTransaction receipt = ${JSON.stringify(receipt)}`)
        if (receipt.status) {
            return receipt
        }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = {
    performSwapTransaction, getBalance
}