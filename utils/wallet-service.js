const { Wallet, HDNodeWallet } = require("ethers")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
require("dotenv").config()
const { randomUUID } = require("crypto")
const { encryptPrivateKey } = require("./kms-client")
const { error } = require("console")



// CONFIG
const SAVE_WALLET_URL = process.env.BFPAY_SERVER +"/save-agentic-wallet"

// Headers for KMS
const HEADERS = {
  "x-source-code": process.env.X_SOURCE_CODE,
  "Content-Typee": "application/json"
}

// Local JSON file
const DB_PATH = path.join(__dirname, "../db/bfpay-wallet.json")

// ─────────────────────────────────────────────
// 1. CREATE WALLET
// ─────────────────────────────────────────────
async function createWalletWithPhraseEth() {
  const wallet = Wallet.createRandom()

  const hdWalletNode = HDNodeWallet.fromMnemonic(wallet.mnemonic, "m/44'/60'/0'/0")
  const hdWallet = hdWalletNode.derivePath("0")

  return {
    address: hdWallet.address,
    privateKey: hdWallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  }
}



// ─────────────────────────────────────────────
// 3. SAVE TO BACKEND
// ─────────────────────────────────────────────
async function saveWalletToServer(payload) {
  try {

    console.log(payload)
    const response = await axios.post(SAVE_WALLET_URL, 
        payload,{headers: HEADERS})
    return response.data
  } catch (err) {
    console.log(error)
    console.error("❌ Save Wallet Error:", err.message)
    throw err
  }
}

// ─────────────────────────────────────────────
// 4. SAVE LOCALLY (JSON)
// ─────────────────────────────────────────────
function saveToLocalJson(data) {
  //let db = []

  /*if (fs.existsSync(DB_PATH)) {
    const file = fs.readFileSync(DB_PATH)
    db = JSON.parse(file)
  }*/

 // db.push(data)
 fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))

  //fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// ─────────────────────────────────────────────
// 5. MAIN FUNCTION
// ─────────────────────────────────────────────
async function createAndStoreWallet({userId,name,socialId,chain,symbol,email,countryCode}) {
  try {
    console.log("🚀 Creating wallet...")

    // 1. Create wallet
    const wallet = await createWalletWithPhraseEth()

    // 2. Encrypt private key
    const encryptedKey = await encryptPrivateKey(wallet.privateKey)
    const agentId = userId + randomUUID()

    // 3. Prepare payload
    const payload = {
      agentId: agentId,
      email: email,
      name: name,
      socialId: socialId || "",
      chain: chain || "BASE",
      walletAddress: wallet.address,
      key:  encryptedKey.result,
      symbol: symbol || "USDC"
    }

    console.log(payload)

    // 4. Save to backend
    const serverResp = await saveWalletToServer(payload)

    console.log(serverResp)

    // 5. Save locally
    saveToLocalJson({
      name: name,
      walletAddress: wallet.address,
      countryCode: countryCode || "NG",
      currency: "",
      userId: userId || "",
      chain: payload.chain,
      symbol: payload.symbol,
      apiKey: serverResp.id,
      agentId: agentId,
      telegramId: socialId || "",
      whatsAppId: ""
    })

    console.log("✅ Wallet created & stored successfully")

    return {
      success: true,
      address: wallet.address,
      apiKey: serverResp.id
    }

  } catch (err) {
    console.error("❌ Wallet creation failed:", err.message)

    return {
      success: false,
      message: err.message
    }
  }
}

module.exports = {
  createAndStoreWallet
}