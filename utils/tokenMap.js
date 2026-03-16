// Define your token map per chain
const TOKENS = {
  ethereum: {
    NGN: "0x7777777",
    USDC: "0x555555"
  },
  base_sepolia: {
    NGN: "0xe2387F04d3858e7Cb64Ef5Ed6617f9B2fcEEAfa2",
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  },
  arbitrum: {
    NGN: "0x9999999",
    USDC: "0x7777777"
  }
}

/**
 * Get token contract address
 * @param {string} symbol - token symbol e.g., "USDC"
 * @param {string} chain - chain name e.g., "ethereum"
 * @returns {string|null} - token address or null if not found
 */
function getTokenAddress(symbol, chain = "base_sepolia") {
  const chainTokens = TOKENS[chain.toLowerCase()]
  if (!chainTokens) return null
  return chainTokens[symbol.toUpperCase()] || null
}

/**
 * Example: Get all tokens on a chain
 * @param {string} chain
 * @returns {Array<{symbol: string, address: string}>}
 */
function listTokens(chain = "base_sepolia") {
  const chainTokens = TOKENS[chain.toLowerCase()] || {}
  return Object.entries(chainTokens).map(([symbol, address]) => ({
    symbol,
    address
  }))
}

module.exports = {
  getTokenAddress,
  listTokens
}