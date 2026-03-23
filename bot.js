const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// Firebase Setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com/" // ይህንን በFirebase Database URL ተካው
});

const db = admin.database();
const bot = new Telegraf('7545931215:AAH_Qcl18-XUvG4fF_6N-t0_ZREmS6L6Z30'); // የቦትህ Token

bot.start((ctx) => {
    ctx.reply('እንኳን ደህና መጡ! ለ Giveaway ለመመዝገብ የሰብስክራይብ ስክሪንሾት ይላኩ።');
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "No Username";

    // መረጃውን Firebase ላይ ማስቀመጥ
    const userRef = db.ref('users/' + userId);
    await userRef.set({
        id: userId,
        username: username,
        date: new Date().toISOString()
    });

    ctx.reply('በጥሩ ሁኔታ ተመዝግበዋል! መልካም እድል ለ NADI UNLOCKER ስጦታ።');
    
    // ላንተ መረጃ እንዲደርስህ
    bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ!\n\nUser: @${username}\nID: ${userId}`);
});

bot.launch();
console.log("NADI BOT is running with Firebase...");