const { PrismaClient } = require("@prisma/client");

const PhotoChatModels = new PrismaClient().photochat;

module.exports = PhotoChatModels;
