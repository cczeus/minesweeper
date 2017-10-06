//Global Variables
var rows = 5;
var cols = 5;
var mines = 4;
var Game;
var board = [];
var learningRate = 0.001;
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

//Function to start the game when called from browser
function startGame() {
    Game = new Minesweeper(rows, cols, mines);
    Game.newGame();
    init();
}

function init() {
    board = document.createElement('table');
    board.id = 'game';
    board.className = 'board';
    for(var r = 0; r < Game.rows; r++) {
        var tr = board.appendChild(document.createElement('tr'));
        for(var c = 0; c < Game.cols; c++) {
            var sq = tr.appendChild(document.createElement('td'));
            sq.addEventListener('click', function(e) {
                var r = e.target.parentNode.rowIndex;
                var c = e.target.cellIndex;
                Game.move(r, c);
                draw();
            });
        }
    }
    document.body.appendChild(board);
    draw();

    var ngbutton = document.createElement('button');
    ngbutton.innerHTML = 'New Game';
    ngbutton.addEventListener('click', function() {
        Game.newGame();
        draw();
    });
    document.body.appendChild(ngbutton);

    var stepbutton = document.createElement('button');
    stepbutton.innerHTML = 'Step';
    stepbutton.addEventListener('click', function() {
        step();
        draw();
    });
    document.body.appendChild(stepbutton);

    var runbutton = document.createElement('button');
    runbutton.innerHTML = 'Run';
    runbutton.addEventListener('click', function() {
        runGames(100);
        draw();
    });
    document.body.appendChild(runbutton);

    var printbutton = document.createElement('button');
    printbutton.innerHTML = 'Print';
    printbutton.addEventListener('click', function() {
        console.log(nn.toJSON());
    });
    document.body.appendChild(printbutton);
}

function draw() {
    var board = document.getElementById('game');
    for (var r = 0, row; row = board.rows[r]; r++) {
        for (var c = 0, sq; sq = row.cells[c]; c++) {
            if (! Game.board[r][c].visible) {
                sq.innerHTML = ' ';
                sq.className = 'hidden';
            } else if(Game.board[r][c].mine) {
                sq.innerHTML = '*';
                sq.className = 'mine';
            } else if(Game.board[r][c].value === 0) {
                sq.innerHTML = ' ';
                sq.className = '';
            } else {
                sq.innerHTML = Game.board[r][c].value;
                sq.className = '';
            }
        }
    }
}

function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var prev = inputLayer;
    var layers = [];
    hidden.forEach(function(num) {
        var hiddenLayer = new Layer(num);
        prev.project(hiddenLayer);
        prev = hiddenLayer;
        layers.push(hiddenLayer);
    });
    var outputLayer = new Layer(output);
    prev.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: layers,
        output: outputLayer
    });
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

var nn = new Perceptron(25, [300, 256, 128], 1);

function step() {
    var moves = [];
    for(var r = 0; r < Game.rows; r++) {
        for(var c = 0; c < Game.cols; c++) {
            if( ! Game.board[r][c].visible) {
                moves.push(Game.board[r][c]);
            }
        }
    }
    var maxsq;
    var max = 0;
    moves.forEach(function(square) {
        var input = buildInput(square);
        var m = nn.activate(input)[0];
        if(max < m) {
            maxsq = square;
            max = m;
        }
    });
    var input = buildInput(maxsq);
    nn.activate(input);
    var value = (maxsq.mine) ? 0 : 1;
    nn.propagate(learningRate, [value]);
    Game.move(maxsq.row, maxsq.col);
}

function buildInput(square) {
    var input = [];
    for(var r = -2; r <= 2; r++) {
        for(var c = -2; c <= 2; c++) {
            input.push(flatten(square, r, c));
        }
    }
    return input;
}

// 0-8 is value, 9 is not visible, 10 is off the board
function flatten(sq, r, c) {
    if(sq.row + r < 0 || sq.row + r >= Game.rows || sq.col + c < 0 || sq.col + c >= Game.rows) {
        return -1;
    }
    var square = Game.board[sq.row + r][sq.col + c];
    if( ! square.visible) {
        return -.5;
    }
    return (square.value / 8);
}

function runGames(num) {
    var gamecount = 0;
    while(gamecount < num) {
        while(!Game.gameover) {
            step();
            draw();
        }
        console.log('Game ' + (Game.win ? 'won' : 'lost'));
        gamecount++;
        Game.newGame();
    }
}