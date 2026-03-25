const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const http = require('http');

// 1. Firebase Setup (Render ላይ ባለው Secret File መንገድ)
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

// 2. በሰጠኸኝ Token ቦቱን ማስጀመር
const bot = new Telegraf('8739452566:AAGsvESMjWorDW3i5O06GPnV_xznRlQUUY4');

// 3. Render እንዳይዘጋ (Dummy Server ለ UptimeRobot)
http.createServer((req, res) => {
    res.write('NADI BOT is Live and Running!');
    res.end();
}).listen(process.env.PORT || 3000);

// 4. Start Command
bot.start((ctx) => {
    ctx.reply('እንኳን ወደ NADI UNLOCKER Giveaway በሰላም መጡ! 🎁\n\nለመመዝገብ የሰብስክራይብ ስክሪንሾት እዚህ ይላኩ።');
});

// 5. ተጠቃሚዎችን መመዝገብ እና ፎቶ Forward ማድረግ
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
        
        // ፎቶውን ለአንተ Forward ያደርገዋል
        await ctx.forwardMessage(myId);
        
        // ዝርዝር መረጃውን ለአንተ ይልካል
        await bot.telegram.sendMessage(myId, `🚀 አዲስ ተመዝጋቢ ተገኝቷል!\n\nስም: ${firstName}\nUsername: @${username}\nID: ${userId}`);

    } catch (e) {
        console.error("Registration Error:", e.message);
    }
});

// 6. አሸናፊ መምረጫ (ለአንተም ለአሸናፊውም መልዕክት ይልካል)
bot.command('pick', async (ctx) => {
    // ካንተ ውጭ ሌላ ሰው እንዳይጠቀም መከላከያ
    if (ctx.from.id.toString() !== '5834630929') return;

    const usersRef = db.ref('users');
    usersRef.once('value', async (snapshot) => {
        const users = snapshot.val();
        if (!users) return ctx.reply("ምንም ተመዝጋቢ የለም።");

        const userList = Object.values(users);
        const winner = userList[Math.floor(Math.random() * userList.length)];

        // 1. ለአንተ (Admin) መረጃውን ይልካል
        ctx.reply(`🎉 የዛሬው አሸናፊ ተመርጧል!\n\nስም፡ ${winner.name}\nUsername: @${winner.username}\nID: ${winner.id}`);

        // 2. ለአሸናፊው በቀጥታ መልዕክት ይልካል
        try {
            await bot.telegram.sendMessage(winner.id, `🎉 እንኳን ደስ አለዎት ${winner.name}! የ NADI UNLOCKER የዛሬው አሸናፊ ሆነዋል። ሽልማቱን ለመቀበል @nadi_unlocker ላይ ያነጋግሩን። 🎁`);
            ctx.reply("✅ ለአሸናፊው መልዕክት በዲኤም (DM) ተልኳል።");
        } catch (error) {
            console.error("አሸናፊው ቦቱን ስለዘጋው መልዕክት መላክ አልተቻለም:", error.message);
            ctx.reply("❌ ለአሸናፊው መልዕክት መላክ አልተቻለም (ቦቱን አቁሞት ሊሆን ይችላል)።");
        }
    });
});

bot.launch().then(() => {
    console.log("🚀 NADI BOT is fully operational!");
});
