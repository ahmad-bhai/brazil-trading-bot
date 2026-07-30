const TelegramBot = require('node-telegram-bot-api');

// BotFather se mila hua Token yahan daalein
const TOKEN = '8635187966:AAEON7yXRqi3iaWatT_Iq6zBwadzJ4xueIw';

// Create a bot instance
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("🚀 RQA Node.js Bot Engine Active!");

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🔥 *Welcome to Royal Quotex Academy (RQA)* 🔥\n\nAhmad bhai ka Node.js Powered Bot aapki khidmat mein hazir hai! 😎\n\nCommands:\n/signal - Generate Market Signal\n/risk - Risk Management Rule`, { parse_mode: "Markdown" });
});

// Signal Command Demo
bot.onText(/\/signal/, (msg) => {
    const chatId = msg.chat.id;
    
    // Yahan aage ja kar hamara real Market Analysis Logic lagega
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const directions = ['CALL (BUY 🟢)', 'PUT (SELL 🔴)'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];

    const signalMessage = `
📊 *RQA SMART SIGNAL*
━━━━━━━━━━━━━━━
💱 *Pair:* ${randomPair}
🎯 *Direction:* ${randomDirection}
⏰ *Timeframe:* 1 Minute
⚠️ *Martingale:* Max 1 Step

_Note: Always follow 2% Risk Management!_
    `;

    bot.sendMessage(chatId, signalMessage, { parse_mode: "Markdown" });
});
  
