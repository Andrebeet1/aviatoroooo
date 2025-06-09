import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { generateAviatorMultiplier } from './utils/predictor.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(express.json());

// Mémoriser le dernier message pour chaque utilisateur
const lastMessages = {};

const keyboard = {
  reply_markup: {
    keyboard: [[{ text: '🎯 Nouvelle prédiction' }]],
    resize_keyboard: true,
    is_persistent: true
  }
};

bot.start(ctx => {
  ctx.reply(
    'Bienvenue sur Aviator Predictor 🚀\nClique sur 🎯 Nouvelle prédiction pour commencer.',
    keyboard
  );
});

bot.hears('🎯 Nouvelle prédiction', async ctx => {
  const chatId = ctx.chat.id;

  // Supprimer le message précédent s'il existe
  if (lastMessages[chatId]) {
    try {
      await ctx.telegram.deleteMessage(chatId, lastMessages[chatId]);
    } catch (err) {
      console.warn(`❗ Erreur suppression message : ${err.message}`);
    }
  }

  // Générer prédiction
  const multiplier = generateAviatorMultiplier(); // par ex. 1.09, 3.42
  const crash = Math.random() < 0.1; // 10% de chance de crash
  const predictionText = `🚀 <b>Va crasher à :</b> ${multiplier}x ${crash ? '❌💥' : '✅'}`;

  // Envoyer prédiction
  const sent = await ctx.reply(predictionText, {
    parse_mode: 'HTML',
    ...keyboard
  });

  lastMessages[chatId] = sent.message_id;
});

// Webhook
app.use(bot.webhookCallback('/webhook'));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

// Page d’accueil
app.get('/', (req, res) => {
  res.send('🤖 Aviator Predictor Bot est en ligne');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot en ligne sur le port ${PORT}`));
