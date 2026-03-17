function getCountryRules(countryCode) {

  const rules = {
    NG: {
      currency: "NGN",
      stablecoin: "cNGN",
      region: "Nigeria",
      compliance: "CBN",
      fxEngine: "NGN_AMM"
    },

    US: {
      currency: "USD",
      stablecoin: "USDC",
      region: "United States",
      compliance: "FinCEN",
      fxEngine: "USD_LIQUIDITY"
    },

    GB: {
      currency: "GBP",
      stablecoin: "USDC",
      region: "United Kingdom",
      compliance: "FCA",
      fxEngine: "GBP_CORRIDOR"
    }
  }

  return rules[countryCode] || {
    currency: "USD",
    stablecoin: "USDC",
    compliance: "GLOBAL"
  }
}

module.exports = getCountryRules