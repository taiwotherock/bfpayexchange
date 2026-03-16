// skills/fetchLPPosition.js

const { detectChain } = require("../blockchain/provider")
const { ethers } = require("ethers")

// Replace with real ABI
const ABI = [
  "function fetchLPPositionStats(address lp) view returns (uint256 shareNGN, uint256 shareUSD, uint256 totalShareNGN, uint256 totalShareUSD, uint256 poolDepositNGN, uint256 poolDepositUSD)"
]



module.exports = {

  name: "fetchLPPosition",

  description: "Fetch AMM LP position statistics for a liquidity provider",

  // Example prompts for OpenClaw / AI agent
  examples: [
    "Fetch my current LP position",
    "What is my liquidity pool position for 0xe167ce487533E5a90D9513cB7bE9FA62c6840949",
    "Show liquidity position stats for wallet 0xe167ce487533E5a90D9513cB7bE9FA62c6840949"
  ],

  parameters: {
    rpcUrl: "string",
    contractAddress: "string",
    lpAddress: "string"
  },

  execute: async (params) => {

    try {

      const { rpcUrl, contractAddress, lpAddress } = params

      if (!rpcUrl) throw new Error("rpcUrl required")
      if (!contractAddress) throw new Error("contractAddress required")
      if (!lpAddress) throw new Error("lpAddress required")

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const chain = await detectChain(provider)

      const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
      )

      const stats = await contract.fetchLPPositionStats(lpAddress)

      const shareNGN = ethers.formatUnits(stats.shareNGN, 6)
      const shareUSD = ethers.formatUnits(stats.shareUSD, 6)
      const totalShareNGN = ethers.formatUnits(stats.totalShareNGN, 6)
      const totalShareUSD = ethers.formatUnits(stats.totalShareUSD, 6)
      const poolDepositNGN = ethers.formatUnits(stats.poolDepositNGN, 6)
      const poolDepositUSD = ethers.formatUnits(stats.poolDepositUSD, 6)

      // HTML formatted output (great for Telegram bots)
      const html = `
<b>📊 Liquidity Pool Position</b>

👛 <b>Wallet</b>
<code>${lpAddress}</code>

🌐 <b>Network</b>
${chain}

💰 <b>Your Share</b>
• 🇳🇬 NGN Share: <b>${shareNGN}</b>
• 💵 USD Share: <b>${shareUSD}</b>

🏦 <b>Total Pool Share</b>
• NGN Pool Share: <b>${totalShareNGN}</b>
• USD Pool Share: <b>${totalShareUSD}</b>

💧 <b>Your Deposits</b>
• 🇳🇬 NGN Deposited: <b>${poolDepositNGN}</b>
• 💵 USD Deposited: <b>${poolDepositUSD}</b>

━━━━━━━━━━━━━━━━━━
📈 <b>Status:</b> ACTIVE LP POSITION
`

      return {
        success: true,
        message: html,
        format: 'HTML',
        data: {
          shareNGN,
          shareUSD,
          totalShareNGN,
          totalShareUSD,
          poolDepositNGN,
          poolDepositUSD
        }
      }

    } catch (error) {

      return {
        success: false,
        error: error.message
      }

    }

  }

}