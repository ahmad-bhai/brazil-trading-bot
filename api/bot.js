const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Dynamic active bots aur unke intervals ko store karne ke liye memory object
const activeBots = {};

// Helper Function: Dummy Signal Generator Engine (Future mein yahan real indicator lagayenge)
function generateSignal() {
    const pairs = ['EUR/USD (OTC)', 'GBP/USD (OTC)', 'USD/JPY (OTC)', 'AUD/CAD'];
    const directions = ['CALL (BUY 🟢)', 'PUT (SELL 🔴)'];
    
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    return `
🔥 *RQA AUTOMATED VIP SIGNAL* 🔥
━━━━━━━━━━━━━━━━━━━━━
💱 *Pair:* ${pair}
🎯 *Action:* ${direction}
⏰ *Timeframe:* 1 Min
⚡ *Accuracy:* High Analysis

⚠️ _Always use 2% Risk Management!_
    `;
}

// 🚀 Dynamic API Route
// Pattern: /api/bot/:token/:status
app.get('/api/bot/:token/:status', (req, res) => {
    const { token, status } = req.params;
    const isEnable = status.toLowerCase() === 'true';

    try {
        // CASE 1: AGAR USER NE STATUS 'true' KIYA HAI (START BOT)
        if (isEnable) {
            // Agar bot pehle se active hai toh duplicate start mat karo
            if (activeBots[token] && activeBots[token].isRunning) {
                return res.json({
                    success: true,
                    message: "Bot is ALREADY running and sending signals!",
                    botToken: token,
                    status: "active"
                });
            }

            // Naya Bot Instance create karo
            const bot = new TelegramBot(token, { polling: true });

            // Automated Signal Loop (Har 1 minute / 60000ms baad signal bhejega)
            // Note: Pehle kisi target channel/chat ki ID set karni hoti hai. Demo ke liye polling response use hoga.
            const signalInterval = setInterval(() => {
                console.log(`[${new Date().toLocaleTimeString()}] Sending Automated Signal for token: ...${token.slice(-5)}`);
                
                // Yahan aap apni Telegram Channel ID (e.g., "@rqaofficial") daal sakte ho:
                // bot.sendMessage('@your_channel_username', generateSignal(), { parse_mode: 'Markdown' });
            }, 60000); // 60 seconds interval

            // Bot handling command '/start'
            bot.onText(/\/start/, (msg) => {
                bot.sendMessage(msg.chat.id, "🤖 *RQA Automated Signal Bot Active!*\n\nAapko automated signals milna shuru ho jayenge.", { parse_mode: "Markdown" });
            });

            // Memory mein status save kar lo
            activeBots[token] = {
                instance: bot,
                interval: signalInterval,
                isRunning: true
            };

            console.log(`✅ Bot Started for Token: ${token}`);
            return res.json({
                status: true,
                message: "RQA Bot System INSTALLED & STARTED successfully! 🚀",
                botToken: token,
                state: "RUNNING"
            });
        } 
        
        // CASE 2: AGAR USER NE STATUS 'false' KIYA HAI (STOP BOT)
        else {
            if (!activeBots[token] || !activeBots[token].isRunning) {
                return res.json({
                    success: false,
                    message: "Bot is NOT running or already stopped.",
                    botToken: token
                });
            }

            // Signal Interval ko clear karo aur Telegram Polling stop karo
            clearInterval(activeBots[token].interval);
            activeBots[token].instance.stopPolling();
            
            // Memory clean karo
            delete activeBots[token];

            console.log(`🛑 Bot Stopped for Token: ${token}`);
            return res.json({
                status: false,
                message: "RQA Bot System STOPPED successfully! 🛑",
                botToken: token,
                state: "STOPPED"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Server Listen
app.listen(PORT, () => {
    console.log(`🔥 RQA Node.js API Server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/api/bot/YOUR_TOKEN/true`);
});
              
