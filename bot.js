const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// Firebase Setup
const serviceAccount = require("/etc/secrets/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com" 
});

const db = admin.database();
const bot = new Telegraf('7545931215:AAH_Qcl18-XUvG4fF_6N-t0_ZREmS6L6Z30');

// Render Error እንዳያሳይ
http.createServer((req, res) => { res.write('NADI BOT is Live!'); res.end(); }).listen(process.env.PORT || 3000);

bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "No_Username";
    try {
        await db.ref('users/' + userId).set({
            id: userId, username: username, date: new Date().toLocaleString()
        });
        ctx.reply(`✅ በትክክል ተመዝግበዋል። መልካም እድል!`);
        bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ: @${username}`);
    } catch (e) { console.error(e); }
});

bot.launch();