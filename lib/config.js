const envs = {};

envs.staging = {
  httpPort: 3000,
  name: "staging",
  hashingSecret: "835#q!NFjj^cQN?r",
  stripe: {
    //https://stripe.com/docs/api
    host: "api.stripe.com",
    key: process.env.STRIPE_KEY,
  },
  mailgun: {
    //https://app.mailgun.com/app/sending/domains/[DOMAIN]
    host: "api.mailgun.net",
    domain: process.env.MAILGUN_DOMAIN,
    api: {
      key: process.env.MAILGUN_KEY,
    },
  },
  maxTokens: 5,
};

envs.production = {
  httpPort: 8000,
  name: "production",
  hashingSecret: "9fmb5QvAW^g_Rz<t",
  stripe: {
    //https://stripe.com/docs/api
    host: "api.stripe.com",
    key: process.env.STRIPE_KEY,
  },
  mailgun: {
    //https://app.mailgun.com/app/sending/domains/[DOMAIN]
    host: "api.mailgun.net",
    domain: process.env.MAILGUN_DOMAIN,
    api: {
      key: process.env.MAILGUN_KEY,
    },
  },
  maxTokens: 5,
};

const currentEnv =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const env =
  typeof envs[currentEnv] === "object" ? envs[currentEnv] : envs.staging;

module.exports = env;
