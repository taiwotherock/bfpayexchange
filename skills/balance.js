// skills/balance.js
const { getProvider,detectChain } = require("../blockchain/provider")
const { ethers } = require("ethers")

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
]

// Supported tokens
const TOKENS = {
  base_sepolia: {
    //WETH: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    //USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    //XAUT: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    CNGN: "0xe2387F04d3858e7Cb64Ef5Ed6617f9B2fcEEAfa2" // replace with actual

  }
}

module.exports = {
  name: "balance",
  description: "Get wallet balances for USDC and NGN",

  parameters: {
    address: "string",
    chain: "string"
  },

  execute: async ({ address, chain }) => {
    try {

      console.log('chain ' + chain)
      if (!address) throw new Error("Wallet address is required")
      //if (!chain) chain = "ethereum"

      const provider = getProvider(chain)
      if (!provider) throw new Error(`Unsupported chain: ${chain}`)

      const network = await detectChain(provider)

      console.log('network ' + network)

      const balances = {}

      // Native ETH
      const ethBalance = await provider.getBalance(address)
      balances.ETH = ethers.formatEther(ethBalance)

      // ERC20 tokens
      const tokenList = TOKENS[chain] || {}

      for (const [symbol, tokenAddress] of Object.entries(tokenList)) {
        try {
          console.log('sym ' + symbol + ' ' + tokenAddress)
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
          const raw = await contract.balanceOf(address)
          const decimals = await contract.decimals()
          console.log('bal ' + raw)
          balances[symbol] = ethers.formatUnits(raw, decimals)
        } catch (err) {
          balances[symbol] = "0"
        }
      }

      // Telegram HTML message
      let html = `💰 <b>Wallet Balance</b>\n\n`
      html += `👛 <b>Address:</b>\n<code>${address}</code>\n\n`
      html += `🌐 <b>Network:</b> ${network}\n\n`
      html += `📊 <b>Assets</b>\n\n`

      const emojis = {
        ETH: "⛓️",
        WETH: "🟡",
        USDC: "💵",
        USDT: "💲",
        XAUT: "🥇",
        CNGN: "🇳🇬"
      }

      for (const [token, value] of Object.entries(balances)) {
        html += `${emojis[token] || "🪙"} <b>${token}</b>: <code>${Number(value).toFixed(6)}</code>\n`
      }

      html += `\n🚀 <i>Powered by Web3 Wallet Bot</i>`

      return {
        success: true,
        message: html,
        format: "HTML"
      }

    } catch (error) {
      console.log(error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}