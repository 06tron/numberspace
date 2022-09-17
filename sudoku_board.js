/**
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
function modulo(a, b) {
	return ((a % b) + b) % b;
}

/**
 * The verts array describes a symbol centered in the unit square.
 * @param {number} size - A nonnegative integer.
 * @param {VertexArray} verts 
 * @param {number} margin 
 * @returns {VertexArray[]}
 */
 function symbolVariants(size, verts, margin) {
	const smallStep = 1 / (size * margin + size + 1);
	verts = verts.map(v => smallStep * (v * margin + 1));
	const largeStep = smallStep * (margin + 1);
	const variants = [];
	for (let r = 0; r < size; ++r) {
		for (let c = 0; c < size; ++c) {
			const copy = [];
			for (let i = 0; i < verts.length; i += 2) {
				copy.push(verts[i] + c * largeStep);
				copy.push(verts[i + 1] + r * largeStep);
			}
			variants.push(copy);
		}
	}
	return variants;
}

/**
 * @param {number} margin 
 * @returns {VertexArray}
 */
 function getSelection(margin) {
	const step = 1 / margin;
	return vertexArrays.square.map(v => v ? (1 + step) : -step);
}

/**
 * @param {number} size 
 * @param {number} screenIndex 
 * @param {SquareSymmetry} ori 
 * @returns {number}
 */
function regionIndex(size, screenIndex, ori) {
	let row = Math.floor(screenIndex / size);
	let col = screenIndex % size;
	if (ori.negativeH) {
		col = size - 1 - col;
	}
	if (ori.negativeV) {
		row = size - 1 - row;
	}
	return ori.verticalX ? (row + col * size) : (row * size + col);
}

/**
 * @typedef SudokuController
 */

/**
 * In the regions array, indices 1 to size are cells, size+1 to 2*size are
 * glyphs, and 0 is a selection.
 * @param {number} size 
 * @param {VertexArray[]} symbols 
 * @param {number} margin 
 * @returns {SudokuController}
 */
function sudokuGame(size, symbols, margin) {
	const area = size * size;
	const cellVerts = symbolVariants(size, vertexArrays.square, margin);
	const selectVerts = symbolVariants(size, getSelection(margin), margin);
	const symbolVerts = symbols.map(s => symbolVariants(size, s, margin));
	const allCells = [[1, 0, 0, 0], [0, 4, 0, 0]];
	const regions = allCells.map(createRegion);
	regions[0].linkTo(regions[1], 0, 2);
	regions[0].linkTo(regions[1], 3, 0);
	regions[0].select(0, getOri(0));
	const walk = startWalk(regions[0].tile, getOri(0));
	const cell = [0, 0];
	const idx = () => regionIndex(size, cell[0] + cell[1] * size, walk.currOri());
	const reg = () => regions[walk.currTile().id];

	function createRegion(cells, id) {
		const features = new Array(1 + area * 2).fill(null);
		for (let i = 0; i < area; ++i) {
			features[1 + i] = {
				fillStyle: "white",
				verts: cellVerts[i]
			};
			if (cells[i] > 0) {
				features[1 + i].fillStyle = "lightsteelblue";
				features[1 + area + i] = {
					fillStyle: "black",
					verts: symbolVerts[cells[i] - 1][i]
				};
			}
		}
		const tile = createTile(features, cells.join(), id);
		return {
			tile: tile,
			linkTo: function (target, oriIndex, dirIndex) {
				tile.linkTo(target.tile, getOri(oriIndex), getDir(dirIndex));
			},
			select: function (cellIndex) {
				features[0] = {
					fillStyle: "gray",
					verts: selectVerts[cellIndex]
				};
			},
			deselect: function () {
				features[0] = null;
			},
			setSymbol: function (cellIndex, symbolIndex = -1) {
				if (cells[cellIndex] == 0) {
					if (symbolIndex == -1) {
						features[1 + area + cellIndex] = null;
					} else {
						features[1 + area + cellIndex] = {
							fillStyle: "black",
							verts: symbolVerts[symbolIndex][cellIndex]
						};
					}
				}
			}
		};
	};

	return {
		attempt: function (dirIndex) {
			reg().deselect();
			const dir = getDir(dirIndex);
			const coord = dir.isVertical ? 1 : 0;
			let success = true;
			if (cell[coord] == (dir.isNegative ? 0 : size - 1)) {
				if (success = walk.attempt(dir)) {
					cell[coord] = dir.isNegative ? size - 1 : 0;
				}
			} else {
				cell[coord] += dir.isNegative ? -1 : 1;
			}
			reg().select(idx());
			return success;
		},
		write: s => reg().setSymbol(idx(), s),
		clear: () => reg().setSymbol(idx()),
		tileWalk: () => walk
	};
}

/**
 * @param {*} verts 
 * @returns {VertexArray[]}
 */
function symbolRotations(verts) {
	const rotations = [[], [], [], []];
	for (let i = 0; i < verts.length; i += 2) {
		for (let j = 0; j < 4; ++j) {
			const x = (j & 1) ? 1 - verts[i] : verts[i];
			const y = verts[i + 1];
			if (j > 1) {
				rotations[j].push(y);
				rotations[j].push(x);
			} else {
				rotations[j].push(x);
				rotations[j].push(y);
			}
		}
	}
	return rotations;
}
