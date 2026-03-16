const { ethers } = require("ethers")

// AMM Contract ABI (minimal functions required)
const ABI = [
  "function getTodayStats() view returns (tuple(uint256 swapVolumeNGN,uint256 swapVolumeUSD,uint256 swapCountNGN,uint256 swapCountUSD,uint256 lpFeeUSD,uint256 lpFeeCNGN,uint256 platformFeeUSD,uint256 platformFeeCNGN,uint256 liquidityAddedUSD,uint256 liquidityAddedCNGN,uint256 liquidityRemovedUSD,uint256 liquidityRemovedCNGN))",
  "function currentRates() view returns (uint256 buy,uint256 sell,uint256 mid,bool stale)",
  "function getPoolDepth() view returns (uint256 poolUSD, uint256 poolNGN)",
 
]

module.exports = {

  name: "ammDashboard",
  description: "AMM Pool Dashboard and analytics",

  examples: [
    "show amm dashboard",
    "amm pool stats",
    "amm analytics"
  ],

  parameters: {
    rpcUrl: "string",
    contractAddress: "string"
  },

  execute: async ({ rpcUrl, contractAddress }) => {

    try {

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, ABI, provider)

      console.log("📊 Fetching AMM analytics...")

      const todayStats = await contract.getTodayStats()
      console.log("Done 1")

      const rates = await contract.currentRates()
      console.log("Done 2")
      const poolDepth = await contract.getPoolDepth()
      console.log("Done 3")
      //const poolStats = await contract.fetchPoolStats()

      const stats = {
        swapVolumeNGN: ethers.formatUnits(todayStats.swapVolumeNGN, 6),
        swapVolumeUSD: ethers.formatUnits(todayStats.swapVolumeUSD, 6),
        swapCountNGN: todayStats.swapCountNGN.toString(),
        swapCountUSD: todayStats.swapCountUSD.toString(),
        lpFeeUSD: ethers.formatUnits(todayStats.lpFeeUSD, 6),
        lpFeeCNGN: ethers.formatUnits(todayStats.lpFeeCNGN, 6),
        platformFeeUSD: ethers.formatUnits(todayStats.platformFeeUSD, 6),
        platformFeeCNGN: ethers.formatUnits(todayStats.platformFeeCNGN, 6),
        liquidityAddedUSD: ethers.formatUnits(todayStats.liquidityAddedUSD, 6),
        liquidityAddedCNGN: ethers.formatUnits(todayStats.liquidityAddedCNGN, 6),
        liquidityRemovedUSD: ethers.formatUnits(todayStats.liquidityRemovedUSD, 6),
        liquidityRemovedCNGN: ethers.formatUnits(todayStats.liquidityRemovedCNGN, 6)
      }

      const buyRate = ethers.formatUnits(rates.buy, 6)
      const sellRate = ethers.formatUnits(rates.sell, 6)
      const midRate = ethers.formatUnits(rates.mid, 6)

      const poolDepositNGN = ethers.formatUnits(poolDepth.poolNGN, 6)
      const poolDepositUSD = ethers.formatUnits(poolDepth.poolUSD, 6)

      const html = `
📊 <b>AMM Pool Dashboard</b>

━━━━━━━━━━━━━━━━━━
💱 <b>Exchange Rates</b>

🟢 Buy Rate: <b>${buyRate}</b>
🔴 Sell Rate: <b>${sellRate}</b>
🟡 Mid Rate: <b>${midRate}</b>

━━━━━━━━━━━━━━━━━━
🏦 <b>Pool Liquidity</b>

🇳🇬 NGN Pool Deposit: <b>${poolDepositNGN}</b>
💵 USD Pool Deposit: <b>${poolDepositUSD}</b>

━━━━━━━━━━━━━━━━━━
📈 <b>Today's Trading Activity</b>

🔄 Swap Volume NGN: <b>${stats.swapVolumeNGN}</b>
💵 Swap Volume USD: <b>${stats.swapVolumeUSD}</b>

🔢 Swap Count NGN: <b>${stats.swapCountNGN}</b>
🔢 Swap Count USD: <b>${stats.swapCountUSD}</b>

━━━━━━━━━━━━━━━━━━
💰 <b>Fees Generated</b>

🏦 LP Fee USD: <b>${stats.lpFeeUSD}</b>
🇳🇬 LP Fee NGN: <b>${stats.lpFeeCNGN}</b>

🏛 Platform Fee USD: <b>${stats.platformFeeUSD}</b>
🇳🇬 Platform Fee NGN: <b>${stats.platformFeeCNGN}</b>

━━━━━━━━━━━━━━━━━━
💧 <b>Liquidity Movement</b>

➕ Liquidity Added USD: <b>${stats.liquidityAddedUSD}</b>
➕ Liquidity Added NGN: <b>${stats.liquidityAddedCNGN}</b>

➖ Liquidity Removed USD: <b>${stats.liquidityRemovedUSD}</b>
➖ Liquidity Removed NGN: <b>${stats.liquidityRemovedCNGN}</b>

━━━━━━━━━━━━━━━━━━
🚀 <i>Powered by BfPay Exchange</i>
`

      return {
        success: true,
        message: html,
        format: "HTML"
        }

    } catch (error) {

      console.error("❌ ERROR:", error.message)

       const reason =
      error.reason ||
      error.shortMessage ||
      error.error?.message ||
      "Contract Call failed"

      return {
        success: false,
        message: 'Error:' + reason,
        code: "E999"
      }
    }

  }

}