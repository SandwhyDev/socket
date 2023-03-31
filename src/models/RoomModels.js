const { PrismaClient } = require("@prisma/client");
const uid = require("../libs/uuid");

const RoomModels = new PrismaClient().room;

const createRoom = async (room_id, category, username) => {
  const findRoom = await RoomModels.findFirst({
    where: {
      room_id: room_id,
      username: username,
    },
  });

  if (findRoom) {
    // console.log("room dan user sudah ada");
    return false;
  }

  await RoomModels.create({
    data: {
      id: uid(),
      room_id: room_id,
      category: category,
      username: username,
    },
  })
    .then((res) => {
      // console.log("berhasil " + res);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  createRoom,
  RoomModels,
};
