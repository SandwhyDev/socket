const express = require("express");
const ImageChat = require("../libs/Multer");
const uid = require("../libs/uuid");
const { ChatModels } = require("../models/ChatModels");
const PhotoChatModels = require("../models/PhotoChatModels");
const { RoomModels } = require("../models/RoomModels");

const ChatControllers = express.Router();

ChatControllers.post("/chat/create", ImageChat.single("foto"), async (req, res) => {
  try {
    const data = await req.body;
    const file = await req.file;

    const findRoom = await RoomModels.findFirst({
      where:{
        room_id: data.room_id
      }
    })

    if(!findRoom){
      res.status(404).json({
        success: true,
        message: "room tidak di temukan"
      })

      return
    }

    const create = await ChatModels.create({
      data: {
        user: data.user,
        message: data.message,
        room_id: findRoom.id,
      },
    });
    
    console.log(create);
    if (file != undefined) {
      await PhotoChatModels.create({
        data: {
          chat_id: create.id,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          image_path: `http://localhost:3030/images/${file.filename}`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

ChatControllers.post("/chat/read", async (req, res) => {
  try {
    const data  = await req.body;

    const findRoom = await RoomModels.findFirst({
      where:{
        room_id: data.room_id
      }
    })

    if(!findRoom){
      res.status(404).json({
        success: true,
        message: "room tidak di temukan"
      })

      return
    }

    const readUser = await ChatModels.findMany({
      where: {
        room_id: findRoom.id
      },
      include:{
        photochat: true
      }
    });

    res.status(200).json({
      success: true,
      query: readUser,

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = ChatControllers;
