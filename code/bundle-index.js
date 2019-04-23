(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DEBUG = '--------------------- DEBUG ---------------------';

class Node {

	constructor(i, j) {

		this._r = i;
		this._c = j;

		this._up = this;
		this._down = this;
		this._left = this;
		this._right = this;

		this._header = this;

	}

}


class Header extends Node {

	constructor(j) {

		super(-1, j);
		this._length = 1;

	}

}


class DLX {

	// A: rows * cols matrix consisting of 0 and 1;
	constructor(A, rows, cols) {

		var i, j,
			header, node,
			list = Array(rows);

		this._header = null;

		this._rows = rows;
		this._cols = cols;

		this._solution = [];

		// initialize headers;
		for (j = 0; j < cols; j++) {
			header = new Header(j);
			if (this._header == null) {
				// initial header;
				this._header = header;
			}
			else {
				header._right = this._header;
				header._left = this._header._left;

				this._header._left._right = header;
				this._header._left = header;
			}
		}

		// initialize columns;
		for (i = 0; i < rows; i++) {
			header = this._header;
			list[i] = [];
			for (j = 0; j < cols; j++) {
				if (A[i][j] == 1) {
					node = new Node(i, j);
					// connect to up and down;
					node._up = header._up;
					node._down = header;
					node._header = header;

					header._up._down = node;
					header._up = node;
					header._length = header._length + 1;

					list[i].push(node);
				}
				header = header._right;
			}
		}

		// console.log(list);

		// connect rows;
		for (i = 0; i < rows; i++) {
			if (list[i][0] != null) {
				// console.log(i);
				// console.log(list[i]);
				header = list[i].splice(0, 1)[0];
				while (list[i][0] != null) {
					// console.log('---------------------');
					// console.log(list[i]);
					node = list[i].splice(0, 1)[0];
					// console.log('node: ', node);
					node._right = header;
					node._left = header._left;

					header._left._right = node;
					header._left = node;
				}
			}
		}

	}


	getShortestColumn() {

		var header = this._header,
			min_length = this._header._length,
			min_column = this._header;

		while (header._right != this._header) {

			header = header._right;
			if (header._length < min_length) {
				min_length = header._length;
				min_column = header;
			}

		}

		return [min_column, min_length];

	}

	cover_col(header) {

		header._left._right = header._right;
		header._right._left = header._left;

		if (this._header == header) {
			if (header._right == header) {
				this._header = null;
			}
			else {
				this._header = header._right;
			}
		}

	}

	uncover_col(header) {

		header._left._right = header;
		header._right._left = header;

		if (this._header == null) {
			this._header = header;
		}

	}

	uncover_col_all(headers) {

		var i;

		for (i = 0; i < headers.length; i++) {
			this.uncover_col(headers[i]);
		}
		
	}

	cover_row(node) {

		var del = node;
		
		del._up._down = del._down;
		del._down._up = del._up;
		del._header._length = del._header._length - 1;
		del = del._right;

		while (del != node) {
			del._up._down = del._down;
			del._down._up = del._up;
			del._header._length = del._header._length - 1;
			del = del._right;
		}

	}

	uncover_row(node) {

		var add = node;

		add._up._down = add;
		add._down._up = add;
		add._header._length = add._header._length + 1;
		add = add._right;

		while (add != node) {
			add._up._down = add;
			add._down._up = add;
			add._header._length = add._header._length + 1;
			add = add._right;
		}

	}

	uncover_row_all(rows) {

		var i;

		for (i = 0; i < rows.length; i++) {
			this.uncover_row(rows[i]);
		}
		
	}

	solve(level) {

		console.log('level: ', level);

		/*
		console.log(DEBUG);
		console.log('sol: ', this._solution);
		console.log('header: ', this._header);
		*/

		var header, node_1, node_2,
			sel_col, sel_row,
			i, j,
			covered_rows, covered_cols,
			solved;

		// empty matrix;
		if (this._header == null) {
			return true;
		}
		
		// check columns with only 0;
		if (this._header._down == this._header) {
			return false;
		}
		header = this._header._right;
		while (header != this._header) {
			if (header._down == header) {
				return false;
			}
			header = header._right;
		}

		// get the header of the shortest column, not empty;
		[sel_col, ] = this.getShortestColumn();
		// a node from the selected row;
		sel_row = sel_col._down;
		while (sel_row != sel_col) {

			covered_rows = [];
			covered_cols = [];

			this._solution.push(sel_row._r);

			// cover row, col, and rows with 1 in the column;
			// this.cover_row(sel_row);
			covered_rows.push(sel_row);

			this.cover_col(sel_col);
			covered_cols.push(sel_col);

			node_1 = sel_col._down;
			while (node_1 != sel_col) {
				// this.cover_row(node_1);
				covered_rows.push(node_1);
				node_1 = node_1._down;
			}

			// cover row, col, and rows with 1 in the column;
			// console.log(sel_row);
			node_1 = sel_row._right;
			while (node_1 != sel_row) {

				header = node_1._header

				this.cover_col(header);
				covered_cols.push(header);

				node_2 = header._down;

				while (node_2 != header) {

					// this.cover_row(node_2);
					covered_rows.push(node_2);

					node_2 = node_2._down;

				}

				node_1 = node_1._right;

			}

			for (i = 0; i < covered_rows.length; i++) {
				this.cover_row(covered_rows[i]);
			}

			solved = this.solve(level + 1);

			if (solved) {
				return true;
			}

			this.uncover_row_all(covered_rows);
			this.uncover_col_all(covered_cols);

			this._solution.splice(this._solution.length - 1, 1);

			sel_row = sel_row._down;

		}

		return false;

	}


}





module.exports = { Node, Header, DLX };

function testDLX() {

	A = [
		[1, 0, 0, 1, 0, 0, 1], 
		[1, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 1, 0, 1],
		[0, 0, 1, 0, 1, 1, 0],
		[0, 1, 1, 0, 0, 1, 1],
		[0, 1, 0, 0, 0, 0, 1]
	];

	var dlx = new DLX(A, 6, 7);
	// console.log(matrix);
	var solved = dlx.solve(0);

	if (solved) {
		var sol_rows = dlx._solution;
		var rows = sol_rows.sort();
		var solution = [];
		for (var i = 0; i < rows.length; i++) {
			solution.push(A[rows[i]]);
		}

		console.log('solved: ');
		console.log(solution);
	}
	else {

		console.log('failed.');

	}

}


// testDLX()
},{}],2:[function(require,module,exports){
var sudoku = require('./sudoku');

window.solveSudoku = function() {

	var A = Array(9);
	var i, j;
	var val;
	var id;

	for (i = 0; i < 9; i++) {
		A[i] = Array(9);
		for (j = 0; j < 9; j++) {
			id = 'cell-' + (i * 9 + j);
			val = document.getElementById(id).value;
			if (val == '') {
				A[i][j] = null;
			}
			else {
				A[i][j] = parseInt(val);
				$('#' + id).prop('disabled', true);
			}
		}
	}

	console.log(A);

	var board = new sudoku.Sudoku(A);
	var solution = board.solve();

	console.log(solution);

	for (i = 0; i < 9; i++) {
		for (j = 0; j < 9; j++) {
			id = 'cell-' + (i * 9 + j);
			$('#' + id).val(solution[i][j]);
		}
	}

}


window.clearBoard = function() {

	var i, j;
	var id;

	for (i = 0; i < 9; i++) {
		for (j = 0; j < 9; j++) {
			id = 'cell-' + (i * 9 + j);
			$('#' + id).prop('disabled', false);
			$('#' + id).val('');
		}
	}

}
},{"./sudoku":3}],3:[function(require,module,exports){
var DLX = require('./DLX.js');

var DEBUG = '--------------------- DEBUG ---------------------';

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
		this._del_rows = del_rows.length;

		this._row_map = Array(this._rows - this._del_rows);

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

		var A = Array(this._rows - this._del_rows);
		var i, j,
			offset_r = 0, 
			offset_c = 0;
		// console.log(this._cols - this._del_cols);
		
		for (i = 0; i < this._rows; i++) {
			if (this._matrix[i] == null || this._matrix[i] == 'undefined') {
				// console.log('pass: ', i);
				offset_r++;
				continue;
			}
			A[i - offset_r] = Array(this._cols - this._del_cols);
			this._row_map[i - offset_r] = i;
			// console.log('row: ', i);
			offset_c = 0;
			for (j = 0; j < this._cols; j++) {
				if (this._matrix[i][j] == null || this._matrix[i][j] == 'undefined') {
					offset_c++;
				}
				else {
					A[i - offset_r][j - offset_c] = this._matrix[i][j];
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
		
		var dlx = new DLX.DLX(A, this._rows - this._del_rows, this._cols - this._del_cols);
		var solved = dlx.solve(0);
		
		if (solved) {
			console.log('solved');
			var dlx_sol = Array(dlx._solution.length);
			for (i = 0; i < dlx_sol.length; i++) {
				dlx_sol[i] = this._row_map[dlx._solution[i]];
			}
			var solution = this._solution.concat(dlx_sol);
			var loc;
			for (i = 0; i < solution.length; i++) {
				loc = this.decodeSol(solution[i]);
				this._board[loc[0]][loc[1]] = loc[2] + 1;
			}
		}
		else {
			console.log('failed.');
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


testSudoku();


},{"./DLX.js":1}]},{},[2]);
