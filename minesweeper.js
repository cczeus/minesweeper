/*****************************************************
 * Minesweeper Game written entirely in javascript
 * Made for the purpose of training a Neural Network
 * by Chris Zuis
 *
 * The board is stored in a 2D array, each square holds
 * the number of bombs surrounding it, and if it is a
 * bomb then the value is 9.
 *****************************************************/

//Global Variables
var rows = 8;
var cols = 8;
var mines = 10;

//Function to start the game when called from browser
function startGame() {
    Game.initBoard();
    GameArea.init();
}

//Initialize the minesweeper Game Area
var GameArea = {
    board : null,
    init : function() {
        board = document.createElement('table');
        board.id = "game";
        board.className = 'board'
        for(r = 0; r < rows; r++) {
            var tr = board.appendChild(document.createElement('tr'));
            for(c = 0; c < cols; c++) {
                var sq = tr.appendChild(document.createElement('td'));
                sq.addEventListener('click', (function(r, c) {
                    return function() {
                        console.log(Game.makeMove(r, c));
                        if(Game.gameover) {
                            console.log("GAMEOVER");
                        }
                        GameArea.draw();
                    }
                })(r, c),false);
            }
        }
        document.body.appendChild(board);
        GameArea.draw();

        var button = document.createElement('button');
        button.innerHTML = "New Game";
        button.addEventListener('click', function() {
            Game.initBoard();
            GameArea.draw();
        });
        document.body.appendChild(button);
    },

    draw : function() {
        var board = document.getElementById("game");
        var visibleBoard = Game.getBoard();
        for(r = 0; r < 8; r++) {
            s = "";
            for(c = 0; c < 8; c++) {
                s += "[" + visibleBoard[r][c] + "] ";
            }
            console.log(s);
        }
        for (var r = 0, row; row = board.rows[r]; r++) {
            for (var c = 0, sq; sq = row.cells[c]; c++) {
                if (visibleBoard[r][c] == 10) {
                    sq.innerHTML = " ";
                    sq.className = "hidden";
                } else if(visibleBoard[r][c] == 11) {
                    sq.innerHTML = "*";
                    sq.className = "mine";
                } else if(visibleBoard[r][c] == 0) {
                    sq.innerHTML = " ";
                    sq.className = "";
                } else {
                    sq.innerHTML = visibleBoard[r][c];
                    sq.className = "";
                }
            }
        }
    }
}

//The current Minesweeper game state
var Game = {
    gameover: false,
    board : [],
    score : 0,
    visibleBoard : [],

    initBoard : function() {
        this.gameover = false;
        this.board = [];
        this.visibleBoard = [];

        //initializes the 2D array
        for(i = 0; i < rows; i++) {
            arr1 = [];
            arr2 = [];
            for(j = 0; j < cols; j++) {
                arr1.push(0);
                arr2.push(10);
            }
            this.board.push(arr1);
            this.visibleBoard.push(arr2);
        }
        console.log(this.board);
        console.log(this.board[0][0]);

        //Retrieve all squares in the board
        squares = []
        for(i = 0; i < rows * cols; i++) {
            squares.push(i);
        }
        //Select squares to create mines in
        for(i = 0; i < mines; i++) {
            sq = squares.splice(Math.floor(Math.random() * squares.length), 1)[0];
            r = Math.floor(sq / cols);
            c = sq % rows;
            this.board[r][c] = 9;
        }

        increment = function(r, c) {
            if(r >= 0 && r < rows && c >= 0 && c < cols && Game.board[r][c] != 9) {
                Game.board[r][c]++;
            }
        }

        //Generate Numbers according to mine placements
        for(r = 0; r < rows; r++) {
            for(c = 0; c < cols; c++) {
                //If a board sqaure is a bomb
                if(this.board[r][c] == 9){
                    //Add 1 to all non-bomb adjacent tiles
                    increment(r - 1, c - 1);
                    increment(r - 1, c);
                    increment(r - 1, c + 1);
                    increment(r, c - 1);
                    increment(r, c + 1);
                    increment(r + 1, c - 1);
                    increment(r + 1, c);
                    increment(r + 1, c + 1);
                }
            }
        }
    },

    //Every time a move is made, the board must always be valid and complete
    makeMove : function(r, c) {
        if(Game.gameover) {
            throw 'game over';
        }
        //If you choose an empty space, it flood fills out the rest of the empty squares
        flood = function(row, col) {
            if(row >= 0 && row < rows && col >= 0 && col < cols && Game.visibleBoard[row][col] == 10) {
                if(Game.board[row][col] == 0) {
                    Game.visibleBoard[row][col] = 0;
                    flood(row - 1, col - 1);
                    flood(row - 1, col);
                    flood(row - 1, col + 1);
                    flood(row, col + 1);
                    flood(row, col - 1);
                    flood(row + 1, col - 1);
                    flood(row + 1, col);
                    flood(row + 1, col + 1);
                } else {
                    Game.visibleBoard[row][col] = Game.board[row][col]
                }
            }
        }

        //Will update the gameover variable if the user wins the game
        checkGameOver = function() {
            count = 0;
            for(r = 0; r < rows; r++) {
                for(c = 0; c < cols; c++) {
                    if(Game.visibleBoard[r][c] == 10) {
                        count++;
                    }
                }
            }
            if(count == mines) {
                Game.gameover = true;
            }
        }

        //Updates the visible board
        if(Game.visibleBoard[r][c] == 10) {
            val = Game.board[r][c];
            if(val == 9) {
                Game.gameover = true;
                Game.visibleBoard[r][c] = 11;
                return 10;
            } else if(val > 0 && val < 9) {
                Game.visibleBoard[r][c] = val;
                checkGameOver();
                return val;
            } else if(val == 0) {
                flood(r, c);
                checkGameOver();
                return 0;
            }
        } else {
            throw 'Invalid Tile';
        }
    },

    getBoard : function() {
        return this.visibleBoard;
    },

    getTile : function(r, c) {
        return this.board[r][c];
    }
}