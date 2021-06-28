const _users = require("./users");
const _menu = require("./menu");
const _shoppingCar = require("./shoppingCar");
const _tokens = require("./tokens");

// Users
const users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Menu
const menu = function (data, callback) {
  var acceptableMethods = ["get"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Shopping Car
const shoppingCar = function (data, callback) {
  var acceptableMethods = ["post", "patch"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _shoppingCar[data.method](data, callback);
  } else {
    callback(405);
  }
};

// tokens
const tokens = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

module.exports = {
  users,
  menu,
  shoppingCar,
  tokens,
};
