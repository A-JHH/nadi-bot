const { Telegraf } = require('telegraf');
const fs = require('fs');

// የቦት Token
const bot = new Telegraf('8739452566:AAGsvESMjWorDW3i5O06GPnV_xznRlQUUY4'); 
const DATA_FILE = 'users.json';
const ADMIN_ID = '6461700400'; // ያንተ ID እዚህ ገብቷል

// ዳታቤዝ ፋይሉ መኖሩን ማረጋገጥ
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

bot.start((ctx) => ctx.reply('እንኳን ደህና መጡ! ለ Giveaway ለመመዝገብ የሰብስክራይብ ስክሪንሾት ይላኩ።'));

// ስክሪንሾት ሲላክ
bot.on('photo', (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'No Username';
    
    let users = JSON.parse(fs.readFileSync(DATA_FILE));

    // ተጠቃሚው ቀድሞ ተመዝግቦ ከሆነ ቼክ ማድረግ
    if (users.find(u => u.id === userId)) {
        return ctx.reply('ቀድመው ተመዝግበዋል! በአንድ አካውንት አንዴ ብቻ ነው መሳተፍ የሚቻለው።');
    }

    // አዲስ ተጠቃሚ መመዝገብ
    users.push({ id: userId, username: username, date: new Date() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    ctx.reply('በጥሩ ሁኔታ ተመዝግበዋል! መልካም እድል ለ NADI UNLOCKER ስጦታ።');
    
    // ለአንተ (Admin) መረጃ መላክ
    bot.telegram.sendMessage(ADMIN_ID, `🚀 አዲስ ተመዝጋቢ!\n\nUser: @${username}\nID: ${userId}\nስክሪንሾት ልኳል።`);
});

// አሸናፊ ለመምረጥ (Admin Only - ላንተ ብቻ እንዲሰራ)
bot.command('pick', (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) {
        return ctx.reply('ይህ ትዕዛዝ ለባለቤቱ ብቻ የተፈቀደ ነው።');
    }

    let users = JSON.parse(fs.readFileSync(DATA_FILE));
    if (users.length < 2) return ctx.reply('በቂ ተሳታፊ የለም (ቢያንስ 2 ሰው ያስፈልጋል)!');
    
    // በዘፈቀደ መምረጥ
    let shuffled = users.sort(() => 0.5 - Math.random());
    let winners = shuffled.slice(0, 2);

    ctx.reply(`🎉 አሸናፊዎች ተለይተዋል:\n\n1. @${winners[0].username}\n2. @${winners[1].username}\n\nእንኳን ደስ አላችሁ!`);
});

bot.launch();
console.log("NADI BOT is running...");