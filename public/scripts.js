const socket = io();
const numColumns = 25;

const usernameDisplay = document.getElementById('username');
const userCountDiv = document.getElementById('userCount');
const messages = document.getElementById('messages');
const images = document.getElementById('images');
const grid = document.getElementById('grid');
const finishScreen = document.getElementById('finishScreen');
const winnerName = document.getElementById('winnerName');

socket.on('connect', () => {
    socket.on('user count', (data) => {
        userCountDiv.textContent = `Users online: ${data.count}`;
        renderGrid(data.users);
    });

    socket.on('chat message', (data) => {
        messages.innerHTML = '';
        data.users.forEach(user => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.innerHTML = `<strong>${user.username}:</strong> (Total: ${user.score})`;
            messages.appendChild(item);
            updateGrid(user);
            if (user.score >= numColumns) {
                showFinishScreen(user.username);
            }
        });
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('assign username', (username) => {
        usernameDisplay.textContent = username;
    });
});

images.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const maxNumber = parseInt(e.target.getAttribute('data-number'), 10);
        const color = e.target.getAttribute('data-color');
        const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
        socket.emit('chat message', { randomNumber, image: color });
    }
});

function renderGrid(users) {
    grid.style.gridTemplateColumns = `repeat(${numColumns}, 40px)`;
    grid.innerHTML = '';
    users.forEach(user => {
        const usernameCell = document.createElement('div');
        usernameCell.className = 'username-cell';
        usernameCell.textContent = user.username;
        grid.appendChild(usernameCell);

        for (let j = 0; j < numColumns; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cell-${user.id}-${j}`;
            grid.appendChild(cell);
        }
    });
}

function updateGrid(user) {
    const userRowCells = document.querySelectorAll(`[id^="cell-${user.id}-"]`);
    userRowCells.forEach(cell => {
        cell.classList.remove('orange', 'purple', 'blue', 'green', 'yellow');
        const snailImg = cell.querySelector('.snail');
        if (snailImg) {
            cell.removeChild(snailImg);
        }
    });
    const activeCell = document.getElementById(`cell-${user.id}-${user.score % numColumns}`);
    if (activeCell) {
        activeCell.classList.add(user.image);
        const snailImg = document.createElement('img');
        snailImg.src = 'images/snail.png';
        snailImg.className = 'snail';
        activeCell.appendChild(snailImg);
    }
}

function showFinishScreen(winner) {
    winnerName.textContent = winner;
    finishScreen.classList.add('active');
    setTimeout(() => {
        finishScreen.classList.remove('active');
        resetGrid();
    }, 5000);
}

function resetGrid() {
    socket.emit('reset game');
}
