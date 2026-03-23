const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// 1. Firebase Setup
// ማሳሰቢያ፡ ይህ ፋይል አሁን በ GitHub ላይ የለም፤ በ Render 'Secret Files' ውስጥ መፈጠር አለበት
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // ከታች ያለው ሊንክ ካንተ ዳታቤዝ ጋር የተገናኘ ነው
  databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com" 
});

const db = admin.database();
const bot = new Telegraf('7545931215:AAH_Qcl18-XUvG4fF_6N-t0_ZREmS6L6Z30');

// 2. Start Command
bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

// 3. ምዝገባ (መረጃን Firebase ላይ ማስቀመጥ)
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "No_Username";
    const firstName = ctx.from.first_name || "User";

    try {
        const userRef = db.ref('users/' + userId);
        await userRef.set({
            id: userId,
            username: username,
            name: firstName,
            date: new Date().toLocaleString()
        });

        ctx.reply(`✅ እናመሰግናለን ${firstName}! በትክክል ተመዝግበዋል። መልካም እድል!`);
        
        // ላንተ መረጃ እንዲደርስህ (Admin ID: 5834630929)
        bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ!\n\nUser: ${firstName} (@${username})\nID: ${userId}`);
    } catch (error) {
        console.error("Firebase Error:", error);
        ctx.reply('ይቅርታ፣ ዳታቤዝ ላይ ችግር አጋጥሟል። እባክዎ ቆይተው ይሞክሩ።');
    }
});

// 4. አሸናፊ መምረጫ (Pick Command)
bot.command('pick', async (ctx) => {
    if (ctx.from.id.toString() !== '5834630929') return;

    const usersRef = db.ref('users');
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) return ctx.reply("ምንም ተመዝጋቢ የለም።");

        const userList = Object.values(users);
        const winner = userList[Math.floor(Math.random() * userList.length)];

        ctx.reply(`🎉 የዛሬው አሸናፊ፡\n\nስም፡ ${winner.name}\nUsername: @${winner.username}\nID: ${winner.id}`);
    });
});

bot.launch();
console.log("🚀 NADI BOT is running with Firebase Secret Key!");