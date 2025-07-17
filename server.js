const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

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
    currentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
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

const prompts = [
  "Kardeşimin odasında cetvelin üstünde 8 cm işaretli olduğunu görmüşümdür.",
  "Marketten aldığım yumurtalar konuşmaya başladı.",
  "Kedim Zoom toplantısında patronumun koltuğuna oturdu.",
  // Diğer prompt’ları buraya ekleyebilirsin
];

const memeList = [
  { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
  // Diğer meme’leri buraya ekleyebilirsin
];

module.exports = app; // Vercel için gerekli
