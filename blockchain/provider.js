// blockchain/provider.js

// Load ethers.js
const { ethers } = require("ethers")

// Multi-chain RPC providers
const providers = {
  base: process.env.BASE_RPC ? new ethers.JsonRpcProvider(process.env.BASE_RPC) : null,
  base_sepolia: process.env.BASE_RPC ? new ethers.JsonRpcProvider(process.env.BASE_RPC) : null,
  polkadot: process.env.POLKADOT_RPC ? new ethers.JsonRpcProvider(process.env.POLKADOT_RPC) : null,
  polygon: process.env.POLY_RPC ? new ethers.JsonRpcProvider(process.env.POLY_RPC) : null
}

/**
 * Get provider by chain name
 * @param {string} chain - 'ethereum', 'arbitrum', 'polygon'
 * @returns {ethers.JsonRpcProvider}
 */
function getProvider(chain) {
  const provider = providers[chain.toLowerCase()]
  if (!provider) throw new Error(`Unsupported chain: ${chain}`)
  return provider
}

async function detectChain(provider){

 const network = await provider.getNetwork()

 const chains = {
   1: "Ethereum",
   8453: "Base",
   42161: "Arbitrum",
   84532: "Base Sepolia"
 }

 return chains[Number(network.chainId)] || `Unknown (${network.chainId})`
}

module.exports = { getProvider,detectChain }