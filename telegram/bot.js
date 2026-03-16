const { Telegraf } = require("telegraf")
require("dotenv").config()
const agent = require("../index")
const helpText = require("./help")


const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.on("text", async(ctx)=>{

    console.log('welcome ' + ctx.message.text );

 const result = await agent.run(ctx.message.text)
 //const result = await agent.run(ctx.message.text, {userId: ctx.from.id, address: "0xe167ce487533E5a90D9513cB7bE9FA62c6840949"})
 if(result.format == 'HTML')
    ctx.reply(result.message, { parse_mode: "HTML" })
 else
    ctx.reply(JSON.stringify(result.message))

})

bot.command("help", async (ctx) => {
  ctx.reply(helpText, { parse_mode: "HTML" })
})

bot.launch()
console.log("Telegram bot is running...")