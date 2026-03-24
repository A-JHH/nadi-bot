const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// 1. Firebase Setup
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
const bot = new Telegraf('8739452566:AAGsvESMjWorDW3i5O06GPnV_xznRlQUUY4');

// Render Port Error እንዳይመጣ
http.createServer((req, res) => {
    res.write('NADI BOT is Live!');
    res.end();
}).listen(process.env.PORT || 3000);

bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

// 2. ፎቶ ሲላክ የሚሰራው ክፍል
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "No_Username";
    const firstName = ctx.from.first_name || "User";

    try {
        // መረጃውን Firebase ላይ መመዝገብ
        await db.ref('users/' + userId).set({
            id: userId,
            username: username,
            name: firstName,
            date: new Date().toLocaleString()
        });

        // ለተጠቃሚው ምላሽ መስጠት
        ctx.reply(`✅ እናመሰግናለን ${firstName}! በትክክል ተመዝግበዋል። መልካም እድል!`);

        // ለአንተ (Admin) ፎቶውን እና መረጃውን መላክ
        const myId = '5834630929';
        
        // መጀመሪያ ፎቶውን Forward ማድረግ
        await ctx.forwardMessage(myId);
        
        // በመቀጠል መረጃውን መላክ
        await bot.telegram.sendMessage(myId, `🚀 አዲስ ተመዝጋቢ!\n\nስም: ${firstName}\nUsername: @${username}\nID: ${userId}`);

    } catch (e) {
        console.error("Error:", e.message);
    }
});

// አሸናፊ መምረጫ
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

bot.launch().then(() => console.log("🚀 Bot is Polling with Photo Forwarding..."));
