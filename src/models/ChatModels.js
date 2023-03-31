const { PrismaClient } = require("@prisma/client");

const ChatModels = new PrismaClient().chat;

const createChat = (user, message, room_id) => {
  ChatModels.create({
    data: {
      user: user,
      message: message,
      room_id: room_id,
    },
  }).then((res) => {
    // console.log("berhasil " + res);
  });
};

module.exports = { createChat, ChatModels };
