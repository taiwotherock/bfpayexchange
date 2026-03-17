// skills/getPool.js
const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")
require("dotenv").config()

// Minimal Uniswap V3 Factory ABI
const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
  "function quoteExactInput( address tokenIn, address tokenOut, uint24 fee, uint256 amountIn ) external returns (uint256 amountOut)"
]

module.exports = {
  name: "getPool",
  description: "Fetch AMM pool address for a token pair and fee",

  parameters: {
    tokenA: "string",
    tokenB: "string",
    fee: "number",
    rpcUrl: "string"
  },

  execute: async ({ tokenA, tokenB, fee, rpcUrl }) => {
    try {
      if (!tokenA || !tokenB) throw new Error("Token addresses are required")
      if (!fee) fee = 3000  // default fee 0.3%

      console.log(rpcUrl + ' ' + tokenA)
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contractAddress = process.env.BF_LIQUIDITY_ENGINE_ADDRESS
      console.log('contract ' + contractAddress)
      const chain = await detectChain(provider);

      const factoryContract = new ethers.Contract('0x33128a8fC17869897dcE68Ed026d694621f6FDfD', FACTORY_ABI, provider)

      const amountInBN = ethers.parseUnits('1', 6);

    // Call the function using callStatic to avoid sending tx
   /*const amountOutBN = await factoryContract.quoteExactInput.staticCall(
  tokenA,
  tokenB,
  fee,
  amountInBN
);

    console.log(amountOutBN)*/

      const poolAddress = await factoryContract.getPool(tokenA, tokenB, fee)

      console.log('pool ' + poolAddress)

      if (poolAddress === ethers.ZeroAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Pool not found for this token pair and fee")
      }

      const html = `
🏞️ <b>AMM Pool Address</b>

Token A: <code>${tokenA}</code>
Token B: <code>${tokenB}</code>
Fee: <b>${fee / 10000}%</b>

📌 Pool: <code>${poolAddress}</code>
      `

      return {
        success: true,
        message: html,
        format: "HTML"
      }
    } catch (error) {

        console.log(error)
         const reason =
      error.reason ||
      error.shortMessage ||
      error.error?.message ||
      "Contract Call failed"

      return {
        success: false,
        error: 'Error: ' + reason
      }
    }
  }
}