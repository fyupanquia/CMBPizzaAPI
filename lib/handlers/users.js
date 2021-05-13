const helpers = require("../helpers");
const _data = require("../data");
const _tokens = require("./tokens");
// Container for all the users methods
const _users = {};

_users.post = function (data, callback) {
  // Check that all required fields are filled out
  var fullname =
    typeof data.payload.fullname == "string" &&
    data.payload.fullname.trim().length > 0
      ? data.payload.fullname.trim()
      : false;
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;
  var address =
    typeof data.payload.address == "string" &&
    data.payload.address.trim().length > 0
      ? data.payload.address.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (!fullname || !email || !password || !address || !tosAgreement)
    return callback(400, { Error: "Missing required fields" });

  // Make sure the user doesnt already exist
  _data.read("users", email, function (err, data) {
    if (!err)
      // User alread exists
      return callback(400, {
        Error: "A user with that email already exists",
      });

    // Hash the password
    var hashedPassword = helpers.hash(password);

    // Create the user object
    if (!hashedPassword)
      return callback(500, { Error: "Could not hash the user's password." });

    var userObject = {
      fullname: fullname,
      email: email,
      address: address,
      hashedPassword,
      tosAgreement: true,
    };

    // Store the user
    _data.create("users", email, userObject, function (err) {
      if (!err) {
        callback(201);
      } else {
        console.log(err);
        callback(500, { Error: "Could not create the new user" });
      }
    });
  });
};

_users.get = function (data, callback) {
  // Check that email number is valid
  var email =
    typeof data.queryStringObject.email == "string" &&
    helpers.validateEmail(data.queryStringObject.email.trim())
      ? data.queryStringObject.email.trim()
      : false;
  if (!email) return callback(400, { Error: "Missing required field" });

  // Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;
  // Verify that the given token is valid for the email number
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    // Lookup the user
    _data.read("users", email, function (err, data) {
      if (err && !data) return callback(404);

      // Remove the hashed password from the user user object before returning it to the requester
      delete data.hashedPassword;
      delete data.tokens;
      callback(200, data);
    });
  });
};

_users.put = function (data, callback) {
  // Check that fields were filled out
  var fullname =
    typeof data.payload.fullname == "string" &&
    data.payload.fullname.trim().length > 0
      ? data.payload.fullname.trim()
      : false;
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;
  var address =
    typeof data.payload.address == "string" &&
    data.payload.address.trim().length > 0
      ? data.payload.address.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if email is invalid
  if (!email) return callback(400, { Error: "Missing fields to update." });

  // Error if nothing is sent to update
  if (!fullname && !address && !password)
    return callback(400, { Error: "Missing required field." });

  // Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  // Verify that the given token is valid for the email number
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    // Lookup the user
    _data.read("users", email, function (err, userData) {
      if (err && !userData)
        return callback(400, { Error: "Specified user does not exist." });

      // Update the fields if necessary
      if (fullname) userData.fullname = fullname;

      if (address) userData.address = address;

      if (password) userData.hashedPassword = helpers.hash(password);

      // Store the new updates
      _data.update("users", email, userData, function (err) {
        if (err) return callback(500, { Error: "Could not update the user." });

        callback(200);
      });
    });
  });
};

_users.delete = function (data, callback) {
  // Check that email is valid
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;

  if (!email) return callback(400, { Error: "Missing required field" });

  //Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  // Verify that the given token is valid for the email number
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    // Lookup the user
    _data.read("users", email, function (err, userData) {
      if (err && !userData)
        return callback(400, { Error: "Could not find the specified user." });

      // Delete the user's data
      _data.delete("users", email, function (err) {
        if (err)
          return callback(500, {
            Error: "Could not delete the specified user",
          });

        // Delete each of the tokens associated with the user
        var userTokens =
          typeof userData.tokens == "object" && userData.tokens instanceof Array
            ? userData.tokens
            : [];

        var tokensToDelete = userTokens.length;
        if (tokensToDelete === 0) return callback(200);

        var tokensDeleted = 0;
        var deletionErrors = false;
        // Loop through the tokens
        userTokens.forEach(function (tokenId) {
          // Delete the token
          _data.delete("tokens", tokenId, function (err) {
            if (err) deletionErrors = true;

            tokensDeleted++;
            if (tokensDeleted == tokensToDelete) {
              if (deletionErrors)
                return callback(500, {
                  Error:
                    "Errors encountered while attempting to delete all of the user's tokens. All tokens may not have been deleted from the system successfully.",
                });

              callback(200);
            }
          });
        });
      });
    });
  });
};

module.exports = _users;
