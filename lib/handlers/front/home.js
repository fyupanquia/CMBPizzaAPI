// Index
const home = function ({ helpers }) {
  return function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      // Prepare data for interpolation
      var templateData = {
        "head.title": "This is the title",
        "head.description": "This is the meta description",
        "body.title": "Hello templated world!",
        "body.class": "index",
      };
      // Read in a template as a string
      helpers.getTemplate("index", templateData, function (err, str) {
        if (!err && str) {
          // Add the universal header and footer
          helpers.addUniversalTemplates(str, templateData, function (err, str) {
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
      });
    } else {
      callback(405, undefined, "html");
    }
  };
};

module.exports = home;
