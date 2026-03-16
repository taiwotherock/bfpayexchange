const axios = require("axios")
require("dotenv").config()

const KMS_URL = process.env.KMS_URL

// headers required by the KMS service
function buildHeaders() {
  return {
    "Content-Type": "application/json",
    "x-client-id": process.env.X_CLIENT_ID,
    "x-source-code": process.env.X_SOURCE_CODE,
    "x-client-secret": process.env.X_CLIENT_SECRET,
  }
}

// Encrypt private key
async function encryptPrivateKey(privateKey) {

  try {

    const response = await axios.post(
      `${KMS_URL}/encrypt`,
      {
        plaintext: privateKey
      },
      {
        headers: buildHeaders()
      }
    )

    return response.data

  } catch (error) {

    console.error("Encryption failed:", error.message)
    throw error

  }

}

// Decrypt private key
async function decryptPrivateKey(cipherText) {

  try {

   
    const response = await axios.post(
      `${KMS_URL}/decrypt`,
      {
        encData: cipherText
      },
      {
        headers: buildHeaders()
      }
    )

    return response.data.result

  } catch (error) {

    console.error("Decryption failed:", error.message)
    throw error

  }

}

module.exports = {
  encryptPrivateKey,
  decryptPrivateKey
}