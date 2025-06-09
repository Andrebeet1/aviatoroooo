import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { generateAviatorMultiplier } from './utils/predictor.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(express.json());

let lastMessageId = null;

const keyboard = {
  reply_markup: {
    keyboard: [[{ text: '🎯 Nouvelle prédiction' }]],
    resize_keyboard: true,
    one_time_keyboard: false,
    is_persistent: true
  }
};

bot.start(ctx => {
  ctx.reply('Bienvenue sur Aviator Predictor 🚀\nClique sur 🎯 Nouvelle prédiction pour commencer.', keyboard);
});

bot.hears('🎯 prédiction', async ctx => {
  try {
    if (lastMessageId) {
      await ctx.telegram.deleteMessage(ctx.chat.id, lastMessageId).catch(() => {});
    }

    const multiplier = generateAviatorMultiplier();
    const crash = Math.random() < 0.1;
    const predictionText = `🚀 <b>Va crasher à :</b> ${multiplier}x ${crash ? '❌💥' : '✅'}`;

    const sent = await ctx.reply(predictionText, {
      parse_mode: 'HTML',
    });

    lastMessageId = sent.message_id;
  } catch (err) {
    console.error(err);
  }
});

app.use(bot.webhookCallback('/webhook'));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot en ligne sur le port ${PORT}`));

app.get('/', (req, res) => {
  res.send('🤖 Aviator Predictor Bot est en ligne');
});
