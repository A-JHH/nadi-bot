const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// 1. Firebase Setup (Render Secret File መንገድ)
const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://nadi-bot-db-default-rtdb.firebaseio.com"
    });
    console.log("✅ Firebase Connected Successfully!");
} catch (error) {
    console.error("❌ Firebase Error:", error.message);
}

const db = admin.database();

// 2. በሰጠኸኝ አዲስ Token ቦቱን ማስጀመር
const bot = new Telegraf('8739452566:AAGsvESMjWorDW3i5O06GPnV_xznRlQUUY4');

// 3. Render Port Error እንዳይመጣ (Dummy Server)
http.createServer((req, res) => {
    res.write('NADI BOT is Live and Running!');
    res.end();
}).listen(process.env.PORT || 3000);

// 4. Start Command
bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

// 5. ተጠቃሚዎችን መመዝገብ
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
        
        // ለአስተዳዳሪው (ላንተ) መረጃ እንዲደርስህ
        bot.telegram.sendMessage('5834630929', `🚀 አዲስ ተመዝጋቢ ተገኝቷል!\n\nስም: ${firstName}\nUsername: @${username}\nID: ${userId}`);
    } catch (e) {
        console.error("Database Save Error:", e.message);
        ctx.reply('ይቅርታ፣ ምዝገባው ላይ ስህተት አጋጥሟል።');
    }
});

// 6. አሸናፊ መምረጫ (ለአንተ ብቻ)
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

bot.launch().then(() => {
    console.log("🚀 NADI BOT is fully operational with the new token!");
});
