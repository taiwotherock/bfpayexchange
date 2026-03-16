const helpText = `
🤖 <b>BfPay Exchange Bot Help</b>

Welcome! You can control your on-chain wallet directly from Telegram.

━━━━━━━━━━━━━━━━━━
💰 <b>Wallet & Balance</b>

🔹 <code>balance 0xYourAddress</code>  
Check wallet balance

🔹 <code>balance 0xYourAddress on base</code>  
Check wallet balance on specific chain

━━━━━━━━━━━━━━━━━━
🔄 <b>Token Swap</b>

🔹 <code>swap 0.5 USDC to NGN</code>  
Swap USDC → NGN

🔹 <code>swap 1 NGN to USDC</code>  
Swap NGN → USDC

🔹 <code>quote swap 1 USDC to NGN</code>  
Get swap quote before trading

━━━━━━━━━━━━━━━━━━
💧 <b>Liquidity Pool</b>

🔹 <code>add 100 USDC liquidity</code>  
Add liquidity to pool

🔹 <code>remove 50 USDC liquidity</code>  
Remove liquidity from pool

🔹 <code>view lp position</code>  
View your liquidity pool position

🔹 <code>fetch my position</code>  
Check LP share and pool contribution

━━━━━━━━━━━━━━━━━━
📊 <b>AMM Dashboard & Analytics</b>

🔹 <code>amm dashboard</code>  
View AMM pool analytics

🔹 <code>show amm stats</code>  
View today's trading volume, fees, and liquidity

🔹 <code>amm analytics</code>  
View pool depth, rates, and swap activity

━━━━━━━━━━━━━━━━━━
🌐 <b>Supported Networks</b>

🔵 Base  
🔷 Ethereum  
🟣 Arbitrum

Example:

<code>swap 1 USDC to NGN on base</code>

━━━━━━━━━━━━━━━━━━
🚀 <b>Powered by BfPay Exchange Bot</b>
`

module.exports = helpText