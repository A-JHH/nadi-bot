const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// Render ላይ ያለው Secret File መንገድ
const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com"
    });
    console.log("✅ Firebase Connected!");
} catch (error) {
    console.error("❌ Firebase Error:", error.message);
}

const db = admin.database();
const bot = new Telegraf('7545931215:AAH_Qcl18-XUvG4fF_6N-t0_ZREmS6L6Z30');

// Render Port Error እንዳይመጣ
http.createServer((req, res) => {
    res.write('NADI BOT is Live!');
    res.end();
}).listen(process.env.PORT || 3000);

bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "No_Username";
    try {
        await db.ref('users/' + userId).set({
            id: userId,
            username: username,
            date: new Date().toLocaleString()
        });
        ctx.reply(`✅ በትክክል ተመዝግበዋል። መልካም እድል!`);
        bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ: @${username}`);
    } catch (e) {
        console.error("DB Save Error:", e.message);
    }
});

bot.launch().then(() => console.log("🚀 Bot is Polling..."));
