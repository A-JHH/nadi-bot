const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// 1. Firebase Setup
// ይህ ፋይል በ Render 'Secret Files' ውስጥ መኖሩን አረጋግጥ
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com" 
});

const db = admin.database();
const bot = new Telegraf('7545931215:AAH_Qcl18-XUvG4fF_6N-t0_ZREmS6L6Z30');

// 2. Render ማስጠንቀቂያ እንዳያሳይ የሚረዳ (Dummy Server)
http.createServer((req, res) => {
  res.write('NADI BOT is Live and Running!');
  res.end();
}).listen(process.env.PORT || 3000);

// 3. Start Command
bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

// 4. ምዝገባ (መረጃን Firebase ላይ ማስቀመጥ)
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
        
        // ላንተ (Admin) መረጃ እንዲደርስህ
        bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ!\n\nUser: ${firstName} (@${username})\nID: ${userId}`);
    } catch (error) {
        console.error("Firebase Error:", error);
        ctx.reply('ይቅርታ፣ ምዝገባው ላይ ስህተት አጋጥሟል።');
    }
});

// 5. አሸናፊ መምረጫ (Pick Command)
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
console.log("🚀 NADI BOT is fully connected to Firebase and Live on Render!");