# Nigeria FX Liquidity Engine Skill

A DeFi infrastructure skill that provides instant foreign exchange liquidity between **cNGN (Crypto Naira)** and **global stablecoins**.

The platform combines **AMM liquidity pools, smart contracts, and virtual account infrastructure** to power:

- FX swaps
- programmable payments
- liquidity provisioning
- on-chain lending
- autonomous trading by AI agents

This enables **remittance operators, OTC desks, fintech platforms, and AI trading agents** to access deep Naira liquidity with **guaranteed pricing, low slippage, and MEV-protected execution**.

The system supports Ethereum-compatible networks and stablecoins such as USDC and other global digital dollars.

---

# Core Capabilities

## 🔄 Swap

Exchange stablecoins and cNGN instantly using AMM liquidity pools.

Example prompts:

- swap 1 USDC to NGN
- swap 200 NGN to USDC
- convert USDC to NGN
- trade 10 USDC for cNGN
- swap 1 USDC to NGN on base

Parameters detected automatically:

- amount
- source token
- destination token
- network (optional)

Output includes transaction hash and swap result.

---

## 💱 Swap Quote

Estimate swap output before executing a trade.

Example prompts:

- quote swap 1 USDC to NGN
- how much NGN will I get for 1 USDC
- estimate swap for 2 USDC
- get FX quote USDC to NGN

Returns estimated output amount using current AMM pricing.

---

## 💸 Transfer

Send stablecoins or cNGN to another wallet.

Example prompts:

- transfer 10 USDC to 0xAddress
- send 100 NGN to 0xWallet
- pay 20 USDC to wallet

Parameters:

- amount
- token
- destination address
- network

---

## 💰 Earn (Liquidity Provision)

Provide liquidity to FX pools and earn trading fees.

Example prompts:

- add 100 USDC liquidity
- provide liquidity 50 NGN
- deposit 200 USDC to pool
- add liquidity

Returns LP position and share of the pool.

---

## 💧 Remove Liquidity

Withdraw assets from AMM pools.

Example prompts:

- remove 50 USDC liquidity
- withdraw liquidity
- remove 20 NGN from pool

Returns transaction confirmation and updated LP share.

---

## 📊 View LP Position

View current liquidity provider position.

Example prompts:

- fetch my position
- view lp position
- show my liquidity
- check pool share

Returns:

- NGN share
- USD share
- total pool share
- deposited liquidity

---

## 📊 AMM Dashboard

View AMM analytics and pool statistics.

Example prompts:

- amm dashboard
- show amm stats
- pool analytics
- fx liquidity dashboard

Returns:

- buy rate
- sell rate
- mid rate
- swap volume
- pool depth
- liquidity added
- liquidity removed
- LP fees
- platform fees

---

## 🏦 Lend

Supply stablecoins or cNGN to earn yield from borrowers.

Example prompts:

- lend 100 USDC
- supply 500 NGN
- deposit stablecoins to lending pool

Returns interest rate and lending position.

---

## 📉 Borrow

Borrow stablecoins or cNGN using collateral.

Example prompts:

- borrow 100 USDC
- borrow 500 NGN
- take loan using collateral

Returns loan details and repayment terms.

---

## 💳 Spend

Use virtual accounts and payment rails to convert digital assets into real-world payments.

Example prompts:

- spend 100 NGN
- pay merchant using USDC
- convert stablecoins to payout

Supports settlement through payment rails and off-chain accounts.

---

# Supported Networks

The skill automatically detects network context.

Supported chains:

- Base
- Ethereum
- Arbitrum

Example:

swap 1 USDC to NGN on base

---

# Supported Tokens

Supported tokens include:

- USDC
- cNGN (Crypto Naira)
- NGN stablecoin equivalents

Token addresses are mapped internally per network.

---

# Functions Exposed

The skill exposes the following callable functions:

balance(address, chain)

swap(amount, tokenIn, tokenOut, chain)

swapQuote(amount, tokenIn, tokenOut, chain)

transfer(amount, token, toAddress, chain)

addLiquidity(amount, token, chain)

removeLiquidity(amount, token, chain)

lpPosition(address, chain)

ammDashboard(chain)

lend(amount, token, chain)

borrow(amount, token, chain)

spend(amount, token, destination)

---

# Response Format

Functions return structured data.

Example response:

{
  "success": true,
  "message": "Swap completed",
  "txHash": "0x123...",
  "data": {
    "amountOut": "1398.23 NGN"
  }
}

Telegram responses may include formatted HTML and emoji for user readability.

---

# Security

Transactions are signed securely.

Private keys should be encrypted using secure key management systems such as:

- AWS KMS
- secure vault services
- encrypted storage

The system supports server-side signing or delegated signing through secure services.

---

# Usage Context

This skill is designed for:

- Telegram trading bots
- AI trading agents
- DeFi liquidity providers
- fintech payment systems
- OTC FX desks
- remittance operators

---

# Vision

Build the **liquidity layer for the Naira in the global digital asset economy**.

The platform enables programmable FX markets where **payments, lending, trading, and liquidity operate seamlessly across on-chain and traditional financial rails.**
