const ShortUniqueId = require("short-unique-id");

const uuid = new ShortUniqueId();

const uid = (number = 32) => {
  return uuid.stamp(number);
};

module.exports = uid;
