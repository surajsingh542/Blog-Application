const appErr = require("./appErr");

const castErr = (err) => {
  let message = `Invalid ${err.path} : ${err.value}`;
  return appErr(message, 400);
};

module.exports = castErr;
