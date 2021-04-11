import { InlineKeyboard } from 'telegram-keyboard-wrapper';
import { persistMessage } from '../utils/MessageHandler';

import Chat from '../models/Chat';

const getPersistedChat = async (msg) => {
  const chatId = msg.message ? msg.message.chat.id : msg.chat.id;

  return await Chat.findById(chatId);
};

const mediaTypes = [
  'Photo',
  'Video',
  'File',
  'Gif',
  'Sticker',
];

export const handleConfigMenu = async (bot, msg, query?) => {
  let persistedChat = await getPersistedChat(msg);
  if (!persistedChat) {
    persistedChat = new Chat({
      _id: msg.chat.id,
      config: {
        messageLimit: 5,
        allowPhoto: false,
        allowVideo: false,
        allowFile: false,
        allowGif: false,
        allowSticker: false,
      },
      membersAndCounts: {},
    });

    await persistedChat.save();
  }

  // try {
  //   bot.deleteMessage(msg.chat.id, msg.message_id);
  // } catch (err) {}

  if (query) {
    if (mediaTypes.indexOf(query) !== -1) {
      persistedChat.config[`allow${query}`] = !persistedChat.config[`allow${query}`];
    }

    if (query === 'Increase') {
      persistedChat.config.messageLimit++;
    }

    if (query === 'Decrease') {
      if (persistedChat.config.messageLimit === 0) {
        return;
      }

      persistedChat.config.messageLimit--;
    }

    persistedChat.markModified('config');
    await persistedChat.save();
  }

  let configMenuMessage = `What do you want to allow/block?\n\n`;
  configMenuMessage += `If the button has a ⛔️ it means this type of media will also be blocked when the limit of configured messages per day is reached\n\n`;
  configMenuMessage += `If the button has a ✅ it means this type of media will be allowed when the limit is reached\n\n`;
  configMenuMessage += `Also, please remember I'll only work if you give me admin permissions.`;
  const configMenuButtons = new InlineKeyboard();
  configMenuButtons.addRow(
    { text: `Photo ${persistedChat.config.allowPhoto ? '✅' : '⛔️'}`, callback_data: 'Photo' },
    { text: `Video ${persistedChat.config.allowVideo ? '✅' : '⛔️'}`, callback_data: 'Video' },
  );

  configMenuButtons.addRow(
    { text: `File ${persistedChat.config.allowFile ? '✅' : '⛔️'}`, callback_data: 'File' },
    { text: `Gif ${persistedChat.config.allowGif ? '✅' : '⛔️'}`, callback_data: 'Gif' },
  );

  configMenuButtons.addRow(
    { text: `Sticker ${persistedChat.config.allowSticker ? '✅' : '⛔️'}`, callback_data: 'Sticker' },
  );

  configMenuButtons.addRow(
    { text: '<', callback_data: 'Decrease' },
    { text: `Limit: ${persistedChat.config.messageLimit}`, callback_data: 'undefined' },
    { text: '>', callback_data: 'Increase' },
  );

  configMenuButtons.addRow(
    { text: 'Reset message count', callback_data: 'Reset' },
  );

  configMenuButtons.addRow(
    { text: 'Finish Config', callback_data: 'Finish' },
  );

  if (msg.message) {
    bot.editMessageText(configMenuMessage, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      reply_markup: configMenuButtons.export()['reply_markup'],
    });

    return;
  }

  bot.sendMessage(msg.chat.id, configMenuMessage, configMenuButtons.export())
    .then((msg) => persistMessage(msg));
}

export const handleFinishConfig = async (bot, msg) => {
  await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
};