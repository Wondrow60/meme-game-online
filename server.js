const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname)); // Statik dosyaları servis et (index.html dahil)

let players = [];
let memes = [];
let votes = [];
let currentPrompt = '';
let scores = {};

io.on('connection', (socket) => {
  console.log('Yeni oyuncu bağlandı:', socket.id);
  socket.emit('playerList', players);

  socket.on('addPlayer', (name) => {
    if (!players.includes(name)) {
      players.push(name);
      scores[name] = scores[name] || 0;
      io.emit('playerList', players);
    }
  });

  socket.on('startRound', () => {
    memes = [];
    votes = [];
    // Düzeltme: Random prompt seçimi
    const tempPrompts = ["Örnek cümle"]; // Geçici bir dizi
    currentPrompt = tempPrompts[Math.floor(Math.random() * tempPrompts.length)];
    io.emit('startRound', currentPrompt);
  });

  socket.on('submitMeme', (data) => {
    memes.push({ player: data.player, url: data.url, name: data.name });
    if (memes.length === players.length) {
      io.emit('showMemes', memes);
    }
  });

  socket.on('vote', (index) => {
    if (!votes.includes(index)) {
      votes.push(index);
      io.emit('updateVotes', votes.length);
      if (votes.length === players.length) {
        const voteCounts = Array(memes.length).fill(0);
        votes.forEach(v => voteCounts[v]++);
        const maxVotes = Math.max(...voteCounts);
        const winnerIndex = voteCounts.indexOf(maxVotes);
        const winner = memes[winnerIndex].player;
        scores[winner] = (scores[winner] || 0) + 5;
        io.emit('showResults', { winner, meme: memes[winnerIndex], scores });
      }
    }
  });
});

// Vercel serverless için
module.exports = (req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url; // Ana sayfa için index.html’i servis et
  app(req, res);
};
