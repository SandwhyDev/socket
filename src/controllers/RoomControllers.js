const express = require("express");
const uid = require("../libs/uuid");
const { RoomModels } = require("../models/RoomModels");

const RoomControllers = express.Router();

RoomControllers.post("/room/create", async (req, res) => {
  try {
    const data = await req.body;

    const create = await RoomModels.create({
      data: {
        id: uid(),
        username: data.username,
        category: data.category,
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

RoomControllers.post("/room/read", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = await req.query;
    const skip = (page - 1) * limit;
    const { filter } = await req.body;
    const readUser = await RoomModels.findMany({
      where: filter,
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const cn = await RoomModels.count();
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

RoomControllers.post("/room/read/unique", async (req, res) => {
  try {
    const data = await req.body;
    const readUser = await RoomModels.findMany({
      where: {
        username: data.username,
      },
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

module.exports = RoomControllers;
