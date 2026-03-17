// bot.js
const { Telegraf } = require("telegraf")
require("dotenv").config()
const agent = require("../index")
const helpText = require("./help")

const fs = require("fs")
const path = require("path")
const walletService = require("../utils/wallet-service") // adjust path
const detectCountry = require("../utils/detectCountry") 

const DB_PATH = path.join(__dirname, "../db/bfpay-wallet.json")
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)



// Temporary in-memory state (simple session)
const userState = {}

// Email regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Check if wallet exists for user
function getUserWallet(userId) {
  if (!fs.existsSync(DB_PATH)) return null

  const data = JSON.parse(fs.readFileSync(DB_PATH))
  if (data.telegramId == userId) {
    return data
  }
  return null
}

// -------------------------
// Helper: Send main menu
// -------------------------
function sendMainMenu(ctx) {
  const text = `
🤖 <b>DeFi Wallet Bot</b>

Choose an action below:
  `
  ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Swap Tokens", callback_data: "menu_swap" }],
        [
          { text: "💧 Add Liquidity", callback_data: "menu_add_lp" },
          { text: "💧 Remove Liquidity", callback_data: "menu_remove_lp" }
        ],
        [{ text: "📊 AMM Dashboard", callback_data: "menu_dashboard" }],
        [{ text: "💰 Wallet Balance", callback_data: "menu_balance" }],
        [{ text: "❓ Help", callback_data: "menu_help" }]
      ]
    }
  })
}

// -------------------------
// Handle text messages
// -------------------------
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim()
  const userId = ctx.from.id
  console.log(ctx)

  console.log('user id ' + userId)
  console.log('user id ' + ctx.message.from.first_name)
   console.log('user id ' + ctx.message.from.last_name)
  console.log("Received message:", text)

  // -------------------------
  // STEP 1: Check wallet
  // -------------------------
  let userWallet = getUserWallet(userId)

  // If no wallet → start onboarding
  if (!userWallet) {

    // If waiting for email input
    if (userState[userId]?.awaitingEmail) {

      if (!isValidEmail(text)) {
        return ctx.reply("❌ Invalid email. Please enter a valid email address (e.g. john@email.com)")
      }

      ctx.reply("⏳ Creating your secure wallet...")
      console.log('email '+ text )
      console.log('email '+ ctx.message.from.first_name )

      const result = await walletService.createAndStoreWallet({
        name: ctx.message.from.first_name + ' ' + ctx.message.from.last_name,
        userId: userId,
        email: text,
        socialId: userId,
        telegramId: userId,
        countryCode: "NG",
        chain: "BASE",
        symbol: "USDC"
      })

      
      //(userId,name,socialId,chain,symbol,email,countryCode) 

      if (!result.success) {
        return ctx.reply("❌ Failed to create wallet. Try again.")
      }

      userState[userId] = {} // clear state

      return ctx.reply(`✅ Wallet created!\n\n📬 Address:\n<code>${result.address}</code>`, {
        parse_mode: "HTML"
      })
    }

    // Ask for email first time
    userState[userId] = { awaitingEmail: true }

    return ctx.reply(
      "👋 Welcome!\n\n📧 Please enter your email to create your wallet:"
    )
  }

  // -------------------------
  // STEP 2: Handle menu
  // -------------------------
  if (text.toLowerCase().startsWith("menu")) {
    return sendMainMenu(ctx)
  }

  // -------------------------
  // STEP 3: Pass to agent
  // -------------------------
  const result = await agent.run(text, {
    userId,
    username: ctx.from.username,
    walletAddress: userWallet.walletAddress
  })

  if (result.format === "HTML")
    ctx.reply(result.message, { parse_mode: "HTML" })
  else
    ctx.reply(JSON.stringify(result.message))
})

// -------------------------
// Handle callback queries (buttons)
// -------------------------
bot.on("callback_query", async (ctx) => {
  const chatId = ctx.callbackQuery.message.chat.id
  const data = ctx.callbackQuery.data

  console.log("Callback query:", data)

  switch (data) {
    case "menu_swap":
      await ctx.telegram.sendMessage(chatId, "🔄 Type: swap 1 USDC to NGN")
      break

    case "menu_add_lp":
      await ctx.telegram.sendMessage(chatId, "💧 Example: add 100 USDC liquidity")
      break

    case "menu_remove_lp":
      await ctx.telegram.sendMessage(chatId, "💧 Example: remove 50 USDC liquidity")
      break

    case "menu_dashboard":
      await ctx.telegram.sendMessage(chatId, "📊 Fetching AMM Dashboard...")
      const stats = await agent.run("fetch dashboard", { userId: ctx.from.id })
      if (stats.format === "HTML")
        await ctx.reply(stats.message, { parse_mode: "HTML" })
      else
        await ctx.reply(JSON.stringify(stats.message))
      break

    case "menu_balance":
      await ctx.telegram.sendMessage(chatId, "💰 Type: balance 0x...")
      break

    case "menu_help":
      await ctx.telegram.sendMessage(chatId, helpText, { parse_mode: "HTML" })
      break

    default:
      await ctx.telegram.sendMessage(chatId, "⚠️ Unknown action")
  }

  await ctx.answerCbQuery()
})

// -------------------------
// Handle location sharing
// -------------------------
bot.on("location", async (ctx) => {
  const { latitude, longitude } = ctx.message.location
  console.log("User location:", latitude, longitude)

  // Store user location in memory or userStore
  await agent.run(`update location ${latitude} ${longitude}`, { userId: ctx.from.id })

  ctx.reply(`📍 Location saved: (${latitude}, ${longitude})`)
})

// -------------------------
// /help command
// -------------------------
bot.command("help", async (ctx) => {
  ctx.reply(helpText, { parse_mode: "HTML" })
})

// -------------------------
// Launch bot
// -------------------------
bot.launch()
console.log("Telegram bot is running...")