const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
    // CORS Headers Setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Parameters Extraction
    let token = req.query.token;
    let status = req.query.status;

    // Route matching for /api/bot/{token}/{status}
    if (!token && req.url) {
        const parts = req.url.split('?')[0].split('/').filter(Boolean);
        if (parts.length >= 3) {
            token = parts[1];
            status = parts[2];
        }
    }

    if (!token || status === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing token or status! Pattern: /api/bot/YOUR_TOKEN/true"
        });
    }

    const isEnable = String(status).toLowerCase() === 'true';
    const serverUrl = 'https://brazil-trading-bot.vercel.app';

    try {
        // Polling ke bina Bot instance initialize karo
        const bot = new TelegramBot(token, { polling: false });

        if (isEnable) {
            // Telegram Webhook Set karo (Yeh crash nahi hone dega)
            const webhookUrl = `${serverUrl}/api/webhook?token=${token}`;
            await bot.setWebHook(webhookUrl);

            return res.status(200).json({
                status: true,
                message: "RQA Bot Webhook Activated & System ONLINE! 🚀",
                serverUrl: serverUrl,
                botToken: token,
                state: "RUNNING"
            });
        } else {
            // Webhook Delete karke bot OFF karo
            await bot.deleteWebHook();

            return res.status(200).json({
                status: false,
                message: "RQA Bot System Deactivated & Stopped! 🛑",
                serverUrl: serverUrl,
                botToken: token,
                state: "STOPPED"
            });
        }

    } catch (error) {
        console.error("Vercel Function Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
            reason: "Failed to communicate with Telegram API. Check if your Token is valid!"
        });
    }
};
