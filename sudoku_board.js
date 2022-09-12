function gridWalk(block) {
	const walk = startWalk(block.tile, getOri(0));
	const cell = { x: 0, y: 0 };
	const n = 2; // TODO: make this a parameter somewhere
	return {
		attempt: function (di) {
			const d = getDir(di);
			let value = true;
			if (d.isVertical) {
				if (d.isNegative) {
					if (cell.y == 0) {
						cell.y = n - 1;
						value = walk.attempt(d);
						// move up
					} else {
						--cell.y;
					}
				} else {
					if (cell.y == n - 1) {
						cell.y = 0;
						value = walk.attempt(d);
						// move down
					} else {
						++cell.y;
					}
				}
			} else {
				if (d.isNegative) {
					if (cell.x == 0) {
						cell.x = n - 1;
						value = walk.attempt(d);
						// move left
					} else {
						--cell.x;
					}
				} else {
					if (cell.x == n - 1) {
						cell.x = 0;
						value = walk.attempt(d);
						// move right
					} else {
						++cell.x;
					}
				}
			}
			walk.currTile().getParent().select(cell.x + 2 * cell.y);
			return value;
		},
		tileWalk: () => walk
	}
}

function sudokuBlock(grid) {
	const keys = [];
	const values = [];
	for (let i = 0; i < grid.length; ++i) {
		keys.push(i);
		const cellColor = (grid[i] > 0) ? "lightsteelblue" : "white";
		values.push(cellPolygon(vertexArrays.cell, i, cellColor));
		if (grid[i] > 0) {
			keys.push(i + grid.length);
			values.push(getGlyph(grid[i] - 1, i));
		}
	}
	const tile = createTile(values, grid.join());
	const block = {
		tile: tile,
		linkTo: function (target, oi, di) {
			tile.linkTo(target.tile, getOri(oi), getDir(di));
		},
		select: function (idx) {
			keys.unshift(grid.length * 2);
			values.unshift(cellPolygon(vertexArrays.selection, idx, "#505050"));
		},
		deselect: function () {
			const rem = keys.indexOf(grid.length * 2);
			if (rem > -1) {
				keys.splice(rem, 1);
				values.splice(rem, 1);
			}
		}
	};
	tile.setParent(block);
	return block;
}

function cellPolygon(vertices, b, color) {
	const v = [...vertices];
	for (let i = 0; i < v.length; i += 2) {
		if (b % 2 > 0) {
			v[i] += 0.48;
		}
		if (b > 1) {
			v[i + 1] += 0.48;
		}
	}
	return { fillStyle: color, verts: v };
}

function getGlyph(b1, b2) {
	const glyph = [...vertexArrays.uGlyph];
	for (let i = 0; i < glyph.length; i += 2) {
		const flip = b1 % 2 > 0;
		if (flip) {
			temp = glyph[i];
			glyph[i] = glyph[i + 1];
			glyph[i + 1] = temp;
		}
		if (b1 > 1) {
			const j = flip ? i : i + 1;
			glyph[j] = 0.52 - glyph[j];
		}
		if (b2 % 2 > 0) {
			glyph[i] += 0.48;
		}
		if (b2 > 1) {
			glyph[i + 1] += 0.48;
		}
	}
	return { fillStyle: "black", verts: glyph };
}
