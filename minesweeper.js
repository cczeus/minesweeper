class Square {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.mine = false;
        this.value = 0;
        this.visible = false;
    }
}

class Board {
    constructor(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = this.initBoard();
        this.visibleTiles = rows * cols;
        this.placeMines();
    }

    initBoard() {
        let board = [];
        for(let r = 0; r < this.rows; r++) {
            let row = [];
            for(let c = 0; c < this.cols; c++) {
                row.push(new Square(r, c));
            }
            board.push(row);
        }
        return board;
    }

    placeMines() {
        let squares = generateUniqueRandomValues(this.rows * this.cols, this.mines);
        for(let i = 0; i < squares.length; i++) {
            let r = Math.floor(squares[i] / this.cols);
            let c = squares[i] % this.rows;
            this.board[r][c].mine = true;
            this.board[r][c].value++;
            this.incrementSquareValue(r - 1, c - 1);
            this.incrementSquareValue(r - 1, c);
            this.incrementSquareValue(r - 1, c + 1);
            this.incrementSquareValue(r, c - 1);
            this.incrementSquareValue(r, c + 1);
            this.incrementSquareValue(r + 1, c - 1);
            this.incrementSquareValue(r + 1, c);
            this.incrementSquareValue(r + 1, c + 1);
        }
    }

    incrementSquareValue(r, c) {
        if(r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.board[r][c].value++;
        }
    }

    flood(r, c) {
        if(r >= 0 && r < this.rows && c >= 0 && c < this.cols && !this.board[r][c].visible) {
            this.board[r][c].visible = true;
            this.visibleTiles--;
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
    }

    reveal(r, c) {
        if(r < 0 || r >= this.rows || c < 0 && c >= this.cols) throw 'Invalid Move';
        if(this.board[r][c].visible) throw 'Tile Already Visible';
        if(this.board[r][c].value === 0) {
            this.flood(r, c);
            return false;
        } else {
            this.board[r][c].visible = true;
            this.visibleTiles--;
            return this.board[r][c].mine;
        }
    }
}

class Minesweeper {
    constructor(rows, cols, mines) {
        this.gameover = false;
        this.win = true;
        this.board = new Board(rows, cols, mines);
    }

    changeSettings(rows, cols, mines) {
        if(mines > rows * cols / 2) {
            throw 'Too Many Mines';
        }
        this.board = new Board(rows, cols, mines);
    }

    move(r, c) {
        if(this.gameover) throw 'Game Already Over';
        let isMine = this.board.reveal(r, c);
        if(isMine || this.board.mines == this.board.visibleTiles) {
            this.gameover = true;
            if(isMine) {
                this.win = false;
            }
        }
    }

    newGame() {
        this.gameover = false;
        this.win = true;
        this.board = new Board(this.board.rows, this.board.cols, this.board.mines);
    }
}

function generateUniqueRandomValues(max, num) {
    let squares = [];
    while(squares.length < num) {
        let rand = Math.floor(Math.random() * max);
        if(squares.indexOf(rand) == -1) {
            squares.push(rand);
        }
    }
    return squares;
}