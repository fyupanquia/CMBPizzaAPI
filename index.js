const http = require("http");
const { StringDecoder } = require("string_decoder");
const env = require("./lib/config");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");
const util = require("util");
const debug = util.debuglog("server"); // set NODE_DEBUG=server&&node index.js

const httpServer = http.createServer(function (req, res) {
  req.httpProtocol = "http";
  req.httpPort = env.httpPort;
  unifiedServer(req, res);
});
httpServer.listen(env.httpPort, () => {
  console.log(`server running at ${env.httpPort} in ${env.name} mode`);
});

const unifiedServer = (req, res) => {
  const parsedUrl = new URL(
    `${req.httpProtocol}://localhost:${env.httpPort}${req.url}`
  );
  const path = parsedUrl.pathname;
  const queryStringObject = parsedUrl.searchParams.toString().length
    ? JSON.parse(
        '{"' +
          decodeURIComponent(parsedUrl.searchParams.toString())
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
          '"}'
      )
    : {};

  let trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const method = req.method.toLowerCase();
  const headers = req.headers;

  // get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let payload = "";

  req.on("data", (data) => {
    payload += decoder.write(data);
  });

  req.on("end", () => {
    payload += decoder.end();
    let chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    chosenHandler =
      trimmedPath.indexOf("public/") > -1 ? router.public : chosenHandler;
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(payload),
    };

    chosenHandler(data, (statusCode, payload, contentType) => {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      //payload = typeof payload === "object" ? payload : {};
      contentType = contentType ? contentType : "json";
      //const payloadStr = JSON.stringify(payload);

      // Return the response parts that are content-type specific
      var payloadString = "";
      if (contentType == "json") {
        res.setHeader("Content-Type", "application/json");
        payload = typeof payload == "object" ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      if (contentType == "html") {
        res.setHeader("Content-Type", "text/html");
        payloadString = typeof payload == "string" ? payload : "";
      }

      if (contentType == "favicon") {
        res.setHeader("Content-Type", "image/x-icon");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "plain") {
        res.setHeader("Content-Type", "text/plain");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "css") {
        res.setHeader("Content-Type", "text/css");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "png") {
        res.setHeader("Content-Type", "image/png");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "jpg") {
        res.setHeader("Content-Type", "image/jpeg");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode === 200) {
        debug(
          "\x1b[32m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      } else {
        debug(
          "\x1b[31m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      }
    });
  });

  const router = {
    "": handlers.front.home,
    public: handlers.front.public,
    "shopping-car": handlers.front.shoppingCar,
    "account/create": handlers.front.accountCreate,
    "account/edit": handlers.front.accountEdit,
    "account/deleted": handlers.front.accountDeleted,
    "session/create": handlers.front.sessionCreate,
    "session/deleted": handlers.front.sessionDeleted,
    "api/users": handlers.back.users,
    "api/tokens": handlers.back.tokens,
    "api/menu": handlers.back.menu,
    "api/shoppingCar": handlers.back.shoppingCar,
  };
};
