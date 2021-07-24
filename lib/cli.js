/*
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require("readline");
const events = require("events");
class _events extends events {}
const e = new _events();
const _data = require("./data");

// Instantiate the cli module object
const cli = {};

e.on("help", function (str) {
  cli.responders.help();
});

e.on("exit", function (str) {
  cli.responders.exit();
});

e.on("stats", function (str) {
  cli.responders.stats();
});

e.on("show menu", function (str) {
  cli.responders.showMenu();
});
e.on("show orders", function (str) {
  cli.responders.showOrders();
});
e.on("describe order", function (str) {
  cli.responders.describeOrder(str);
});
e.on("show signed users", function (str) {
  cli.responders.showSignedUsers();
});
e.on("describe user", function (str) {
  cli.responders.describeUser(str);
});

// Responders object
cli.responders = {};

// Help
cli.responders.help = function () {
  // Codify the commands and their explanations
  var commands = {
    exit: "Kill the CLI (and the rest of the application)",
    help: 'Alias of the "man" command',
    "show menu": "Show a list of all menu items",
    "show orders": "Show a list of orders in the last 24 hours",
    "describe order --{orderId}":
      "Lookup the details of a specific order by order ID",
    "show signed users": "Show signed users in the last 24 hours",
    "describe user --{email}": "Lookup the details of a specific user by Email",
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = "      \x1b[33m " + key + "      \x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();
};

// Create a vertical space
cli.verticalSpace = function (lines) {
  lines = typeof lines == "number" && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
    console.log("");
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function () {
  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = "";
  for (i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

// Create centered text on the screen
cli.centered = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = "";
  for (i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

// Exit
cli.responders.exit = function () {
  process.exit(0);
};

const items = require("./mockups/menu.json");
// Show menu
cli.responders.showMenu = function () {
  cli.verticalSpace();
  cli.horizontalLine();
  cli.centered("MENU ITEMS");
  cli.horizontalLine();
  cli.verticalSpace(2);
  items.forEach(function (item) {
    var line =
      "Name: " +
      +" " +
      item.description +
      " Price: " +
      item.price +
      " " +
      item.currency;
    console.log("Name: " + item.name);
    console.log("Description: " + item.description);
    console.log("Price: " + item.price + " " + item.currency);
    cli.centered("***");
    cli.verticalSpace();
  });
};

// Show Signed Users
cli.responders.showSignedUsers = function () {
  cli.verticalSpace();
  cli.horizontalLine();
  cli.centered("SIGNED USERS");
  cli.horizontalLine();
  cli.verticalSpace(2);
  const now = Date.now();
  _data.list("tokens", function (err, tokens) {
    tokens.map((token) => {
      _data.read("tokens", token, function (err2, item) {
        if (err2) return;
        let diff = now - item.unix;
        diff = Math.floor(diff / 1000);
        var secs_diff = diff % 60;
        diff = Math.floor(diff / 60);
        var mins_diff = diff % 60;
        diff = Math.floor(diff / 60);
        var hours_diff = diff % 24;
        if (hours_diff >= 24) return;

        console.log("User: " + item.email);
        console.log(
          "Signed: " +
            hours_diff +
            " hours, " +
            mins_diff +
            " mins, " +
            secs_diff +
            " seconds ago"
        );
        cli.centered("***");
      });
    });
  });
  cli.verticalSpace(2);
};

// Show Orders
cli.responders.showOrders = function () {
  cli.verticalSpace();
  cli.horizontalLine();
  cli.centered("RECENT ORDERS");
  cli.horizontalLine();
  const now = Date.now();
  _data.list("shoppingcars", function (err, owners) {
    owners.map((owner) => {
      _data.read("shoppingcars", owner, function (err2, shoppingcar) {
        if (err2) return;
        let total = 0;
        console.log("Owner: " + owner);
        cli.verticalSpace();
        shoppingcar.map((item) => {
          let diff = now - item.unix;
          diff = Math.floor(diff / 3600000);
          if (diff >= 24) return;

          console.log("Id: " + item.id);
          console.log("Name: " + item.name);
          console.log("Quantity: " + item.quantity);
          console.log("Unit price: " + item.price);
          total += item.quantity * item.price;
          cli.verticalSpace();
        });
        console.log("Total: " + total);
        cli.horizontalLine();
      });
    });
  });
  cli.horizontalLine();
};

// Describe Order by ID
cli.responders.describeOrder = function (str) {
  // Get ID from string
  var arr = str.split("--");
  var orderId =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (orderId) {
    cli.verticalSpace();
    cli.horizontalLine();
    cli.centered("DESCRIBE ORDER : " + orderId);
    cli.horizontalLine();
    _data.list("shoppingcars", function (err, owners) {
      owners.map((owner) => {
        _data.read("shoppingcars", owner, function (err2, shoppingcar) {
          if (err2) return;
          let total = 0;
          shoppingcar.map((item) => {
            if (item.id !== orderId) return;

            console.log("Id: " + item.id);
            console.log("Owner: " + owner);
            console.log("Name: " + item.name);
            console.log("Quantity: " + item.quantity);
            console.log("Unit price: " + item.price);
            console.log("SubTotal: " + item.price * item.quantity);
            cli.verticalSpace();
          });
        });
      });
    });
    cli.horizontalLine();
  }
};

// Describe User by Email
cli.responders.describeUser = function (str) {
  // Get ID from string
  var arr = str.split("--");
  var userId =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (userId) {
    cli.verticalSpace();
    cli.horizontalLine();
    cli.centered("DESCRIBE user : " + userId);
    cli.horizontalLine();
    _data.read("users", userId, function (err2, user) {
      if (err2) return;
      console.log("Fullname: " + user.fullname);
      console.log("Email: " + user.email);
      console.log("Adress: " + user.address);
    });
    cli.verticalSpace();
  }
};

// Input processor
cli.processInput = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      "help",
      "show menu",
      "show orders",
      "show signed users",
      "describe order",
      "describe user",
      "exit",
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};

// Init script
cli.init = function () {
  // Send to console, in dark blue
  console.log("\x1b[34m%s\x1b[0m", "The CLI is running");

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "",
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on("line", function (str) {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on("close", function () {
    process.exit(0);
  });
};

// Export the module
module.exports = cli;
