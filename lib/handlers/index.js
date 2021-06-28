const _front = require("./front");
const _back = require("./back");
const handlers = {};

handlers.front = _front;
handlers.back = _back;

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
