import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { generateAviatorMultiplier } from './utils/predictor.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(express.json());

// Chaque utilisateur a sa liste de messages à supprimer
const userMessages = {};

const keyboard = {
  reply_markup: {
    keyboard: [[{ text: '🎯 Nouvelle prédiction' }]],
    resize_keyboard: true,
    is_persistent: true,
  },
};

// START : message de bienvenue + clavier
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const msg = await ctx.reply(
    'Bienvenue sur Aviator Predictor 🚀\nClique sur 🎯 Nouvelle prédiction pour commencer.',
    keyboard
  );

  if (!userMessages[chatId]) userMessages[chatId] = [];
  userMessages[chatId].push(msg.message_id);
});

// Action du bouton
bot.hears('🎯 Nouvelle prédiction', async (ctx) => {
  const chatId = ctx.chat.id;

  // Supprimer les anciens messages
  if (userMessages[chatId]) {
    for (const msgId of userMessages[chatId]) {
      try {
        await ctx.telegram.deleteMessage(chatId, msgId);
      } catch (err) {
        // Erreur silencieuse
      }
    }
    userMessages[chatId] = [];
  } else {
    userMessages[chatId] = [];
  }

  // Générer prédiction
  const multiplier = generateAviatorMultiplier();
  const crash = Math.random() < 0.1;
  const predictionText = `🚀 <b>Va crasher à :</b> ${multiplier}x ${crash ? '❌💥' : '✅'}`;

  const msg = await ctx.reply(predictionText, {
    parse_mode: 'HTML',
    ...keyboard,
  });

  userMessages[chatId].push(msg.message_id);
});

// Webhook
app.use(bot.webhookCallback('/webhook'));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

// Page d’accueil
app.get('/', (req, res) => {
  res.send('🤖 Aviator Predictor Bot est en ligne');
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot en ligne sur le port ${PORT}`);
});
