// Load environment variables
require("dotenv").config()

const { getTokenAddress, listTokens } = require("./utils/tokenMap")
const { decryptPrivateKey } = require("./utils/kms-client")
const helpText = require("./telegram/help")


// Import all skills
const balance = require("./skills/balance")
const transfer = require("./skills/transfer")
const fetchLPPosition = require("./skills/fetchLPPosition")
const fetchSwapQuote = require("./skills/fetchSwapQuote")
const swap = require("./skills/swap")
const addLiquidity = require("./skills/addLiquidity")
const removeLiquidity = require("./skills/removeLiquidity")
const adminAMM = require("./skills/adminAMM")
const ammDashboard = require("./skills/ammDashboard")
const getPool = require("./skills/getPool")


//const swap = require("./skills/swap")
//const portfolio = require("./skills/portfolio")

// All skills in an array
const skills = [balance, transfer,fetchLPPosition,fetchSwapQuote,
  swap,addLiquidity,removeLiquidity,adminAMM,ammDashboard,getPool]

const swapPatterns = [
  /quote swap (\d+(\.\d+)?) (\w+) to (\w+)/i,
  /how much (\w+) will I get for (\d+(\.\d+)?) (\w+)/i,
  /get swap quote for (\d+(\.\d+)?) (\w+)( on (\w+))?/i
]

const address = process.env.WALLET_ADDRESS
const addr = process.env.WALLET_ADDRESS
const rpcUrl = process.env.BASE_RPC
const contractAddress= process.env.AMM_CONTRACT_ADDRESS
const pKey= process.env.PKEY



/**
 * Simple message dispatcher
 * Parses user message and calls the correct skill
 * You can expand this with NLP or regex
 */
async function run(message, userContext = {}) {
  const msg = message.toLowerCase().trim()
  const text = msg

  // Check for Balance request
  /*if (msg.includes("balance")) {
    const skill = skills.find(s => s.name === "balance")
    return await skill.execute({
      address: userContext.address || process.env.DEFAULT_WALLET_ADDRESS,
      chain: userContext.chain || "ethereum"
    })
  }*/

  // --- 1. Balance: "balance of <address> on <chain>" ---
  //const balanceRegex = /balance of (0x[a-f0-9]{40}) on (\w+)/i
  //const balanceMatch = msg.match(balanceRegex)

  // Regex to match: "add 100 USDC liquidity", "remove 50 NGN"
  const addRegex = /add\s+([\d.]+)\s+([a-zA-Z]+)(?:\s+liquidity)?/i
  const removeRegex = /remove\s+([\d.]+)\s+([a-zA-Z]+)\s*(?:liquidity)?/
  const setRateRegex = /(set|update)\s+rate\s+(?:to\s+)?([\d.]+)/i
  const regexWhitelist = /whitelist\s+(0x[a-fA-F0-9]{6,42})/i
  const regexSpread = /set\s+spread\s+(?:to\s+)?([\d.]+)\s*(?:naira|ngn)?/i
  // Flexible regex for pool command
  const poolRegex = /fetch\s+pool\s+for\s+(0x[a-fA-F0-9]{40})\s*(?:and)?\s*(0x[a-fA-F0-9]{40})(?:\s+fee\s+(\d+))?/i
  let match, amount, fromToken, toToken, chain

if (msg.startsWith("help") ) 
{
   return {message: helpText, format:'HTML'}
}
else if (msg.startsWith("amm") || msg.includes("dashboard")) 
{
      console.log('amm dashboard ' + address)
      const skill = skills.find(s => s.name === "ammDashboard")
      const result = await skill.execute({rpcUrl:rpcUrl, contractAddress:contractAddress})
      return result
}
else if (msg.startsWith('fetch pool') || (match = text.match(poolRegex))) 
{
      console.log('fetch pool ' + address)
      match = msg.match(poolRegex)
      const tokenA = match[1]
      const tokenB = match[2]
      const fee = match[3] ? Number(match[3]) : 3000 
      console.log({ tokenA, tokenB, fee })
      const chain = "base_sepolia";
        
      const skill = skills.find(s => s.name === "getPool")
      const result = await skill.execute({tokenA:tokenA, tokenB:tokenB,fee:fee, rpcUrl:rpcUrl})
      return result
}
else if ((match = text.match(setRateRegex))) 
{
      console.log('set rate ' + address)
      const rate = match[2]
      const chain = "base_sepolia";
      console.log('from ' + rate);
      const key1 = await decryptPrivateKey(pKey);
    
      const skill = skills.find(s => s.name === "adminAMM")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        action:'setRate', value: rate})
      return result
}
else if ((match = text.match(regexWhitelist))) 
{
      console.log('whitelist ' + address)
      const addr = match[2]
      const chain = "base_sepolia";
      console.log('addr ' + addr);
      const key1 = await decryptPrivateKey(pKey);
    
      const skill = skills.find(s => s.name === "adminAMM")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        action:'whitelist', value: addr})
      return result
}
else if ((match = text.match(regexSpread))) 
{
      console.log('set spread ' + address)
      const value = match[2]
      const chain = "base_sepolia";
      console.log('value ' + value);
      const key1 = await decryptPrivateKey(pKey);
    
      const skill = skills.find(s => s.name === "adminAMM")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        action:'setSpread', value: value})
      return result
}
else if ((match = text.match(addRegex))) 
{
   console.log('add ' + address)
      const amount = match[1]
      const symbol = match[2]
      const chain = "base_sepolia";
      console.log('from ' + symbol + ' ' + amount);
      const fromAddress = getTokenAddress(symbol, chain);
      const key1 = await decryptPrivateKey(pKey);
    
      console.log('address ' + fromAddress );
      const skill = skills.find(s => s.name === "addLiquidity")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        tokenAddress:fromAddress,amount: amount})
      return result
}

