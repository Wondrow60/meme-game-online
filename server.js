const express = require('express');
const app = express();

app.use(express.static(__dirname)); // Statik dosyaları servis et (index.html dahil)

module.exports = (req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url; // Ana sayfa için index.html’i servis et
  app(req, res);
};
