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