const _users = require("./users");
const _menu = require("./menu");
const _tokens = require("./tokens");
const _shoppingCar = require("./shoppingCar");
const handlers = {};

// Users
handlers.users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Menu
handlers.menu = function (data, callback) {
  var acceptableMethods = ["get"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Shopping Car
handlers.shoppingCar = function (data, callback) {
  var acceptableMethods = ["post", "patch"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _shoppingCar[data.method](data, callback);
  } else {
    callback(405);
  }
};

// tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
