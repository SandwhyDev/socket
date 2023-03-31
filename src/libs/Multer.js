const multer = require("multer");
const path = require("path");
const uid = require("./uuid");

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../../public/images`));
  },
  filename: (req, file, cb) => {
    cb(null, uid() + "." + file.mimetype.split("/")[1]);
  },
});

const ImageChat = multer({
  storage: uploadStorage,
  fileFilter: (req, file, cb) => {
    var ext = file.mimetype;
    if (ext == "image/png" || ext == "image/jpg" || ext == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

module.exports = ImageChat;
