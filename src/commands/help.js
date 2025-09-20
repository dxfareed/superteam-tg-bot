const help = (bot) => {
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the help command.');
  });
};

export default help;
