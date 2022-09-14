/**
 * @typedef SudokuRegion
 * @property {Tile} tile
 */

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
			const c1 = quadrant ^ (ori.negativeH + ori.negativeV * 2);
			const c2 = ori.verticalX ? (c1 == 1 ? 2 : (c1 == 2 ? 1 : c1)) : c1;
			keys.unshift(cells.length * 2);
			values.unshift(polygonS2("select", "#505050", c2));
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
			let temp = verts[i];
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