if ((match = text.match(removeRegex))) 
{
   console.log('remove ' + address)
      const amount = match[1]
      const symbol = match[2]
      const chain = "base_sepolia";
      console.log('from ' + symbol + ' ' + amount);
      const fromAddress = getTokenAddress(symbol, chain);
      const key1 = await decryptPrivateKey(pKey);
    
      console.log('address ' + fromAddress );
      const skill = skills.find(s => s.name === "removeLiquidity")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        tokenAddress:fromAddress,amount: amount})
      return result
}




for (const pattern of swapPatterns) {
  match = msg.match(pattern)
  if (match) break
}

if(msg.startsWith('swap'))
{
   console.log('swap ' + address)
    const match1 = message.match(/swap (\d+(\.\d+)?) (\w+) to (\w+)/i)
    match = match1;

    if (match1) {
      const amount = match[1]
      const fromToken = match[3]
      const toToken = match[4]
      const chain = "base_sepolia";
      console.log('from ' + fromToken + ' ' + toToken);
      const fromAddress = getTokenAddress(fromToken, chain);
      const toAddress = getTokenAddress(toToken, chain);
      let isSwapStable = false;
      if(fromToken.toLowerCase().includes("usd"))
        isSwapStable = true;

      const key1 = await decryptPrivateKey(pKey);
     
      console.log('address ' + fromAddress + ' ' + toAddress);
      const skill = skills.find(s => s.name === "swap")
      const result = await skill.execute({key: key1, rpcUrl:rpcUrl, contractAddress:contractAddress,
        tokenAddress:fromAddress,amount: amount,isSwapStable:isSwapStable, walletAddress:''})
      return result
    }

}

if(msg.startsWith('quote'))
{
   console.log('quote swap ' + address)
    const match1 = message.match(/quote swap (\d+(\.\d+)?) (\w+) to (\w+)/i)

    if (match1) {
      const amount = match[1]
      const fromToken = match[3]
      const toToken = match[4]
      const chain = "base_sepolia";
      console.log('from ' + fromToken + ' ' + toToken);
      const fromAddress = getTokenAddress(fromToken, chain);
      const toAddress = getTokenAddress(toToken, chain);
      let isSwapStable = false;
      if(fromToken.toLowerCase().includes("usd"))
        isSwapStable = true;


      console.log('address ' + fromAddress + ' ' + toAddress);
      const skill = skills.find(s => s.name === "fetchSwapQuote")
      const result = await skill.execute({ rpcUrl:rpcUrl, contractAddress:contractAddress,
        tokenAddress:fromAddress,amount: amount,isSwapStable:isSwapStable})
      return result
    }

}
  
  if (msg.includes("balance")) {
    //const [, address, chain] = balanceMatch
    
    console.log('balance ' + address)
    const skill = skills.find(s => s.name === "balance")
    const result = await skill.execute({ address:address, chain:'base_sepolia' })
    return result

  }

  if (msg.includes("position")) {

    console.log('fetch LP')
    const skill = skills.find(s => s.name === "fetchLPPosition")
   
    console.log('fetch LP: ' + addr)
    const result = await skill.execute({ rpcUrl: rpcUrl,contractAddress:contractAddress,
       lpAddress: addr })
    console.log(result)
    return result


  }

  // Check for Swap request
  if (msg.includes("swap")) {
    // Example parsing: "swap 0.1 eth to usdc"
    const regex = /swap (\d*\.?\d+) (\w+) to (\w+)/i
    const match = msg.match(regex)
    if (match) {
      const [, amount, tokenIn, tokenOut] = match
      const skill = skills.find(s => s.name === "swap")
      return await skill.execute({
        userId: userContext.userId || "defaultUser",
        amount: amount,
        tokenIn: tokenIn.toUpperCase(),
        tokenOut: tokenOut.toUpperCase(),
        chain: userContext.chain || "ethereum"
      })
    }
  }

  // Check for Portfolio request
  if (msg.includes("portfolio")) {
    const skill = skills.find(s => s.name === "portfolio")
    return await skill.execute({
      address: userContext.address || process.env.DEFAULT_WALLET_ADDRESS
    })
  }

  // Check for Transfer request
  if (msg.includes("send") || msg.includes("transfer")) {
    // Example parsing: "send 0.1 eth to 0xabc..."
    const regex = /(send|transfer) (\d*\.?\d+) (\w+) to (\w+)/i
    const match = msg.match(regex)
    if (match) {
      const [, , amount, token, to] = match
      const skill = skills.find(s => s.name === "transfer")
      return await skill.execute({
        userId: userContext.userId || "defaultUser",
        to: to,
        amount: amount,
        chain: userContext.chain || "ethereum"
      })
    }
  }

  return { message: "Command not recognized. Try: balance, swap, portfolio, or transfer." }
}

// Export both skills and the run function
module.exports = {
  name: "bfpayexchange",
  skills,
  run
}