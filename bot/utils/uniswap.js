require('dotenv').config()
const { ChainId, Token, WETH, Route, Fetcher, Trade, Percent, TokenAmount, TradeType } = require('@uniswap/sdk')

async function getConfig() {
    try {
        //get chainId
        const chainId = ChainId[`${process.env.MODE}`]
        //get addresses
        const rmplTokenAddress = process.env[`${process.env.MODE}_RMPL_TOKEN_ADDRESS`]
        const rcoreTokenAddress = process.env[`${process.env.MODE}_RCORE_TOKEN_ADDRESS`]
        //rmpl token
        const rpmlDecimals = 9
        const rmplToken = new Token(chainId, rmplTokenAddress, rpmlDecimals, 'RMPL', 'RMPL')
        //rcore token
        const rcoreDecimals = 18
        const rcoreToken = new Token(chainId, rcoreTokenAddress, rcoreDecimals, 'RCORE', 'RCORE')
        //pair
        const rmplWethPair = await Fetcher.fetchPairData(rmplToken, WETH[rmplToken.chainId])
        const rcoreWethPair = await Fetcher.fetchPairData(rcoreToken, WETH[rcoreToken.chainId])
        const rcoreRmplPair = await Fetcher.fetchPairData(rcoreToken, rmplToken)
        // route
        let wethRmplRoute = new Route([rmplWethPair], WETH[rmplToken.chainId])
        let wethRcoreRoute = new Route([rcoreWethPair], WETH[rmplToken.chainId])
        let rmplRcoreRoute = new Route([rcoreRmplPair], rmplToken)
        let rmplWethRoute = new Route([rmplWethPair], rmplToken)
        let rcoreWethRoute = new Route([rcoreWethPair], rcoreToken)
        let rcoreRmplRoute = new Route([rcoreRmplPair], rcoreToken)

        return { rmplToken, rcoreToken, wethRmplRoute, wethRcoreRoute, rmplRcoreRoute, rmplWethRoute, rcoreWethRoute, rcoreRmplRoute }
    } catch (error) {
        console.log(error)
    }
}

function getPrice(route, token, amount) {
    let trade = new Trade(route, new TokenAmount(token, amount), TradeType.EXACT_INPUT)
    const slippageTolerance = new Percent(process.env[`${process.env.MODE}_SLIPPAGE_TOLERANCE`], '1000')
    return {
        executionPrice: trade.executionPrice.toSignificant(6),
        minimumAmount: trade.minimumAmountOut(slippageTolerance).raw,
        priceImpact: trade.priceImpact
    }
}

module.exports = {
    getConfig, getPrice
}