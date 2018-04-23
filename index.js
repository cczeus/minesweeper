let board = [];
let Game = null;
let nn = null;
let scale = 0;
let limitedByHeight = true;

function init() {
    Game = new Minesweeper(8, 8, 10);
    nn = new NeuralNetwork();
    board = document.getElementById('game');
    board.id = 'game';
    board.className = 'board';
    for(var r = 0; r < Game.board.rows; r++) {
        var tr = board.appendChild(document.createElement('tr'));
        for(var c = 0; c < Game.board.cols; c++) {
            var sq = tr.appendChild(document.createElement('td'));
            sq.addEventListener('click', function(e) {
                var r = e.target.parentNode.rowIndex;
                var c = e.target.cellIndex;
                Game.move(r, c);
                drawBoard();
                checkGameoverState();
            });
        }
    }
    drawBoard();
    // updateStatus('In Progess', 'inprogress');
    var styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    let rpct = 100 / Game.board.cols;
    let cpct = 100 / Game.board.rows;
    let rule = 'td { max-width: ' + rpct + '% } tr { max-height: ' + cpct + '% }';
    console.log(rule);
    styleEl.innerHTML = rule;
}

function drawBoard() {
    var board = document.getElementById('game');
    let b = Game.board;
    for (var r = 0, row; row = board.rows[r]; r++) {
        for (var c = 0, sq; sq = row.cells[c]; c++) {
            board.rows[r].cells.item(c).style.backgroundColor = '';
            if (! b.board[r][c].visible) {
                sq.innerHTML = ' ';
                sq.className = 'hidden';
            } else if(b.board[r][c].mine) {
                sq.innerHTML = '*';
                sq.className = 'mine';
            } else if(b.board[r][c].value === 0) {
                sq.innerHTML = ' ';
                sq.className = '';
            } else {
                sq.innerHTML = b.board[r][c].value;
                sq.className = '';
            }
        }
    }
}

function resize() {
    let board = document.getElementById('game');
    limitedByHeight = board.offsetHeight / Game.board.rows > board.offsetWidth / Game.board.cols;
    if(limitedByHeight) {
        scale = 10;
    } else {
        scale = 10;
    }
}

function checkGameoverState() {
    if(Game.gameover) {
        if(Game.win) {
            updateStatus('You Won!', 'win');
        } else {
            updateStatus('You Lose.', 'lose');
        }
    }
}

function updateStatus(text, className) {
    var status = document.getElementById('status');
    status.innerHTML = text;
    status.className = className;
}

function newGame() {
    Game.newGame();
    drawBoard();
    updateStatus('In Progress', 'inprogress');
}

init();

function getSquareArea(row, col) {
    let arr = [];
    for(let r = row - 2; r < row + 3; r++) {
        for(let c = col - 2; c < col + 3; c++) {
            if(r != row || c != col) {
                if(r < 0 || c < 0 || r >= Game.board.rows || c >= Game.board.cols) {
                    arr = arr.concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
                } else if(! Game.board.board[r][c].visible) {
                    arr = arr.concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
                } else if(Game.board.board[r][c].value == 0) {
                    arr = arr.concat([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 1) {
                    arr = arr.concat([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 2) {
                    arr = arr.concat([0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 3) {
                    arr = arr.concat([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 4) {
                    arr = arr.concat([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 5) {
                    arr = arr.concat([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 6) {
                    arr = arr.concat([0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 7) {
                    arr = arr.concat([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
                } else if(Game.board.board[r][c].value == 8) {
                    arr = arr.concat([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
                }
            }
        }
    }
    return [arr];
}

function drawPredictions() {
    let board = document.getElementById('game');
    for(let r = 0; r < Game.board.rows; r++) {
        for(let c = 0; c < Game.board.cols; c++) {
            if(!Game.board.board[r][c].visible) {
                let cell = board.rows[r].cells.item(c);
                let prediction = nn.predict(getSquareArea(r, c)).dataSync()[0];
                cell.style.backgroundColor = numberToColorHsl(1 - prediction);
            }
        }
    }
}

function predict() {
    let predictions = [];
    for(let r = 0; r < Game.board.rows; r++) {
        for(let c = 0; c < Game.board.cols; c++) {
            if(!Game.board.board[r][c].visible) {
                let prediction = nn.predict(getSquareArea(r, c)).dataSync()[0];
                predictions.push([r, c, prediction]);
            }
        }
    }
    return predictions;
}

function train() {
    let board = document.getElementById('game');
    let trainingData = [[], []];
    for(let r = 0; r < Game.board.rows; r++) {
        for(let c = 0; c < Game.board.cols; c++) {
            if(!Game.board.board[r][c].visible) {
                let cell = board.rows[r].cells.item(c);
                trainingData[0].push(getSquareArea(r, c));
                trainingData[1].push([Game.board.board[r][c].mine ? 1 : 0]);
            }
        }
    }
    nn.train(trainingData);
}

function trainGame() {
    while(! Game.gameover) {
        train();
        let predictions = predict();
        let lowestProb = 1;
        let lowestR = 0;
        let lowestC = 0;
        for(let i = 0; i < predictions.length; i++) {
            let r = predictions[i][0];
            let c = predictions[i][1];
            if(!Game.board.board[r][c].visible && predictions[i][2] < lowestProb) {
                lowestProb = predictions[i][2];
                lowestR = r;
                lowestC = c;
            }
        }
        Game.move(lowestR, lowestC);
    }
    return Game.win;
}

function trainOneGame() {
    trainGame();
    drawBoard();
    drawPredictions();
}

function trainOneHundredGames() {
    let wins = 0;
    let losses = 0;
    for(i = 0; i < 1000; i++) {
        if(i % 10 == 0) console.log(i);
        Game.newGame();
        trainGame() ? wins++ : losses++;
    }
    drawBoard();
    drawPredictions();
    console.log('Wins: ' + wins);
    console.log('Losses: ' + losses);
}

function numberToColorHsl(i) {
    // as the function expects a value between 0 and 1, and red = 0° and green = 120°
    // we convert the input to the appropriate hue value
    var hue = i * 120 / 360;
    // we convert hsl to rgb (saturation 100%, lightness 50%)
    var rgb = hslToRgb(hue, 1, .5);
    // we format to css value and return
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; 
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}