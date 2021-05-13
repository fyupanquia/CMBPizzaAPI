const helpers = require("../helpers");
const _data = require("../data");
const config = require("../config");
_tokens = {};
// Tokens
_tokens.post = function (data, callback) {
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (!email && !password)
    return callback(400, { Error: "Missing required field(s)." });

  // Lookup the user who matches that email number
  _data.read("users", email, function (err, userData) {
    if (err && !userData)
      return callback(400, { Error: "Could not find the specified user." });

    //console.log("password: ", password);
    //console.log("userData.hashedPassword: ", userData);
    // Hash the sent password, and compare it to the password stored in the user object
    var hashedPassword = helpers.hash(password);
    if (hashedPassword !== userData.hashedPassword)
      return callback(400, {
        Error: "Password did not match the specified user's stored password",
      });

    // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
    var tokenId = helpers.createRandomString(20);
    var expires = Date.now() + 1000 * 60 * 60;
    var tokenObject = {
      email,
      id: tokenId,
      expires,
    };

    var userTokens =
      typeof userData.tokens == "object" && userData.tokens instanceof Array
        ? userData.tokens
        : [];

    // Verify that user has less than the number of max-tokens per user
    if (userTokens.length >= config.maxTokens)
      return callback(400, {
        Error:
          "The user already has the maximum number of tokens (" +
          config.maxTokens +
          ").",
      });

    userData.tokens = userTokens;
    userData.tokens.push(tokenId);

    // Store the token
    _data.create("tokens", tokenId, tokenObject, function (err) {
      if (err)
        return callback(500, { Error: "Could not create the new token" });
      // Save the new user data
      _data.update("users", email, userData, function (err) {
        if (err)
          return callback(500, {
            Error: "Could not update the user with the new token.",
          });

        callback(200, tokenObject);
      });
    });
  });
};

_tokens.get = function (data, callback) {
  // Check that id is valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (!id)
    return callback(400, { Error: "Missing required field, or field invalid" });

  // Lookup the token
  _data.read("tokens", id, function (err, tokenData) {
    if (err && !tokenData) return callback(404);
    callback(200, tokenData);
  });
};
_tokens.put = function (data, callback) {
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  var extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (!id && !extend)
    return callback(400, {
      Error: "Missing required field(s) or field(s) are invalid.",
    });

  // Lookup the existing token
  _data.read("tokens", id, function (err, tokenData) {
    if (err && !tokenData)
      return callback(400, { Error: "Specified user does not exist." });

    // Check to make sure the token isn't already expired
    if (tokenData.expires < Date.now())
      return callback(400, {
        Error: "The token has already expired, and cannot be extended.",
      });

    // Set the expiration an hour from now
    tokenData.expires = Date.now() + 1000 * 60 * 60;
    // Store the new updates
    _data.update("tokens", id, tokenData, function (err) {
      if (err)
        return callback(500, {
          Error: "Could not update the token's expiration.",
        });

      callback(200);
    });
  });
};

_tokens.delete = function (data, callback) {
  // Check that id is valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (!id) return callback(400, { Error: "Missing required field" });

  // Lookup the token
  _data.read("tokens", id, function (err, tokenData) {
    if (err && !tokenData)
      return callback(400, { Error: "Could not find the specified token." });

    // Delete the token
    _data.delete("tokens", id, function (err) {
      if (err)
        return callback(500, { Error: "Could not delete the specified token" });

      _data.read("users", tokenData.email, function (err, userData) {
        if (err)
          return callback(500, {
            Error:
              "Could not find the user who created the token, so could not remove the token from the list of tokens on their user object.",
          });

        var userTokens =
          typeof userData.tokens == "object" && userData.tokens instanceof Array
            ? userData.tokens
            : [];

        // Remove the deleted token from their list of tokens
        var tokenPosition = userTokens.indexOf(id);

        if (tokenPosition === -1)
          return callback(500, {
            Error:
              "Could not find the token on the user's object, so could not remove it.",
          });

        userTokens.splice(tokenPosition, 1);
        // Re-save the user's data
        userData.tokens = userTokens;
        _data.update("users", tokenData.email, userData, function (err) {
          if (err)
            return callback(500, {
              Error: "Could not update the user.",
            });

          callback(200);
        });
      });
    });
  });
};

_tokens.verifyToken = function (id, email, callback) {
  // Lookup the token
  _data.read("tokens", id, function (err, tokenData) {
    if (err && !tokenData) return callback(false);

    if (tokenData.email !== email) return callback(false);

    _data.read("users", tokenData.email, function (err, userData) {
      if (err)
        return callback(500, {
          Error:
            "Could not find the user who created the token, so could not remove the token from the list of tokens on their user object.",
        });

      var userTokens =
        typeof userData.tokens == "object" && userData.tokens instanceof Array
          ? userData.tokens
          : [];

      // Remove the deleted token from their list of tokens
      var tokenPosition = userTokens.indexOf(id);

      if (tokenPosition === -1) return callback(false);

      // Check that the token has not expired
      callback(tokenData.expires > Date.now());
    });
  });
};

module.exports = _tokens;
