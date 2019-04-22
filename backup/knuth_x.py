import pprint

from pandas import *

def knuth_x(matrix, A, solution):
	# A(row, col)
	# termintate successfully
	# print(A)
	if A == [] or len(A[0]) == 0:
		return True, solution

	col_sums = []
	for j in range(len(A[0])):
		col = [A[i][j] for i in range(len(A))]
		col_sums.append(sum(col))

	c_ind = col_sums.index(min(col_sums))
	c = [A[i][c_ind] for i in range(len(A))]

	for r_ind in range(len(c)):
		if c[r_ind] == 1:
			del_rows = []
			del_cols = []
			A_p = [[A[i][j] for j in range(len(A[0]))] for i in range(len(A))]
			matrix_p = [[matrix[i][j] for j in range(len(matrix[0]))] for i in range(len(matrix))]

			r = A[r_ind].copy()
			r_sol = matrix[r_ind].copy()
			if solution == []:
				solution_p = [r_sol]
			else:
				# print(solution)
				solution_p = [[solution[i][j] for j in range(len(solution[0]))] for i in range(len(solution))]
				solution_p.append(r_sol)

			for j in range(len(r)):
				if r[j] == 1:
					for i in range(len(c)):
						if A_p[i][j] == 1 and not i in del_rows:
							del_rows.append(i)

					del_cols.append(j)

			# print(del_rows)
			# print(del_cols)

			del_count = 0
			for del_col in del_cols:
				# print('delete col: ', del_col)
				for i in range(len(c)):
					# print(A_p, i, del_col)
					del A_p[i][del_col - del_count]
				del_count += 1
			# print(A_p)
			del_count = 0
			for del_row in del_rows:
				# print('delete row: ', del_row)
				del A_p[del_row - del_count]
				del matrix_p[del_row - del_count]
				del_count += 1

			

			valid, solution_p = knuth_x(matrix_p, A_p, solution_p)
			# print(valid, solution_p)
			if valid:
				return True, solution_p

	return False, None


if __name__ == '__main__':

	A = [
		[1, 0, 0, 1, 0, 0, 1], 
		[1, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 1, 0, 1],
		[0, 0, 1, 0, 1, 1, 0],
		[0, 1, 1, 0, 0, 1, 1],
		[0, 1, 0, 0, 0, 0, 1]
	]

	valid, solution = knuth_x(A, A, [])
	# printer = pprint.PrettyPrinter(indent=4)
	# printer.pprint(solution)
	print(DataFrame(solution))
