let { WETH } = require('@uniswap/sdk')
let { getConfig, getPrice } = require('./utils/uniswap')
let { changeDecToHex, changeJsbiToDec } = require('./utils/math')
let { performSwapTransaction, getBalance } = require('./utils/eth')
/*
strategy 1: rcore->eth->rmpl->rcore
strategy 2: rcore->rmpl->eth->rcore
*/
async function trace() {
    const { rmplToken, rcoreToken, wethRmplRoute, wethRcoreRoute, rmplRcoreRoute, rmplWethRoute, rcoreWethRoute, rcoreRmplRoute } = await getConfig()
    while (true) {
        try {
            //get the RCORE balance
            let rcoreBalance = await getBalance(process.env[`${process.env.MODE}_RCORE_TOKEN_ADDRESS`],
                process.env[`${process.env.MODE}_RCORE_TOKEN_DECIMALS`], process.env[`${process.env.MODE}_ACCCOUNT_ADDRESS`])
            // console.log(rcoreBalance)

            rcoreBalance=100

            console.log('Check strategy 1')
            console.log('rcore->eth')
            let rcoreBalanceHex = changeDecToHex(rcoreBalance, process.env[`${process.env.MODE}_RCORE_TOKEN_DECIMALS`])
            // console.log(rcoreBalanceHex)
            let data = getPrice(rcoreWethRoute, rcoreToken, rcoreBalanceHex)
            let executionPriceEth = data.executionPrice
            console.log('eth->rmpl')
            let ethBalance = (executionPriceEth * rcoreBalance).toFixed(process.env[`${process.env.MODE}_WETH_TOKEN_DECIMALS`])
            let ethBalanceHex = changeDecToHex(ethBalance, process.env[`${process.env.MODE}_WETH_TOKEN_DECIMALS`])
            data = getPrice(wethRmplRoute, WETH[process.env[`${process.env.MODE}_CHAIN_ID`]], ethBalanceHex)
            let executionPriceRmpl = data.executionPrice
            let rmplBalance = (executionPriceRmpl * ethBalance).toFixed(process.env[`${process.env.MODE}_RMPL_TOKEN_DECIMALS`])
            console.log('rmpl->rcore')
            let rmplBalanceHex = changeDecToHex(rmplBalance, process.env[`${process.env.MODE}_RMPL_TOKEN_DECIMALS`])
            data = getPrice(rmplRcoreRoute, rmplToken, rmplBalanceHex)
            let executionPriceRcore = data.executionPrice
            let rcoreBalanceWillReceived = executionPriceRcore * rmplBalance
            // console.log(rcoreBalanceWillReceived)
            // console.log(rcoreBalance * (1 + parseFloat(process.env.MIN_PROFIT)))
            if (rcoreBalanceWillReceived >= rcoreBalance * (1 + parseFloat(process.env.MIN_PROFIT))) {
                console.log("Perform rcore->eth->rmpl->rcore")
                //call quickScope contract here

                continue
            }


            console.log('Check strategy 2')
            console.log('rcore->rmpl')
            data = getPrice(rcoreRmplRoute, rcoreToken, rcoreBalanceHex)
            executionPriceRmpl = data.executionPrice
            rmplBalance = (executionPriceRmpl * rcoreBalance).toFixed(process.env[`${process.env.MODE}_RMPL_TOKEN_DECIMALS`])
            console.log('rmpl->eth')
            rmplBalanceHex = changeDecToHex(rmplBalance, process.env[`${process.env.MODE}_RMPL_TOKEN_DECIMALS`])
            data = getPrice(rmplWethRoute, rmplToken, rmplBalanceHex)
            executionPriceEth = data.executionPrice
            ethBalance = (executionPriceEth * rmplBalance).toFixed(process.env[`${process.env.MODE}_WETH_TOKEN_DECIMALS`])
            console.log('eth->rcore')
            ethBalanceHex = changeDecToHex(ethBalance, process.env[`${process.env.MODE}_WETH_TOKEN_DECIMALS`])
            data = getPrice(wethRcoreRoute, WETH[process.env[`${process.env.MODE}_CHAIN_ID`]], ethBalanceHex)
            executionPriceRcore = data.executionPrice
            rcoreBalanceWillReceived = executionPriceRcore * ethBalance
            
            if (rcoreBalanceWillReceived >= rcoreBalance * (1 + parseFloat(process.env.MIN_PROFIT))) {
                console.log("Perform rcore->rmpl->eth->rcore")
                //call quickScope contract here

                continue
            }
        } catch (error) {
            console.log(error)
        }
    }
}



trace()