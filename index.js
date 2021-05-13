const http = require("http");
const { StringDecoder } = require("string_decoder");
const env = require("./lib/config");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

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

  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

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
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(payload),
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      payload = typeof payload === "object" ? payload : {};
      const payloadStr = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadStr);
    });
  });

  const router = {
    users: handlers.users,
    tokens: handlers.tokens,
    menu: handlers.menu,
    shoppingCar: handlers.shoppingCar,
  };
};
