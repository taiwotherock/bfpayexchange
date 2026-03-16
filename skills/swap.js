const { ethers } = require("ethers")
const { detectChain } = require("../blockchain/provider")

// Replace with your actual ABIs
const ABI = [
  "function isLPWhitelisted(address lp) view returns (bool)",
  "function currentRates() view returns (uint256 buy, uint256 sell, uint256 mid, uint256 stale)",
  "function calculateSwap(bool isStable, uint256 amount) view returns (uint256)",
  "function swapUSDtoNGN(uint256 amount, uint256 minAmount) returns (bytes32)"
]

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)"
]

module.exports = {
  name: "swap",
  description: "Execute a swap transaction on the AMM",
  
  examples: [
    "swap 1 USDC to NGN",
    "perform swap of 0.5 USDC to NGN",
    "swap 2 USDC using Base"
  ],

  parameters: {
    key: "string",               // private key (encrypted)
    rpcUrl: "string",
    contractAddress: "string",
    tokenAddress: "string",
    walletAddress: "string",
    amount: "string",
    isSwapStable: "boolean"
  },

  execute: async ({ key, rpcUrl, contractAddress, tokenAddress, walletAddress, amount, isSwapStable }) => {
    try {

      if (!key) throw new Error("Private key required")
      if (!rpcUrl || !contractAddress || !tokenAddress  || !amount) {
        throw new Error("Missing required parameters")
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const chain = await detectChain(provider)
      const wallet = new ethers.Wallet(key, provider)
      const publicAddress = await wallet.getAddress()

      console.log(`Wallet: ${publicAddress} on ${chain}`)

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

      // Approve
      const amountInt = ethers.parseUnits(amount, decimals)
      const approveTx = await tokenContract.approve(contractAddress, amountInt)
      await approveTx.wait()
      console.log(`✅ Approved ${amount} tokens to AMM contract`)


      // Get rates
      const [buy, sell] = await contract.currentRates()
      let rateToUse, minAmt
      if (isSwapStable) {
        rateToUse = Number(ethers.formatUnits(buy, decimals))
        minAmt = (rateToUse * Number(amount)).toString()
      } else {
        rateToUse = Number(ethers.formatUnits(sell, decimals))
        minAmt = (Number(amount) / rateToUse).toString()
      }

      console.log('minAmt ' + minAmt );
      let minAmt3 = Number(minAmt) - 0.215;

      const minAmt2 = ethers.parseUnits(minAmt3.toString(), 6);
      console.log('am2t ' + minAmt2 );
      
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(3000);

      const txSwap = await contract.swapUSDtoNGN(amountInt, minAmt2);
      const receipt = await txSwap.wait();

      // HTML response for Telegram
      const html = `
<b>💱 Swap Executed</b>

🌐 Network: <b>${chain}</b>
👛 Wallet: <code>${publicAddress}</code>
💰 Amount: <b>${amount}</b> (${isSwapStable ? "Stable" : "Non-Stable"} Swap)
📊 Rate Used: <b>${rateToUse}</b>
✅ Transaction Hash: <code>${txSwap.hash}</code>

🚀 Web3 Wallet Bot
`

      return {
        success: true,
        message: html,
        format: "HTML",
        data: {
          txHash: receipt.transactionHash,
          amount,
          rateUsed: rateToUse,
          chain
        }
      }

    } catch (error) {
      console.error("❌ ERROR:", error.message)
      return { success: false, message: error.message || "Swap failed", code: "E999" }
    }
  }
}