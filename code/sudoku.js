var dlx = require('./DLX.js');

var DEBUG = '------- DEBUG -------';

class Sudoku {

	// 9 * 9 board, null in empty slots and number (0 - 9) in filled slots;
	constructor(board) {
		
		var i, j, k;
		
		this._rows = 9 * 9 * 9;
		this._cols = 9 * 9 * 4;
		this._matrix = Array(this._rows);
		for (i = 0; i < this._rows; i++) {
			this._matrix[i] = Array(this._cols);
			for (j = 0; j < this._cols; j++) {
				this._matrix[i][j] = 0;
			}
		}
		// rows: position = num * row * col; 9 * 9 * 9
		// cols: constraint = cons * ind_1 * ind_2;
		// num: original num - 1;
		/*
			cons:
				0. row-col: ind_1 = row, ind_2 = col;
				1. row-num: ind_1 = row, ind_2 = num;
				2. col-num: ind_1 = col, ind_2 = num;
				3. box-num: ind_1 = box, ind_2 = num;
		*/

		this._solution = [];

		this._board = Array(9);
		var del_cols = [],
			del_rows = [],
			del_cols_p = [];
		for (i = 0; i < 9; i++) {
			this._board[i] = Array(9);
			for (j = 0; j < 9; j++) {
				this._board[i][j] = board[i][j];
				// console.log(board[i][j]);
				if (board[i][j] != null) {
					this._solution.push((board[i][j] - 1) * 9 * 9 + i * 9 + j);
					del_cols_p = this.setConstraint(i, j, board[i][j] - 1, true);

					for (k = 0; k < del_cols_p.length; k++) {
						if (del_cols.indexOf(del_cols_p[k]) != -1) {
							console.log('error');
							console.log(del_cols_p);
							console.log(del_cols.indexOf(del_cols_p[k]), del_cols_p[k]);
						}
					}

					del_cols = del_cols.concat(del_cols_p);
				}	
			}
		}

		this.addConstraints();

		del_cols = [...new Set(del_cols)];
		for (j = 0; j < del_cols.length; j++) {
			for (i = 0; i < this._rows; i++) {
				if (this._matrix[i][del_cols[j]] == 1) {
					del_rows.push(i);
				}
				delete this._matrix[i][del_cols[j]];
				if (this._matrix[i][del_cols[j]] != null) {
					console.log('error');
				}
			}
		}


		del_rows = [...new Set(del_rows)];
		for (i = 0; i < del_rows.length; i++) {
			delete this._matrix[del_rows[i]];
		}

		this._del_cols = del_cols.length;

	}


	addConstraints() {

		var i, j, k;
		for (i = 0; i < 9; i++) {
			for (j = 0; j < 9; j++) {
				for (k = 0; k < 9; k++) {
					/*
					if (this._board[i][j] == null) {
						this.setConstraint(i, j, k, false);
					}
					*/
					this.setConstraint(i, j, k, false);
				}
			}
		}

	}


	setConstraint(row, col, num, filled) {

		var box_row = Math.floor(row / 3);
		var box_col = Math.floor(col / 3);

		var box = box_row * 3 + box_col;

		this._matrix[num * 9 * 9 + row * 9 + col][0 * 9 * 9 + row * 9 + col] = 1;
		this._matrix[num * 9 * 9 + row * 9 + col][1 * 9 * 9 + row * 9 + num] = 1;
		this._matrix[num * 9 * 9 + row * 9 + col][2 * 9 * 9 + col * 9 + num] = 1;
		this._matrix[num * 9 * 9 + row * 9 + col][3 * 9 * 9 + box * 9 + num] = 1;

		var n;

		if (filled) {
			var del_cols = [0 * 9 * 9 + row * 9 + col, 1 * 9 * 9 + row * 9 + num, 2 * 9 * 9 + col * 9 + num, 3 * 9 * 9 + box * 9 + num];
			// console.log(row, col, num, box);
			// console.log(del_cols);
			return del_cols;
		}

		return [];

	}


	decodeSol(ind) {

		// decode the row number in matrix to row, col, num;
		// 9 * 9 * 9;
		var col = ind % 9;
		ind -= col;
		var row = ind % (9 * 9) / 9;
		ind -= row * 9;
		var num = ind % (9 * 9 * 9) / 81;

		return [row, col, num];

	}

	checkValid(A) {

		if (A[0] == null) {
			return true;
		}

		var empty = true;
		var i, j;
		for (j = 0; j < A[0].length; j++) {
			empty = true;
			for (i = 0; i < A.length; i++) {
				if (A[i] != null && A[i][j] != null) {
					empty = false;
				}
			}
			if (empty) {
				return false;
			}
		}

		return true;

	}


	solve() {

		var A = Array(this._rows);
		var i, j, offset;
		// console.log(this._cols - this._del_cols);
		
		for (i = 0; i < this._rows; i++) {
			A[i] = Array(this._cols - this._del_cols);
			if (this._matrix[i] == null || this._matrix[i] == 'undefined') {
				// console.log('pass: ', i);
				continue;
			}
			// console.log('row: ', i);
			offset = 0;
			for (j = 0; j < this._cols; j++) {
				if (this._matrix[i][j] == null || this._matrix[i][j] == 'undefined') {
					offset++;
				}
				else {
					A[i][j - offset] = this._matrix[i][j];
				}
			}
		}
		// console.log(offset, j);

		// console.log(DEBUG);
		var valid = this.checkValid(A);
		if (!valid) {
			console.log('invalid');
			return;
		}
		
		var matrix = new dlx.Matrix(A);
		var results = matrix.solve();
		
		if (results[0]) {
			console.log('solved');
			var solution = this._solution.concat(results[1]);
			var loc;
			for (i = 0; i < solution.length; i++) {
				loc = this.decodeSol(solution[i]);
				this._board[loc[0]][loc[1]] = loc[2] + 1;
			}
		}
		else {
			console.log(results);
		}

		console.log(this._board);
		// console.log(matrix);
		return this._board;

	}

}


module.exports = { Sudoku };


function testSudoku() {

	var board = [

		[null, null, 3, 9, null, null, 7, 6, null],
		[null, 4, null, null, null, 6, null, null, 9],
		[6, null, 7, null, 1, null, null, null, 4],
		[2, null, null, 6, 7, null, null, 9, null],
		[null, null, 4, 3, null, 5, 6, null, null],
		[null, 1, null, null, 4, 9, null, null, 7],
		[7, null, null, null, 9, null, 2, null, 1],
		[3, null, null, 2, null, null, null, 4, null],
		[null, 2, 9, null, null, 8, 5, null, null]

	];

	sudoku = new Sudoku(board);
	// console.log(sudoku);
	var sol = sudoku.solve();

}


