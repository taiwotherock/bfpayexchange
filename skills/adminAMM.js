const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")

// Replace with your actual AMM ABI
const ABI = [
  "function commitPrice(uint256 rate) returns (bool)",
  "function applyPrice() returns (bool)",
  "function setSpread(uint256 spread) returns (bool)",
  "function currentRates() view returns (uint256 buy, uint256 sell, uint256 mid, uint256 stale)",
  "function getPoolDepth() view returns (uint256)",
  "function whitelistLP(address lp, bool allowed) returns (bool)"
]

module.exports = {
  name: "adminAMM",
  description: "Admin functions: set rate, set spread, whitelist LP address",
  
  examples: [
    "set rate 5000",
    "update spread 20",
    "whitelist address 0x1234..."
  ],

  parameters: {
    key: "string",           // private key
    rpcUrl: "string",
    contractAddress: "string",
    action: "string",        // "setRate", "setSpread", "whitelist"
    value: "string",         // rate, spread, or address
  },

  execute: async ({ key, rpcUrl, contractAddress, action, value }) => {
    try {

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const wallet = new ethers.Wallet(key, provider)
      const publicAddress = await wallet.getAddress()

      const network = await provider.getNetwork()
      const chain = await detectChain(provider);

      const contract = new ethers.Contract(contractAddress, ABI, wallet)
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

      let html = `<b>🛠️ AMM Admin Action</b>\n\n🌐 Network: <b>${chain}</b>\n👛 Admin: <code>${publicAddress}</code>\n`

      switch(action) {

        case "setRate": {
          const rateInt = ethers.parseUnits(value, 6)
          const txCommit = await contract.commitPrice(rateInt)
          html += `⏳ Committing rate: <b>${value}</b>\n`
          await sleep(70000) // wait for commit period

          const txApply = await contract.applyPrice()
          html += `✅ Rate applied: <b>${value}</b>\n`

          const rates = await contract.currentRates()
          html += `📊 Current Rates: buy=${ethers.formatUnits(rates.buy,6)}, sell=${ethers.formatUnits(rates.sell,6)}\n`
          break
        }

        case "setSpread": {
          const spreadInt = ethers.parseUnits(value.toString(), 6)
          const tx = await contract.setSpread(spreadInt)
          await tx.wait()
          html += `✅ Spread set to: <b>${value}</b>\n`
          break
        }

        case "whitelist": {
          const tx = await contract.whitelistLP(value, true)
          await tx.wait()
          html += `✅ Address whitelisted: <code>${value}</code>\n`
          break
        }

        default:
          return { success: false, message: "Invalid action. Use setRate, setSpread, whitelist", code: "E97" }
      }

      const pools = await contract.getPoolDepth()
      html += `🏦 Pool Depth: ${pools}\n`
      html += `🚀 Web3 Wallet Bot`

      return { success: true, message: html, format: "HTML", data: { action, value, chain } }

    } catch (error) {
      console.error("❌ ERROR:", error.message)
       const reason =
        error.reason ||
        error.shortMessage ||
        error.error?.message ||
        "Admin action failed"
      return { success: false, message: 'Error:' + reason, code: "E999" }
    }
  }
}