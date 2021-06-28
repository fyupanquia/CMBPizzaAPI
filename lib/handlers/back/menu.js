const helpers = require("../../helpers");
_menu = {};
_menu.get = function (data, callback) {
  // Check that email number is valid
  var email =
    typeof data.queryStringObject.email == "string" &&
    helpers.validateEmail(data.queryStringObject.email.trim())
      ? data.queryStringObject.email.trim()
      : false;
  // Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  if (!email || !token)
    return callback(400, { Error: "Missing required field" });
  // Verify that the given token is valid for the email number
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    const items = require("../../mockups/menu.json");
    callback(200, items);
  });
};

module.exports = _menu;
