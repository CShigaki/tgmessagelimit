import InlineMessage from '../models/InlineMessage';

export const persistMessage = (msg) => {
  (new InlineMessage({
    chatId: msg.chat.id,
    messageId: msg.message_id,
  })).save();
};

export const deleteLastMessage = (bot, chatId) => {
  return new Promise((resolve, reject) => {
    const deleteMessage = (err, result) => {
      if (result) bot.deleteMessage(chatId, result.messageId);
    }

    InlineMessage.findAndDeleteMostRecentMessageFromChat(chatId, deleteMessage);
  });
};