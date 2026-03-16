const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")

// Replace with your actual AMM ABI
const ABI = [
  "function isLPWhitelisted(address lp) view returns (bool)",
  "function removeLiquidity(address token, uint256 amount) returns (bytes32)"
]

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
]

module.exports = {
  name: "removeLiquidity",
  description: "Remove liquidity from AMM contract",
  
  examples: [
    "remove 50 USDC liquidity",
    "withdraw 1 NGN from pool",
    "remove liquidity 2 USDC"
  ],

  parameters: {
    key: "string",               // private key (encrypted)
    rpcUrl: "string",
    contractAddress: "string",
    tokenAddress: "string",
    amount: "string"
  },

  execute: async ({ key, rpcUrl, contractAddress, tokenAddress, amount }) => {
    try {

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const wallet = new ethers.Wallet(key, provider)
      const publicAddress = await wallet.getAddress()

      const network = await provider.getNetwork()
      const chain = await detectChain(provider)

      const contract = new ethers.Contract(contractAddress, ABI, wallet)
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)

      // Check whitelist
      const isWhitelisted = await contract.isLPWhitelisted(publicAddress)
      if (!isWhitelisted) {
        return { success: false, message: "Address not whitelisted", code: "E98" }
      }

      // Remove liquidity
      const decimals = await tokenContract.decimals()
      const amountInt = ethers.parseUnits(amount, decimals)
      const txRemove = await contract.removeLiquidity(tokenAddress, amountInt)
      const receipt = await txRemove.wait()

      const html = `
💧 <b>Liquidity Removed</b>

🌐 Network: <b>${chain}</b>
👛 Wallet: <code>${publicAddress}</code>
💰 Amount: <b>${amount}</b>
✅ Transaction Hash: <code>${txRemove.hash}</code>
🚀 Web3 Wallet Bot
`

      return { success: true, message: html, format: "HTML", data: { txHash: txRemove.hash, amount, chain } }

    } catch (error) {
      console.error("❌ ERROR:", error.message)
      return { success: false, message: error.message || "Remove liquidity failed", code: "E999" }
    }
  }
}