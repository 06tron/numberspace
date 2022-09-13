function walkS2(block, ori) {
	block.select(0, ori); // TODO: always select the right cell
	const walk = startWalk(block.tile, ori);
	const cell = [0, 0];
	return {
		attempt: function (dirIndex) {
			const dir = getDir(dirIndex);
			walk.currTile().getParent().deselect();
			const i = dir.isVertical ? 1 : 0;
			let success = true;
			if (cell[i] != dir.isNegative) {
				if (success = walk.attempt(dir)) {
					cell[i] = dir.isNegative;
				}
			} else {
				cell[i] += dir.isNegative ? -1 : 1;
			}
			const quad = cell[0] + cell[1] * 2;
			walk.currTile().getParent().select(quad, walk.currOri());
			return success;
		},
		tileWalk: () => walk
	}
}

function regionS2(cells) {
	const keys = [];
	const values = [];
	for (let i = 0; i < cells.length; ++i) {
		keys.push(i);
		const cellColor = (cells[i] > 0) ? "lightsteelblue" : "white";
		values.push(polygonS2("cell", cellColor, i));
		if (cells[i] > 0) {
			keys.push(i + cells.length);
			values.push(polygonS2("glyph", "black", i, cells[i] - 1));
		}
	}
	const tile = createTile(values, cells.join());
	const block = {
		tile: tile,
		linkTo: function (target, oi, di) {
			tile.linkTo(target.tile, getOri(oi), getDir(di));
		},
		select: function (quad, ori) {
			const idx = quad ^ (ori.index() % 4); // TODO: fix this
			keys.unshift(cells.length * 2);
			values.unshift(polygonS2("select", "#505050", idx));
		},
		deselect: function () {
			const rem = keys.indexOf(cells.length * 2);
			if (rem > -1) {
				keys.splice(rem, 1);
				values.splice(rem, 1);
			}
		}
	};
	tile.setParent(block);
	return block;
}

function polygonS2(name, fillStyle, quad, facing = 0) {
	const verts = [...vertexArrays.S2[name]];
	for (let i = 0; i < verts.length; i += 2) {
		const flip = facing % 2 > 0;
		if (flip) {
			let temp = verts[i];
			verts[i] = verts[i + 1];
			verts[i + 1] = temp;
		}
		if (facing > 1) {
			const j = flip ? i : i + 1;
			verts[j] = 0.52 - verts[j];
		}
		if (quad % 2 > 0) {
			verts[i] += 0.48;
		}
		if (quad > 1) {
			verts[i + 1] += 0.48;
		}
	}
	return { fillStyle: fillStyle, verts: verts };
}
