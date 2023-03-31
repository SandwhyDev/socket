const createChat = require("../models/ChatModels");
const { createRoom } = require("../models/RoomModels");
const rooms = {};
const joinRequests = {};
const userCountsByRoom = {};
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const socketConn = (socket, io, fs, path, fetch) => {
  socket.on("join-room", (roomId, userId, userName, stream) => {
    createRoom(roomId, "VIDEO_CONFERENCE", userName);

    // Jika room belum memiliki host, maka user yang bergabung akan menjadi host
    if (!rooms[roomId]) {
      rooms[roomId] = { host: userName, participants: [] };
    }

    // Dapatkan informasi host untuk room saat ini
    const hostroom = rooms[roomId].host;

    // Tambahkan user ke daftar participants
    if (hostroom === userName) {
      rooms[roomId].participants.push({ id: userId, name: userName });
    }

    socket.join(roomId);
    socket.join(userId);
    socket.join(userName);

    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId, userName, roomId, hostroom, stream);
    }, 1000);

    socket.on("send file", (file) => {
      const fileName = uuidv4() + "." + file.mimetype.split("/")[1];
      const fileData = Buffer.from(new Uint8Array(file.data));

      fs.writeFile(`./public/images/${fileName}`, fileData, async (err) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log("File saved:");
      });
      io.to(userName).emit("gambar", fileName);
    });

    socket.on("message", (message, image) => {
      io.to(roomId).emit("createMessage", message, image, userName);
    });

    socket.on("delete file", (file) => {
      console.log(file);

      if (fs.existsSync(path.join(__dirname, `./public/images/${file}`))) {
        fs.unlinkSync(path.join(__dirname, `./public/images/${file}`));
      }
    });

    socket.on("ijin masuk", (message, userAllow, idUser) => {
      let participantUser = rooms[roomId].participants;

      if (message === true) {
        rooms[roomId].participants.push({ id: idUser, name: userAllow });
      }

      io.to(userAllow).emit("finale", message, userAllow, participantUser);
      socket.to(roomId).emit("participants", participantUser);

      socket.to(roomId).emit("wait to host", message, userId, userName);
    });

    socket.on("ask-join", async (userId, userName) => {
      // Jika user belum meminta bergabung, maka simpan datanya
      if (!joinRequests[userId]) {
        joinRequests[userId] = true;

        // Kirim pesan ke host room
        await io.to(hostroom).emit("ijin host", userId, userName);
      }
    });

    socket.on("disconnect", () => {
      // Hapus user dari daftar participants
      rooms[roomId].participants = rooms[roomId].participants.filter((participant) => participant.id !== userId);

      // Emit event user-disconnected ke semua user di room
      socket.to(roomId).broadcast.emit("user-disconnected", userId, userName);
    });
  });

  socket.on("join-room-walkie-talkie", (roomId, user) => {
    socket.join(roomId);

    createRoom(roomId, "WALKIE-TALKIE", user);

    if (!userCountsByRoom[roomId]) {
      userCountsByRoom[roomId] = 0;
    }

    userCountsByRoom[roomId]++;

    // send initial user count to the first user who joined the room
    if (userCountsByRoom[roomId] === 1) {
      socket.emit("init-user-count", userCountsByRoom[roomId]);
    }

    // send user count to all users in the room
    io.to(roomId).emit("user", userCountsByRoom[roomId]);

    socket.on("disconnect", () => {
      userCountsByRoom[roomId]--;

      io.to(roomId).emit("user", userCountsByRoom[roomId]);

      console.log("user disconnected");
    });

    socket.on("audioMessage", (msg) => {
      socket.to(roomId).broadcast.emit("audio final", msg);
    });
  });

  socket.on("join-room-chat", (roomId, user, roomCategory) => {
    socket.join(roomId);
    socket.join(user);

    createRoom(roomId, roomCategory, user);

    if (!userCountsByRoom[roomId]) {
      userCountsByRoom[roomId] = 0;
    }

    userCountsByRoom[roomId]++;

    // send initial user count to the first user who joined the room
    if (userCountsByRoom[roomId] === 1) {
      socket.emit("init-user-count", userCountsByRoom[roomId]);
      // console.log(userCountsByRoom[roomId]);
    }

    // send user count to all users in the room
    io.to(roomId).emit("user", userCountsByRoom[roomId]);

    socket.on("message", (msg, image, room_id, user, mimetypeFoto, sizeFoto) => {
      const data = {
        user: user,
        message: msg,
        image: image,
        room_id: room_id,
      };

      const foto = {
        filename: image,
        mimetype: mimetypeFoto,
        sizeFoto: sizeFoto,
      };

      io.to(roomId).emit("sendMessage", msg, image, user, mimetypeFoto, sizeFoto);
    });

    socket.on("send file", (file) => {
      const fileName = uuidv4() + "." + file.mimetype.split("/")[1];
      const fileData = Buffer.from(new Uint8Array(file.data));

      fs.writeFile(`./public/images/${fileName}`, fileData, async (err) => {
        if (err) {
          console.log(err);
          return;
        }

        // console.log("File saved:");
      });

      io.to(user).emit("gambar", fileName, file);
    });

    socket.on("delete file", (file) => {
      // console.log(file);

      if (fs.existsSync(path.join(__dirname, `./public/images/${file}`))) {
        fs.unlinkSync(path.join(__dirname, `./public/images/${file}`));
      }
    });

    socket.on("disconnect", () => {
      userCountsByRoom[roomId]--;

      io.to(roomId).emit("user", userCountsByRoom[roomId]);

      // console.log("user disconnected");
    });
  });
};

module.exports = socketConn;
