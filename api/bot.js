const TelegramBot = require('node-telegram-bot-api');

// Simple In-Memory / Global State Store for Serverless Environment
// Note: Real production mein database (like Firebase / Vercel KV) use hota hai toggling state ke liye.
global.activeBots = global.activeBots || {};

module.exports = async (req, res) => {
    // Enable CORS (Taake aap kisi bhi browser ya frontend web app se hit kar sako)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Extraction of parameters (Supports both Query Params and Dynamic Routes)
    // E.g., /api/bot?token=123&status=true OR /api/bot/123/true
    let token = req.query.token;
    let status = req.query.status;

    // Route matching for Vercel dynamic pathing if query params aren't used
    if (!token && req.url) {
        const parts = req.url.split('/').filter(Boolean);
        // Path pattern: api / bot / {token} / {status}
        if (parts.length >= 3) {
            token = parts[1];
            status = parts[2];
        }
    }

    if (!token || status === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing parameters! Usage: /api/bot?token=BOT_TOKEN&status=true"
        });
    }

    const isEnable = String(status).toLowerCase() === 'true';

    try {
        if (isEnable) {
            // Check if already active
            if (global.activeBots[token]) {
                return res.status(200).json({
                    status: true,
                    message: "RQA Bot System is ALREADY active!",
                    serverUrl: "https://brazil-trading-bot.vercel.app",
                    botToken: token,
                    state: "RUNNING"
                });
            }

            // Create Webhook or Polling instance for Telegram
            const bot = new TelegramBot(token, { polling: true });

            // Automated Welcome Hook
            bot.onText(/\/start/, (msg) => {
                bot.sendMessage(msg.chat.id, 
                    "🔥 *Royal Quotex Academy Engine Active!* 🔥\n\nSystem status: ONLINE 🟢\nSignals are linked with Vercel API.", 
                    { parse_mode: "Markdown" }
                );
            });

            // Save instance in global memory
            global.activeBots[token] = {
                botInstance: bot,
                status: true,
                startTime: new Date().toISOString()
            };

            return res.status(200).json({
                status: true,
                message: "RQA Bot System INSTALLED & ACTIVATED successfully! 🚀",
                serverUrl: "https://brazil-trading-bot.vercel.app",
                botToken: token,
                state: "RUNNING"
            });

        } else {
            // STOP BOT CONDITION
            if (!global.activeBots[token]) {
                return res.status(200).json({
                    status: false,
                    message: "Bot is already STOPPED or not found.",
                    serverUrl: "https://brazil-trading-bot.vercel.app",
                    botToken: token,
                    state: "STOPPED"
                });
            }

            // Stop Telegram Polling and Clear memory
            try {
                await global.activeBots[token].botInstance.stopPolling();
            } catch (err) {
                console.log("Polling stop log:", err.message);
            }

            delete global.activeBots[token];

            return res.status(200).json({
                status: false,
                message: "RQA Bot System STOPPED successfully! 🛑",
                serverUrl: "https://brazil-trading-bot.vercel.app",
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
};
