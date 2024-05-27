const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let userCount = 0;
let users = {};
let scores = {};
let selections = {};

const visualAdjectives = ['Shiny', 'Glittering', 'Sparkling', 'Radiant', 'Vibrant', 'Luminous', 'Colorful', 'Bright', 'Glossy', 'Majestic'];
const speedAdjectives = ['Swift', 'Rapid', 'Quick', 'Speedy', 'Agile', 'Brisk', 'Zippy', 'Nimble', 'Fleet', 'Hasty'];
const snailNames = ['Slider', 'Shellie', 'Slippy', 'Slinky', 'Turbo', 'Zoomer', 'Crawlie', 'Whirlie', 'Dash', 'Breeze'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

app.use(express.static('public'));

io.on('connection', (socket) => {
    userCount++;
    const userId = userCount + '-' + Math.floor(Math.random() * 10000); // Ensure unique ID even if usernames are equal
    const userName = `${getRandomElement(visualAdjectives)} ${getRandomElement(speedAdjectives)} ${getRandomElement(snailNames)}`;
    users[socket.id] = { id: userId, username: userName, score: 0, image: '' };
    socket.emit('assign username', userName); // Send assigned username to the client
    io.emit('user count', { count: userCount, users: Object.values(users) });
    console.log('A user connected:', userName);

    socket.on('chat message', (msg) => {
        const { randomNumber, image } = msg;
        selections[socket.id] = { randomNumber, image };

        if (Object.keys(selections).length === userCount) {
            let imageCounts = {};
            Object.keys(selections).forEach(id => {
                const image = selections[id].image;
                imageCounts[image] = (imageCounts[image] || 0) + 1;
            });

            Object.keys(selections).forEach(id => {
                const image = selections[id].image;
                let randomNumber = selections[id].randomNumber;
                if (imageCounts[image] > 1) {
                    randomNumber = 1; // Set maximum value to 1 if more than one user selected the same image
                }
                users[id].score += randomNumber;
                users[id].image = image;
            });

            io.emit('chat message', { users: Object.values(users), selections });
            selections = {}; // Reset selections after processing
        }
    });

    socket.on('disconnect', () => {
        userCount--;
        delete users[socket.id];
        io.emit('user count', { count: userCount, users: Object.values(users) });
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
