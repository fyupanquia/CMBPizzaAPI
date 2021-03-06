// Account has been deleted
const accountDeleted = function ({ helpers }) {
  return function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      // Prepare data for interpolation
      var templateData = {
        "head.title": "Account Deleted",
        "head.description": "Your account has been deleted.",
        "body.class": "accountDeleted",
      };
      // Read in a template as a string
      helpers.getTemplate("accountDeleted", templateData, function (err, str) {
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

module.exports = accountDeleted;
