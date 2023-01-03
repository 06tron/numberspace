let debugMode = 0;

window.onload = function () {

	const canvas = document.getElementById("canvas");
	
	const mouse = { x: 0, y: 0 };

	canvas.onmousemove = function (event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	canvas.width = innerWidth;
	canvas.height = innerHeight;
	// resized window?

	window.addEventListener("keydown", function (event) {
		debugMode ^= event.key == "F3";
		game.keyUpdate(event);
	});

	const fpsTimes = [];

	(function animate() {
		game.drawScene();
		if (debugMode) {
			const now = performance.now();
			while (fpsTimes.length > 0 && fpsTimes[0] <= now - 1000) {
				fpsTimes.shift();
			}
			fpsTimes.push(now);
			game.drawInfo(fpsTimes.length);
		}
		requestAnimationFrame(animate);
	})();

}

/**
 * The verts array describes a symbol centered in the unit square.
 * @param {number} size - A nonnegative integer.
 * @param {VertexArray} verts 
 * @param {number} margin
 * @returns {VertexArray[]}
 */
 function cellSymbols(size, verts, margin) {
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
 * symbols, and 0 is a selection.
 * @param {number} size 
 * @param {VertexArray[]} symbols 
 * @param {number} margin 
 * @returns {SudokuController}
 */
function sudokuGame(size, symbols, margin, puzzle) {
	const area = size * size;
	const cellVerts = cellSymbols(size, vertexArrays.square, margin);
	const selectVerts = cellSymbols(size, getSelection(margin), margin);
	const symbolVerts = symbols.map(s => cellSymbols(size, s, margin));
	const regions = puzzle.cells.map(createRegion);
	puzzle.links.forEach(q => regions[q[0]].linkTo(regions[q[1]], q[2], q[3]));
	// replace linkTo with a link function that takes 4 indices?
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
					verts: symbolVerts[cells[i]][i]
				};
			}
		}
		const tile = createTile(features, cells.join(), id);
		return {
			tile: tile,
			linkTo: function (target, dirIndex, oriIndex) {
				tile.linkTo(target.tile, getDir(dirIndex), getOri(oriIndex));
			},
			select: function (cellIndex) {
				features[0] = {
					fillStyle: "darkgrey",
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
 * generalize for different symmetries
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

function interactiveGame(board, canvas) {
	

	return {
		mouseUpdate: function (event) {
			mouse.x = event.clientX;
			mouse.y = event.clientY;
		},
		keyUpdate: e => 0,
		// canvasUpdate?
		drawScene: () => 0,
		drawInfo: fps => 0
	}
}

function controller() {

	const len = 200; // canvas and board
	const size = 3; // board
	const margin = 15; // board
	const step = len / (size * margin + size + 1);
	const symbols = vertexArrays.quantico; // board
	let game = sudokuGame(size, symbols, margin, puzzleMeshes.S3[0]);
	const sx = canvas.width / 2 - len;
	const sy = canvas.height / 2 - len;
	const lx = Math.ceil(sx / len);
	const ly = Math.ceil(sy / len);
	let cx = 0;
	let cy = 0;
	let onTile = false;

	function cellSteps(n) {
		return step * (1 + Math.floor(n / size) + n * (margin + 1));
	}

	function fillCell(x, y, color) {
		context.fillStyle = color;
		const s = step * margin;
		context.fillRect(sx + cellSteps(x), sy + cellSteps(y), s, s);
	}

	function drawScene() {
		const dx = Math.floor(size * (mouse.x - sx) / len) - cx;
		const dy = Math.floor(size * (mouse.y - sy) / len) - cy;
		if (onTile) {
			if (dx != 0) {
				if (game.attempt(dx > 0 ? 0 : 1)) {
					cx += Math.sign(dx);
				} else {
					onTile = false;
				}
			} else if (dy != 0) {
				if (game.attempt(dy > 0 ? 2 : 3)) {
					cy += Math.sign(dy);
				} else {
					onTile = false;
				}
			}
		} else if (dx == 0 && dy == 0) {
			onTile = true;
		}
		const pTL = {
			x: sx + Math.floor(cx / size) * len,
			y: sy + Math.floor(cy / size) * len
		};
		// const limits = [lx + 1 - cx, lx + cx, ly + 1 - cy, ly + cy];
		const limits = [5,5,5,5];
		if (onTile) {
			tileTree(game.tileWalk(), pTL, mouse, len, limits, context);
		} else {
			const mid = {
				x: sx + cellSteps(cx) + step * margin / 2,
				y: sy + cellSteps(cy) + step * margin / 2
			};
			tileTree(game.tileWalk(), pTL, mid, len, limits, context);
			fillCell(cx, cy, "rgba(255, 0, 0, 0.4)");
		}
	}

	canvas.onclick = function (event) {
		// cycle through symbols?
	};

	window.addEventListener("keydown", function (event) {
		switch (event.key) {
			case 'z': debugMode = !debugMode; break;
			case "Backspace":
			case "Delete": game.clear(); break;
			case 'a': game.write(0); break;
			case 's': game.write(1); break;
			case 'd': game.write(2); break;
			case 'f': game.write(3); break;
			case '1':
				game = sudokuGame(size, symbols, margin, puzzleMeshes.one);
				cx = 0;
				cy = 0; // reset function?
				onTile = false;
				break;
		}
	});

	

	function drawInfo() {
		const str = "(" + cx + ", " + cy + ") fps: " + fps;
		context.fillStyle = "white";
		context.fillText(str, canvas.width - 100, 20);
	}

	const times = [];
	let fps;

	(function animate() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawScene();
		if (debugMode) {
			const now = performance.now();
			while (times.length > 0 && times[0] <= now - 1000) {
				times.shift();
			}
			times.push(now);
			fps = times.length;
			drawInfo();
		}
		requestAnimationFrame(animate);
	})();

}
