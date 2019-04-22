(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Node {

	constructor(i, j) {
		this._r = i;
		this._c = j;

		this._prev = null;
		this._next = null;
	}

}

class Head {

	constructor(node) {
		this._start = node;
		this._length = 1;
		this._end = node;
	}

}


class Matrix {

	// A: a matrix consisting of 0 and 1;
	constructor(A) {
		// this._matrix = [];
		this._col_heads = {};

		// console.log(A.length, A[0].length);
		
		var node_ptr = null;
		var i = 0, 
			j = 0;
		var node, head;
		var count_filled = 0;
		for (i = 0; i < A.length; i++) {
			if (A[i] == null || A[i] == 'undefined') {
				count_filled++;
				continue;
			}
			for (j = 0; j < A[0].length; j++) {
				// this._matrix[i][j] = A[i][j];
				if (A[i][j] == 1) {
					node  = new Node(i, j);
					if (this._col_heads[j] == null || this._col_heads[j] == 'undefined') {
						this._col_heads[j] = new Head(node);
					}
					else {
						head = this._col_heads[j];
						head._end._next = node;
						node._prev = head._end;
						head._end = node;
						head._length++;
					}
				}
			}
		}

		this._rows = i - count_filled;
		// this._rows = i;
		this._cols = j;

	}


	sortColByLength(col_head_lengths) {

		// [index, length];
		col_head_lengths.sort(function(a, b) {
			if (a[1] != b[1]) {
				return a[1] - b[1];
			}
			else {
				return a[0] - b[0];
			}
		});
		
		return col_head_lengths;

	}

	solve() {
		// console.log(this._col_heads);
		return this.knuth(this._col_heads, [], 0);
	}


	knuth(col_heads, sol, level) {
		console.log('level: ', level);

		var empty = true;
		var col_head_lengths = [];
		// console.log(col_heads);
		for (var i = 0; i < this._cols; i++) {
			if (col_heads[i] != 'deleted') {
				empty = false;
				// console.log(col_heads);
				if (col_heads[i] != null) {
					col_head_lengths.push([i, col_heads[i]._length]);
				}
				else {
					col_head_lengths.push([i, 0]);
				}
			}

			if (col_heads[i] == null) {
				console.log('null: ', i);
				return [false, null];
			}
			
		}
		if (empty) {
			return [true, sol];
		}

		// shortest column should exist;
		// console.log(col_head_lengths);
		var col_seq = this.sortColByLength(col_head_lengths);
		// console.log(col_seq);
		var results,
			col_ind,
			row_ind,
			row_ptr;

		var col_heads_p = {};

		var node_ptr = null;
		var node_ptr_p = null;
		var node_new;

		var del_rows = [];
		var del_cols = [];
		var tmp_rows = [];

		var del = false;
		var j = 0;

		var sol_p = [];

		for (var col_seq_ind = 0; col_seq_ind < 1; col_seq_ind++) {
			if (col_seq[col_seq_ind][1] == 0) {
				return [false, null];
			}
			col_ind = col_seq[col_seq_ind][0];
			
			row_ind = col_heads[col_ind]._start._r;
			row_ptr = col_heads[col_ind]._start;

			while (row_ptr != null) {
				row_ind = row_ptr._r;
				// sub-algorithm;
				col_heads_p = {};

				node_ptr = null;
				node_ptr_p = null;

				del_rows = [];
				del_cols = [];

				sol_p = [];
				// copy solution;
				for (i = 0; i < sol.length; i++) {
					sol_p.push(sol[i]);
				}
			
				// copy col_heads;
				for (i = 0; i < this._cols; i++) {
					if (col_heads[i] == null || col_heads[i] == 'deleted') {
						col_heads_p[i] = col_heads[i];
					}
					else {
						node_new = new Node(col_heads[i]._start._r, col_heads[i]._start._c);
						col_heads_p[i] = new Head(node_new);
						col_heads_p[i]._length = col_heads[i]._length;
						node_ptr = col_heads[i]._start._next;
						node_ptr_p = col_heads_p[i]._start;
						while (node_ptr != null) {
							node_new = new Node(node_ptr._r, node_ptr._c);
							node_ptr_p._next = node_new;
							node_new._prev = node_ptr_p;
							node_ptr_p = node_new;
							col_heads_p[i]._end = node_new;

							node_ptr = node_ptr._next;
						}
					}
				}

				del_rows.push(row_ind);
				sol_p.push(row_ind);

				// find columns to delete in the row and delete the column;
				for (i = 0; i < this._cols; i++) {
					del = false;
					if (col_heads_p[i] != null) {
						tmp_rows = [];
						node_ptr_p = col_heads_p[i]._start;
						while (node_ptr_p != null) {
							tmp_rows.push(node_ptr_p._r);
							if (node_ptr_p._r == row_ind) {
								del = true;
							}
							node_ptr_p = node_ptr_p._next;
						}
					}
					if (del) {
						del_rows = del_rows.concat(tmp_rows);
						col_heads_p[i] = 'deleted';
					}
				}
				// console.log('after col deletion:');
				// console.log(col_heads_p);

				// delete rows;
				del_rows = [...new Set(del_rows)];
				for (i = 0; i < this._cols; i++) {
					if (col_heads_p[i] != null && col_heads_p[i] != 'deleted') {
						for (j = 0; j < del_rows.length; j++) {
							node_ptr_p = col_heads_p[i]._start;
							while (node_ptr_p != null) {
								if (node_ptr_p._r == del_rows[j]) {
									// delete node;
									if (node_ptr_p._prev != null) {
										node_ptr_p._prev._next = node_ptr_p._next;
									}
									if (node_ptr_p._next != null) {
										node_ptr_p._next._prev = node_ptr_p._prev;
									}
									if (col_heads_p[i]._start == node_ptr_p) {
										col_heads_p[i]._start = node_ptr_p._next;
									}
									if (col_heads_p[i]._end == node_ptr_p) {
										col_heads_p[i]._end = node_ptr_p._prev;
									}
								}
								node_ptr_p = node_ptr_p._next;
							}
						}
						if (col_heads_p[i]._start == null) {
							col_heads_p[i] = null;
						}
					}
				}

				results = this.knuth(col_heads_p, sol_p, level + 1);
				// console.log('recursion:', results);
				if (results[0]) {
					results[1] = results[1].sort();
					return results;
				}

				// console.log(row_ptr);
				row_ptr = row_ptr._next;
				// console.log(row_ptr, col_ind);
				// console.log(col_heads);

			}
		}

		return [false, null];

	}


}



module.exports = { Node, Head, Matrix };

function testDLX() {

	A = [
		[1, 0, 0, 1, 0, 0, 1], 
		[1, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 1, 0, 1],
		[0, 0, 1, 0, 1, 1, 0],
		[0, 1, 1, 0, 0, 1, 1],
		[0, 1, 0, 0, 0, 0, 1]
	];

	var matrix = new Matrix(A);
	// console.log(matrix);
	var results = matrix.solve();

	if (results[0]) {
		var rows = results[1].sort();
		var solution = [];
		for (var i = 0; i < rows.length; i++) {
			solution.push(A[rows[i]]);
		}

		console.log('solved: ');
		console.log(solution);
	}
	else {

		console.log('failed: ', results);

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



},{"./DLX.js":1}]},{},[2]);
