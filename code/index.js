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