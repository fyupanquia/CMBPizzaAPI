const cardIds = require("../../mockups/payMethods.json");
const _data = require("../../data");

// Create New Session
const shoppingCar = function ({ helpers }) {
  return function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      // Get token from headers
      var token = data.queryStringObject.token || false;
      // Get email from body
      var email =
        typeof data.queryStringObject.email == "string" &&
        helpers.validateEmail(data.queryStringObject.email.trim())
          ? data.queryStringObject.email.trim()
          : false;

      // Verify that the given token is valid for the email
      _tokens.verifyToken(token, email, function (tokenIsValid) {
        if (!tokenIsValid) return callback(405, undefined, "html");
        // Get Shopping car
        _data.read("shoppingcars", email, function (err, scData) {
          if (!scData)
            return helpers.getTemplate(
              "emptyShoppingCar",
              {},
              function (err, str) {
                if (!err && str) {
                  // Add the universal header and footer
                  helpers.addUniversalTemplates(str, {}, function (err, str) {
                    if (!err && str) {
                      // Return that page as HTML
                      callback(200, str, "html");
                    } else {
                      callback(500, undefined, "html");
                    }
                  });
                } else {
                  callback(500, undefined, "html");
                }
              }
            );

          const orderList = scData
            .map((order) => {
              return `<div class="blurb">
                <div class="img-container">
                  <img src="${order.url}">
                </div>
                <div class="description-container">
                  <span>${order.name}</span>
                  <p>${order.description}</p>
                  <div class="business-container">
                    <div class="price">
                      ${order.price * order.quantity} ${order.currency}
                    </div>
                    <div class="add-car-btn" onClick="app.addToCar('${
                      order.id
                    }',${order.quantity}, true)">Quantity : ${
                order.quantity
              }</div>
                  </div>
                </div>
              </div>`;
            })
            .join("");
          // Prepare data for interpolation
          var templateData = {
            "head.title": "Shoppping car.",
            "head.description": "Pay easily and safetly",
            "body.class": "index",
            "shoppingCar.cardIds": `<ul>${Object.keys(cardIds)
              .map((ci) => `<li>${ci}</li>`)
              .join("")}</ul>`,
            "shoppingCar.list": `
            ${orderList}
            <div class="blurb">
                <div class="img-container">
                </div>
                <div class="description-container w100">
                  <span>TOTAL</span>
                  <div class="business-container">
                    <div class="price">${scData.reduce(
                      (acum, val) => acum + val.price * val.quantity,
                      0
                    )} ${scData[0] && scData[0].currency}</div>
                  </div>
                </div>
              </div>`,
            "user.email": email,
          };

          // Read in a template as a string
          helpers.getTemplate("shoppingCar", templateData, function (err, str) {
            if (!err && str) {
              // Add the universal header and footer
              helpers.addUniversalTemplates(
                str,
                templateData,
                function (err, str) {
                  if (!err && str) {
                    // Return that page as HTML
                    callback(200, str, "html");
                  } else {
                    callback(500, undefined, "html");
                  }
                }
              );
            } else {
              callback(500, undefined, "html");
            }
          });
        });
      });
    } else {
      callback(405, undefined, "html");
    }
  };
};
module.exports = shoppingCar;
