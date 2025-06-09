import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { generateAviatorMultiplier } from './utils/predictor.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(express.json());

// Stocker les messages par utilisateur
const userMessages = {};

// Clavier inline
const keyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🎯 Nouvelle prédiction', callback_data: 'predict' }]
    ]
  }
};

// START : message de bienvenue avec clavier inline
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;

  const msg = await ctx.reply(
    'Bienvenue sur Aviator Predictor 🚀\nClique sur le bouton ci-dessous pour commencer.',
    keyboard
  );

  if (!userMessages[chatId]) userMessages[chatId] = [];
  userMessages[chatId].push(msg.message_id);
});

// Quand l'utilisateur clique sur "🎯 Nouvelle prédiction"
bot.action('predict', async (ctx) => {
  const chatId = ctx.chat.id;

  // Supprimer anciens messages
  if (userMessages[chatId]) {
    for (const msgId of userMessages[chatId]) {
      try {
        await ctx.telegram.deleteMessage(chatId, msgId);
      } catch (err) {
        // ignorer
      }
    }
    userMessages[chatId] = [];
  }

  // Générer prédiction
  const multiplier = generateAviatorMultiplier();
  const crash = Math.random() < 0.1;
  const predictionText = `🚀 <b>Va crasher à :</b> ${multiplier}x ${crash ? '❌💥' : '✅'}`;

  const msg = await ctx.reply(predictionText, {
    parse_mode: 'HTML',
    ...keyboard
  });

  userMessages[chatId].push(msg.message_id);

  // Répondre au callback pour éviter le spinner
  await ctx.answerCbQuery();
});

// Webhook Express
app.use(bot.webhookCallback('/webhook'));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

// Page d’accueil
app.get('/', (req, res) => {
  res.send('🤖 Aviator Predictor Bot est en ligne');
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot en ligne sur le port ${PORT}`);
});
