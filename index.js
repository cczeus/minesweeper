/* Minesweeper AI
 * Written using Tensorflow.js
 * TODO: Split this up into View and Controller
 * Add 1ms interval between every 10 training sessions to allow for page updating of log/progress bar
 * Add two sections: one for graphs, one for current status
 */


'use strict';

let board = [];
let Game = null;
let nn = null;

let defaults = {
    rows: 8,
    cols: 8,
    mines: 10
};

function init() {
    Game = new Minesweeper(30, 30, 75);
    nn = new NeuralNetwork();
    board = document.getElementById('game');
    for(var r = 0; r < Game.board.rows; r++) {
        var row = board.appendChild(document.createElement('div'));
        row.className = 'row';
        for(var c = 0; c < Game.board.cols; c++) {
            var sq = row.appendChild(document.createElement('div'));
            sq.className = 'col';
            sq.col = c;
            sq.row = r;
            sq.addEventListener('click', function(e) {
                var r = e.srcElement.row;
                var c = e.srcElement.col;
                Game.move(r, c);
                drawBoard();
                checkGameoverState();
            });
        }
    }
    drawBoard();
    resize();
    var styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    let rpct = 100 / Game.board.cols;
    let cpct = 100 / Game.board.rows;
    let rule = '.col { width: ' + rpct + '%; max-width: ' + rpct + '% } .row { height: ' + cpct + '%; max-height: ' + cpct + '% }';
    styleEl.innerHTML = rule;
}

function drawBoard() {
    var board = document.getElementById('game');
    let b = Game.board;
    for (var r = 0, row; row = board.children[r]; r++) { //eslint ignore no-cond-assign
        for (var c = 0, sq; sq = row.children[c]; c++) {
            sq.style.backgroundColor = '';
            if (! b.board[r][c].visible) {
                sq.innerHTML = ' ';
                sq.className = 'hidden col';
            } else if(b.board[r][c].mine) {
                sq.innerHTML = '*';
                sq.className = 'mine col';
            } else if(b.board[r][c].value === 0) {
                sq.innerHTML = ' ';
                sq.className = 'col';
            } else {
                sq.innerHTML = b.board[r][c].value;
                sq.className = 'col';
            }
        }
    }
}

function resize() {
    let board = document.getElementById('game');
    board.style.width = '';
    board.style.height = '';
    let width, height;
    if(board.offsetHeight / Game.board.rows > board.offsetWidth / Game.board.cols) {
        height = board.offsetWidth * Game.board.rows / Game.board.cols - 1;
        width = board.offsetWidth - 1;
    } else {
        height = board.offsetHeight - 1;
        width = board.offsetHeight * Game.board.cols / Game.board.rows - 1;
    }
    board.style.width = width + 'px';
    board.style.height = height + 'px';
}

function checkGameoverState() {
    // if(Game.gameover) {
    //     if(Game.win) {
    //         updateStatus('You Won!', 'win');
    //     } else {
    //         updateStatus('You Lose.', 'lose');
    //     }
    // }
}

function updateStatus(text, className) {
    var status = document.getElementById('status');
    status.innerHTML = text;
    status.className = className;
}

function log(str) {
    var log = document.getElementById('log');
    var message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = str;
    log.appendChild(message);
}

function newGame() {
    Game.newGame();
    drawBoard();
    // updateStatus('In Progress', 'inprogress');
}

init();


// TODO: Clean Up
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
                let cell = board.children[r].children[c];
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
                let cell = board.children[r].children[c];
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
    for(let i = 0; i < 100; i++) {
        if(i % 10 == 0) {
            setTimeout(function(){
                // do other things
                message('Completed: ' + i);
                console.log(i);
            }, 0);
        }
        Game.newGame();
        trainGame() ? wins++ : losses++;
    }
    drawBoard();
    drawPredictions();
    console.log('Wins: ' + wins);
    console.log('Losses: ' + losses);
}

function message(str) {
    let log = document.getElementById('log');
    let p = document.createElement('p');
    p.innerHTML = str;
    log.appendChild(p);
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