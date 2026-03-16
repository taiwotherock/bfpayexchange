// skills/transfer.js
const { loadWallet } = require("../wallet/walletmanager")
const { ethers } = require("ethers")

module.exports = {
  name: "transfer",
  description: "Send ETH (or native token) to another wallet",
  
  parameters: {
    userId: "string",   // user identifier
    to: "string",       // recipient address
    amount: "number",   // amount to send in ETH
    chain: "string"     // blockchain: ethereum, arbitrum, polygon
  },

  execute: async (params) => {
    try {
      const { userId, to, amount, chain } = params

      if (!userId) throw new Error("userId is required")
      if (!to || !ethers.isAddress(to)) throw new Error("Valid recipient address required")
      if (!amount || isNaN(amount) || Number(amount) <= 0) throw new Error("Amount must be greater than 0")
      if (!chain) throw new Error("Chain is required")

      // Load the user's wallet for the given chain
      const wallet = await loadWallet(userId, chain)

      // Prepare transaction
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString())
      })

      return {
        success: true,
        message: `Transaction submitted`,
        hash: tx.hash
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}