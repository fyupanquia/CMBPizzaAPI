const _home = require("./home");
const _public = require("./public");
const _sessionCreate = require("./sessionCreate");
const _accountCreate = require("./accountCreate");
const _shoppingCar = require("./shoppingCar");
const _sessionDeleted = require("./sessionDeleted");
const _accountEdit = require("./accountEdit");
const _accountDeleted = require("./accountDeleted");
const helpers = require("../../helpers");

module.exports = {
  home: _home({ helpers }),
  public: _public({ helpers }),
  accountCreate: _accountCreate({ helpers }),
  sessionCreate: _sessionCreate({ helpers }),
  shoppingCar: _shoppingCar({ helpers }),
  sessionDeleted: _sessionDeleted({ helpers }),
  accountEdit: _accountEdit({ helpers }),
  accountDeleted: _accountDeleted({ helpers }),
};
