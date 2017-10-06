function Square(row, col) {
    this.row = row;
    this.col = col;
    this.mine = false;
    this.value = 0;
    this.visible = false;
}

module.exports = Square;