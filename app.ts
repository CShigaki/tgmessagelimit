import { connect } from './src/utils/DbConnector';
import { userHasAdminPermissions } from './src/utils/PermissionChecker';
import TelegramBot from 'node-telegram-bot-api';
import { handleConfigMenu, handleFinishConfig } from './src/menus/Config';
import {
  isPhoto,
  isVideo,
  isFile,
  isGif,
  isSticker,
  isTextOrRelated
} from './src/utils/MessageTypeIdentifier';
import Chat from './src/models/Chat';

const run = async () => {
  await connect();

  let chatListAndTheirCounts = await Chat.findAll();

  const token = '<bot_token>';
  const bot = new TelegramBot(token, { polling: true });
  const myId = '<bot_id>';

  const removeGroupFromLocalAndDb = (msg) => {
    const chatListWithoutThisChat = chatListAndTheirCounts.filter((chatDoc) => chatDoc._id !== `${msg.chat.id}`);
    chatListAndTheirCounts = chatListWithoutThisChat;

    Chat.removeById(msg.chat.id);
  };

  bot.on('message', async (msg) => {
    if (msg.left_chat_member && msg.left_chat_member.username === 'gatinhasubmissabot') {
      return removeGroupFromLocalAndDb(msg);
    }

    if (msg.chat.type === 'private') {
      bot.sendMessage(msg.chat.id, `I don't work in private conversations. Please add me to a group and type /config to initialize me.`);

      return;
    }

    if ((await userHasAdminPermissions(bot, msg, msg.from.id)) || (await !userHasAdminPermissions(bot, msg, myId))) {
      return;
    }

    const chat = chatListAndTheirCounts.find((chatDoc) => chatDoc._id === `${msg.chat.id}`);
    if (!chat) {
      return;
    }

    if (isTextOrRelated(msg) && !chat.membersAndCounts[msg.from.id]) {
      chat.membersAndCounts[msg.from.id] = 1;

      return;
    }

    if (chat.membersAndCounts[msg.from.id] >= chat.config.messageLimit) {
      if (isPhoto(msg) && !chat.config.allowPhoto) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
      if (isVideo(msg) && !chat.config.allowVideo) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
      if (isGif(msg) && !chat.config.allowGif) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
      if (isFile(msg) && !chat.config.allowFile) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
      if (isSticker(msg) && !chat.config.allowSticker) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
      if (!!msg.text) return bot.deleteMessage(msg.chat.id, `${msg.message_id}`);
    }

    if (isTextOrRelated(msg) && chat.membersAndCounts[msg.from.id] <= chat.config.messageLimit) {
      chat.membersAndCounts[msg.from.id]++;
    }
  });

  bot.on('callback_query', async (query) => {
    if (!(await userHasAdminPermissions(bot, query, query.message.from.id))) {
      return;
    }

    switch (query.data) {
      case 'Photo':
      case 'Video':
      case 'File':
      case 'Gif':
      case 'Sticker':
      case 'Decrease':
      case 'Increase':
        await handleConfigMenu(bot, query, query.data);
        if (chatListAndTheirCounts.some((chatDoc) => chatDoc._id === `${query.message.chat.id}`)) {
          const chat = await Chat.findById(query.message.chat.id);

          chatListAndTheirCounts.forEach((localChat) => {
            if (chat._id === localChat._id) {
              localChat.config = chat.config;
            }
          });
        }
        break;
      case 'Reset':
        await resetAllMessageLimits(query.message.chat.id);
        bot.sendMessage(query.message.chat.id, 'All message counts reset to 0');
        break;
      case 'Finish':
        await handleFinishConfig(bot, query);
        break;
    }
  });

  bot.onText(/\/config/i, async (msg) => {
    if (!(await userHasAdminPermissions(bot, msg, msg.from.id))) {
      return;
    }

    await handleConfigMenu(bot, msg);

    if (!chatListAndTheirCounts.some((chatDoc) => chatDoc._id === `${msg.chat.id}`)) {
      const chat = await Chat.findById(msg.chat.id);
      chatListAndTheirCounts.push(chat);
    }
  });

  const resetAllMessageLimits = (chatId) => {
    const chat = chatListAndTheirCounts.find((chatDoc) => chatDoc._id === `${chatId}`);

    chat.membersAndCounts = {};
    chat.markModified('membersAndCounts');
    chat.save();
  };

  setInterval(() => {
    chatListAndTheirCounts.forEach((chat) => {
      resetAllMessageLimits(chat._id);
    });
  }, 60000);

  setInterval(() => {
    chatListAndTheirCounts.forEach((chat) => {
      chat.markModified('membersAndCounts');
      chat.save();
    });
  }, 60*60*24*1000);
};

run()
  .catch(err => console.log(err));