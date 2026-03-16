const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")

// Replace with your actual AMM ABI
const ABI = [
  "function isLPWhitelisted(address lp) view returns (bool)",
  "function addLiquidity(address token, uint256 amount) returns (bytes32)"
]

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)"
]

module.exports = {
  name: "addLiquidity",
  description: "Add liquidity to AMM contract",
  
  examples: [
    "add 100 USDC liquidity",
    "add liquidity 0.5 USDC",
    "provide 2 NGN to liquidity pool"
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
      const chain = await detectChain(provider)
      const wallet = new ethers.Wallet(key, provider)
      const publicAddress = await wallet.getAddress()

      const network = await provider.getNetwork()
      

      const contract = new ethers.Contract(contractAddress, ABI, wallet)
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)

      // Check user balance
      const walletBal = await tokenContract.balanceOf(publicAddress)
      const decimals = await tokenContract.decimals()
      const userBal = Number(ethers.formatUnits(walletBal, decimals))
      if (userBal < Number(amount)) {
        return { success: false, message: "Insufficient balance", code: "E99" }
      }

      // Check whitelist
      const isWhitelisted = await contract.isLPWhitelisted(publicAddress)
      if (!isWhitelisted) {
        return { success: false, message: "Address not whitelisted", code: "E98" }
      }

      // Approve token
      const amountInt = ethers.parseUnits(amount, decimals)
      const approveTx = await tokenContract.approve(contractAddress, amountInt)
      await approveTx.wait()
      console.log('Approved')

      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(3000);

      // Add liquidity
      const txAdd = await contract.addLiquidity(tokenAddress, amountInt)
      const receipt = await txAdd.wait()
      console.log(txAdd.hash)

      const html = `
<b>💧 Liquidity Added</b>

🌐 Network: <b>${chain}</b>
👛 Wallet: <code>${publicAddress}</code>
💰 Amount: <b>${amount}</b>
✅ Transaction Hash: <code>${txAdd.hash}</code>
🚀 Web3 Wallet Bot
`

      return { success: true, message: html, format: "HTML", data: { txHash: receipt.transactionHash, amount, chain } }

    } catch (error) {
      console.error("❌ ERROR:", error.message)
      return { success: false, message: error.message || "Add liquidity failed", code: "E999" }
    }
  }
}