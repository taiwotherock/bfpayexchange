const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")

// Replace with actual contract ABIs
const ABI = [
  "function quoteSwap(bool isNgn, uint256 amount) view returns (uint256)"
]

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
]

module.exports = {

  name: "fetchSwapQuote",
  description: "Fetch a swap quote from AMM contract",

  examples: [
    "quote swap 0.5 USDC to NGN",
    "how much CNGN will I get for 1 USDC",
    "get swap quote for 2 USDC on Base"
  ],

  parameters: {
    rpcUrl: "string",
    contractAddress: "string",
    tokenAddress: "string",
    amount: "string",
    isSwapStable: "boolean"
  },

  execute: async (params) => {
    try {

      const { rpcUrl, contractAddress, tokenAddress, amount, isSwapStable } = params

      if (!rpcUrl) throw new Error("rpcUrl is required")
      if (!contractAddress) throw new Error("contractAddress is required")
      if (!tokenAddress) throw new Error("tokenAddress is required")
      if (!amount) throw new Error("amount is required")

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const chain = await detectChain(provider)

      
      //const chain = networkNames[Number(network.chainId)] || `Unknown (${network.chainId})`

      const contract = new ethers.Contract(contractAddress, ABI, provider)
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

      const decimals = await tokenContract.decimals()
      const amountInt = ethers.parseUnits(amount, decimals)
      const isNgn = !isSwapStable

      console.log(`Fetching quote swap: isNgn=${isNgn}, amount=${amountInt.toString()}`)

      const outputAmountRaw = await contract.quoteSwap(isNgn, amountInt.toString());
      console.log('output ' + outputAmountRaw);
      const outputAmount = ethers.formatUnits(outputAmountRaw, decimals)

      // HTML rich response for Telegram
      const html = `
<b>🔄 Swap Quote</b>

🌐 Network: <b>${chain}</b>
💰 Input Token: <code>${amount}</code>
${isSwapStable ? "🔹 Stable Swap" : "💱 Non-Stable Swap"}

➡️ Estimated Output: <b>${outputAmount}</b>
`

      return {
        success: true,
        message: html,
        format: "HTML",
        data: {
          inputAmount: amount,
          outputAmount,
          isSwapStable,
          chain
        }
      }

    } catch (error) {

      console.error("❌ ERROR:", error.message)

      return {
        success: false,
        message: error.message || "Failed to fetch swap quote",
        code: "E999"
      }

    }
  }

}