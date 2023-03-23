const express = require("express");
const { ChatModels } = require("../models/ChatModels");

const ChatControllers = express.Router();

ChatControllers.post("/chat/create", async (req, res) => {
  try {
    const data = await req.body;

    const create = await ChatModels.create({
      data: {
        user: data.user,
        message: data.message,
        room_id: data.room_id,
      },
    });

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
    const { page = 1, limit = 10 } = await req.query;
    const skip = (page - 1) * limit;
    const { filter } = await req.body;
    const readUser = await ChatModels.findMany({
      where: filter,
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const cn = await ChatModels.count();
    res.status(200).json({
      currentPage: parseInt(page),
      total_page: Math.ceil(cn / limit),
      total_data: cn,
      query: readUser,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = ChatControllers;
