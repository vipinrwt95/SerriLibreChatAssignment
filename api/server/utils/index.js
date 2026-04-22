const handleText = require('./handleText');
const sendEmail = require('./sendEmail');
const queue = require('./queue');
const files = require('./files');
const contactSearch = require('./contactSearch');

module.exports = {
  ...handleText,
  sendEmail,
  ...files,
  ...queue,
  ...contactSearch,
};
