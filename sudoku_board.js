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

// sudoku region: keys [0, size-1] are cells, keys [size, 2*size-1] are glyphs, and key 2*size is selection.

/**
 * @typedef SudokuRegion
 * @property {Tile} tile
 */

// verts describes the symbol centered in the unit square
function symbolVariants(size, verts, cellSize) {
	const smallStep = 1 / (size * cellSize + size + 1);
	verts = verts.map(x => smallStep * (x * cellSize + 1));
	const largeStep = smallStep * (cellSize + 1);
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

function createRegion(size, cells, symbols) {
	const area = size * size;
	const features = new Array(1 + area * 2).fill(null);
	for (let i = 0; i < area; ++i) {
		features[1 + i] = polygonS2; // white cell, calculate verts based on region size
		if (cells[i] > 0) {
			features[1 + i].fillStyle = "lightsteelblue";
			features[1 + area + i] = polygonS2(symbols[cells[i]]); // cells[i] is the index of the symbol to be drawn here
		}
	}
	const tile = createTile(features, cells.join());
	const region = {
		tile: tile,
		linkTo: function (target, oriIndex, dirIndex) {
			tile.linkTo(target.tile, getOri(oriIndex), getDir(dirIndex));
		}
	};
	tile.setParent(region);
	return region;
}

/**
 * @typedef SudokuWalk
 * @property {() => Walk} tileWalk
 */

/**
 * Begin by selecting the top left of the starting region.
 * @param {SudokuRegion} region 
 * @param {SquareSymmetry} ori 
 * @returns {SudokuWalk}
 */
function walkS2(region, ori) {
	region.select(0, ori);
	const walk = startWalk(region.tile, ori);
	const cell = [0, 0];
	return {
		/**
		 * 
		 * @param {number} dirIndex 
		 * @returns {boolean}
		 */
		attempt: function (dirIndex) {
			const dir = getDir(dirIndex);
			walk.currTile().getParent().deselect();
			const coord = dir.isVertical ? 1 : 0;
			let success = true;
			if (cell[coord] != dir.isNegative) {
				if (success = walk.attempt(dir)) {
					cell[coord] = dir.isNegative;
				}
			} else {
				cell[coord] += dir.isNegative ? -1 : 1;
			}
			const quadrant = cell[0] + cell[1] * 2;
			walk.currTile().getParent().select(quadrant, walk.currOri());
			return success;
		},
		write: function (facing) {
			const quadrant = cell[0] + cell[1] * 2;
			walk.currTile().getParent().setGlyph(quadrant, facing);
		},
		clear: function () {
			const quadrant = cell[0] + cell[1] * 2;
			walk.currTile().getParent().setGlyph(quadrant);
		},
		tileWalk: () => walk
	}
}

/**
 * 2 bits of information. In this case, used for..
 * @typedef {number} Crumb
 */

/**
 * 
 * @param {number[]} cells 
 * @returns {SudokuRegion}
 */
function regionS2(cells) {
	const keys = [];
	const values = [];
	for (let i = 0; i < cells.length; ++i) {
		const cellColor = (cells[i] > 0) ? "lightsteelblue" : "white";
		keys.push(i);
		values.push(polygonS2("cell", cellColor, i));
		if (cells[i] > 0) {
			keys.push(i + cells.length);
			values.push(polygonS2("glyph", "black", i, cells[i] - 1));
		}
	}
	const tile = createTile(values, cells.join());
	const region = {
		tile: tile,
		/**
		 * 
		 * @param {SudokuRegion} target 
		 * @param {number} oriIndex 
		 * @param {number} dirIndex 
		 */
		linkTo: function (target, oriIndex, dirIndex) {
			tile.linkTo(target.tile, getOri(oriIndex), getDir(dirIndex));
		},
		/**
		 * 
		 * @param {Crumb} quadrant 
		 * @param {SquareSymmetry} ori 
		 */
		select: function (quadrant, ori) {
			const c = regionIndex(2, quadrant, ori);
			keys.unshift(cells.length * 2);
			values.unshift(polygonS2("select", "#505050", c));
		},
		/**
		 * Deselection comment
		 */
		deselect: function () {
			const rem = keys.indexOf(cells.length * 2);
			if (rem > -1) {
				keys.splice(rem, 1);
				values.splice(rem, 1);
			}
		},
		setGlyph: function (quadrant, facing = null) {
			const prev = keys.indexOf(quadrant + cells.length);
			if (facing == null) {
				if (prev > -1) {
					const base = keys.indexOf(quadrant);
					if (base > -1 && values[base].fillStyle == "white") {
						keys.splice(prev, 1);
						values.splice(prev, 1);
					}
				}
				return;
			}
			const next = polygonS2("glyph", "black", quadrant, facing);
			if (prev > -1) {
				values[prev] = next;
			} else {
				keys.push(quadrant + cells.length);
				values.push(next);
			}
		}
	};
	tile.setParent(region);
	return region;
}

/**
 * 
 * @param {string} name 
 * @param {string | CanvasGradient | CanvasPattern} fillStyle 
 * @param {Crumb} quadrant 
 * @param {Crumb} [facing] 
 * @returns {VertexArrayPolygon}
 */
function polygonS2(name, fillStyle, quadrant, facing = 0) {
	const verts = [...vertexArrays.S2[name]];
	for (let i = 0; i < verts.length; i += 2) {
		const swap = facing & 1;
		if (swap) {
			const temp = verts[i];
			verts[i] = verts[i + 1];
			verts[i + 1] = temp;
		}
		if (facing > 1) {
			const j = swap ? i : i + 1;
			verts[j] = 0.52 - verts[j];
		}
		if (quadrant & 1) {
			verts[i] += 0.48;
		}
		if (quadrant > 1) {
			verts[i + 1] += 0.48;
		}
	}
	return { fillStyle: fillStyle, verts: verts };
}
