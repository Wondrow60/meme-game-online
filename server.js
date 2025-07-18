const express = require('express');
const app = express();

app.use(express.static(__dirname));

module.exports = (req, res) => {
  app(req, res);
};
