const _shoppingCar = {};
var https = require("https");
const querystring = require("querystring");
const config = require("../config");
const helpers = require("../helpers");
const { StringDecoder } = require("string_decoder");
const payMethods = require("../mockups/payMethods.json");
const menu = require("../mockups/menu.json");
const _data = require("../data");
const { stripe } = require("../config");

_shoppingCar.patch = function (data, callback) {
  // Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;
  // Get email from body
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;

  // Verify that the given token is valid for the email
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    // Get required parameters
    var id =
      typeof data.payload.id == "string" && data.payload.id.trim().length == 16
        ? data.payload.id.trim()
        : false;
    var quantity =
      typeof data.payload.quantity == "number" && data.payload.quantity > 0
        ? parseFloat(data.payload.quantity)
        : false;

    if (!id || !quantity)
      return callback(400, {
        Error: "Missing fields to update the shopping car.",
      });

    // find the dish from menu
    const item = menu.find((i) => i.id === id);
    if (!item)
      return callback(404, {
        Error: "Dish not found.",
      });

    // Get Shopping car
    _data.read("shoppingcars", email, function (err, scData) {
      //item = item.shift();
      item.quantity = quantity;
      delete item.url;
      delete item.currency;
      delete item.description;
      if (err && !scData) {
        // Store the SC
        return _data.create("shoppingcars", email, [item], function (err) {
          if (err) {
            return callback(500, {
              Error: "Could not add to the shopping car",
            });
          }
          callback(200);
        });
      }
      // check if the item is in the shopping car already
      const foundIndex = scData.findIndex((i) => i.id === id);

      // edit item
      if (foundIndex > -1) {
        scData[foundIndex].quantity = item.quantity;
      } else {
        // add to the shopping car
        scData.push(item);
      }
      // Store the new updates
      _data.update("shoppingcars", email, scData, function (err) {
        if (err)
          return callback(500, { Error: "Could not add to the shopping car" });
        callback(200);
      });
    });
  });
};

_shoppingCar.post = async function (data, callback) {
  // Get token from headers
  var token =
    typeof data.headers.token == "string" ? data.headers.token : false;
  // Get email from body
  var email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;

  // Verify that the given token is valid for the email
  _tokens.verifyToken(token, email, function (tokenIsValid) {
    if (!tokenIsValid)
      return callback(403, {
        Error: "Missing required token in header, or token is invalid.",
      });

    // Get required parameters
    var cardId =
      typeof data.payload.cardId == "string"
        ? data.payload.cardId.trim()
        : false;

    if (!cardId)
      return callback(500, {
        Error: "Missing fields to confirm the shopping car.",
      });

    const paymethod = payMethods[cardId];
    if (!paymethod)
      return callback(400, { Error: "It's impossible to process this carId" });

    // Get Shopping car
    _data.read("shoppingcars", email, function (err, scData) {
      if (err && !scData)
        return callback(500, { Error: "The shopping car is empty" });

      const cost = scData.reduce((cnt, i) => cnt + i.price * i.quantity, 0);
      const description = scData.reduce(
        (cnt, i) => `${cnt}${i.name} ${i.price}*${i.quantity}, `,
        ""
      );

      const stripe = config.stripe;
      var options = {
        host: stripe.host,
        port: 443,
        path: "/v1/payment_intents",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: ` Bearer ${stripe.key}`,
        },
      };
      var postData = querystring.stringify({
        amount: parseInt(cost * 100),
        currency: "usd",
        description: `${email} - ${description}`,
        payment_method: paymethod,
        receipt_email: email,
        off_session: true,
        confirm: true,
      });

      var req = https.request(options, function (res) {
        let bodyResponse = "";
        const decoder = new StringDecoder("utf-8");
        res.on("data", (data) => {
          bodyResponse += decoder.write(data);
        });

        res.on("end", (data) => {
          bodyResponse += decoder.end();
          const objectResponse = helpers.parseJsonToObject(bodyResponse);
          if (objectResponse.status !== "succeeded")
            return callback(500, {
              Error: "Something wrong. It was impossible to confirm the order",
            });

          _data.delete("shoppingcars", email, function (err) {
            if (err)
              return callback(500, {
                Error:
                  "The order was succeeded but something wrong while the shopping car was emptying",
              });

            helpers.mail(
              email,
              "CMBPizza - New confirmed order!",
              `Description: ${description}\nTotal: USD ${cost}`,
              function (flag) {
                callback(
                  flag ? 200 : 500,
                  flag
                    ? undefined
                    : {
                        Error:
                          "The order was succeeded but something wrong while sending you an email",
                      }
                );
              }
            );
          });
        });
      });

      req.write(postData);

      req.on("error", (e) => {
        callback(500, e);
      });

      req.end();
    });
  });
};

module.exports = _shoppingCar;
