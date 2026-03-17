const axios = require("axios")

async function detectCountry(lat, lon) {

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`

  const res = await axios.get(url)

  const country = res.data.address.country
  const countryCode = res.data.address.country_code.toUpperCase()

  return {
    country,
    countryCode
  }
}

module.exports = detectCountry