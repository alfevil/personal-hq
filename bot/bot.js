import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

// Токен бота, полученный от @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
// Ссылка на размещенное Mini App (Telegram Web App)
const webAppUrl = process.env.WEBAPP_URL;

if (!token) {
    console.error('Ошибка: Не задан TELEGRAM_BOT_TOKEN в .env файле');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'друг';

    const welcomeMessage = `
🌟 *Привет, ${firstName}! Добро пожаловать в Personal HQ!* 🌟

Я твой личный цифровой штаб. Здесь ты можешь собрать все свои дела, мысли и финансы в одном удобном и стильном месте.

🧠 *Мысли (Brain Dump)* — быстро записывай идеи, используй теги и закрепляй важное.
📁 *Проекты* — веди свои проекты, ставь дедлайны и отслеживай прогресс их выполнения.
💰 *Бюджет* — контролируй доходы и расходы, устанавливай лимиты и смотри наглядную аналитику.

Нажми на кнопку ниже, чтобы открыть мини-приложение и начать работу! 🚀
  `;

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть Personal HQ 🚀', web_app: { url: webAppUrl } }]
            ]
        }
    });
});

console.log('Бот Personal HQ успешно запущен и ждет сообщений...');
