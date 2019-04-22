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