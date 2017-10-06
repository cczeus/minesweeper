
function Minesweeper(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.gameover = false;
    this.win = false;
    this.board = initBoard();
}

function Square(row, col) {
    this.row = row;
    this.col = col;
    this.mine = false;
    this.value = 0;
    this.visible = false;
}

function initBoard() {
    var board = [];
    for(var r = 0; r < this.rows; r++) {
        var row = [];
        for(var c = 0; c < this.cols; c++) {
            row.push(new Square(r, c));
        }
        board.push(row);
    }
    return board;
}

Minesweeper.prototype.increment = function(r, c) {
    if(r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
        this.board[r][c].value++;
    }
}

Minesweeper.prototype.flood = function(r, c) {
    if(r >= 0 && r < this.rows && c >= 0 && c < this.cols && !this.board[r][c].visible) {
        this.board[r][c].visible = true;
        if(this.board[r][c].value === 0) {
            this.flood(r - 1, c - 1);
            this.flood(r - 1, c);
            this.flood(r - 1, c + 1);
            this.flood(r, c - 1);
            this.flood(r, c + 1);
            this.flood(r + 1, c - 1);
            this.flood(r + 1, c);
            this.flood(r + 1, c + 1);
        }
    }
};

Minesweeper.prototype.checkGameOver = function() {
    var count = 0;
    for(var r = 0; r < this.rows; r++) {
        for(var c = 0; c < this.cols; c++) {
            count+= this.board[r][c].visible ? 0 : 1;
            // If a bomb blew up
            if(this.board[r][c].mine && this.board[r][c].visible) {
                this.win = false;
                this.gameover = true;
                return;
            }
        }
    }
    // If bombs are the only non-visible tiles
    if(count == this.mines) {
        this.win = true;
        this.gameover = true;
        return;
    }
    this.gameover = false;
};

Minesweeper.prototype.newGame = function() {
    this.gameover = false;
    var squares = [];
    for(var r = 0; r < this.rows; r++) {
        for(var c = 0; c < this.rows; c++) {
            this.board[r][c].visible = false;
            this.board[r][c].mine = false;
            this.board[r][c].value = 0;
            squares.push(this.board[r][c]);
        }
    }
    for(var i = 0; i < this.mines; i++) {
        var sq = squares.splice(Math.floor(Math.random() * squares.length), 1)[0];
        sq.mine = true;
        this.increment(sq.row - 1, sq.col - 1);
        this.increment(sq.row - 1, sq.col);
        this.increment(sq.row - 1, sq.col + 1);
        this.increment(sq.row, sq.col - 1);
        this.increment(sq.row, sq.col + 1);
        this.increment(sq.row + 1, sq.col - 1);
        this.increment(sq.row + 1, sq.col);
        this.increment(sq.row + 1, sq.col + 1);
    }
};

Minesweeper.prototype.move = function(r, c) {
    if(this.gameover) throw 'Game Already Over';
    if(r < 0 || r >= this.rows || c < 0 && c >= this.cols) throw 'Invalid Move';
    if(this.board[r][c].visible) throw 'Tile Already Visible';
    if(this.board[r][c].value === 0) {
        this.flood(r, c)
    } else {
        this.board[r][c].visible = true;
    }
    this.checkGameOver();
};