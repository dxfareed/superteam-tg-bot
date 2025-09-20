const faq = (bot) => {
  bot.onText(/\/faq/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the faq command.');
  });
};

export default faq;
