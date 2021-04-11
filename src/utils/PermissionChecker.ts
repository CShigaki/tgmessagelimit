const isAdminStatus = (userStruct) => {
  return userStruct.status === 'creator' ||
    userStruct.status === 'administrator';
};

export const userHasAdminPermissions = async (bot, msg, userId) => {
  const chatId = msg.message ? msg.message.chat.id : msg.chat.id;
  const userWhoRequestedInitialization = await bot.getChatMember(chatId, userId);

  return isAdminStatus(userWhoRequestedInitialization);
};
