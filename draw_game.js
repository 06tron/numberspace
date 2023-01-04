const tableMargin = 50;  // make not global?
const rangeBound = 5;
const initialMenuWidth = 300;
let debugMode = 0;

/**
 * Both the x and y values are integer distances measured in the side length of
 * a single sudoku cell. Represents an element of the group...
 * @typedef SudokuLevel
 * @property {number} x - The horizontal distance from this level to the origin.
 * @property {number} y - The vertical distance from this level to the origin.
 * @property {Walk} walk - A walk object which contains...
 * @property {() => string[]} matrix - A string representation of the level
 * matrix, split into an array of three separate rows.
 */

/**
 * 
 * @param {Tile} startTile 
 * @param {number[]} displaySetup
 * @returns {SudokuLevel}
 */
function sudokuLevel(startTile, displaySetup) {
	const level = {
		x: displaySetup[2],
		y: displaySetup[3],
		walk: startWalk(startTile, getOri(0)),
		matrix: function () {
			const orient = level.walk.currOri();
			const a = orient.negativeH ? " -1" : "  1";
			const x = level.x.toString().padStart(3, ' ');
			const b = orient.negativeV ? " -1" : "  1";
			const y = level.y.toString().padStart(3, ' ');
			const rows = orient.isVertical
				? [`[[  0 ${a} ${x}]`, ` [${b}   0 ${y}]`]
				: [`[[${a}   0 ${x}]`, ` [  0 ${b} ${y}]`];
			rows.push(" [  0   0   1]]");
			return rows;
		}
	};
	return level;
}

/**
 * @typedef SudokuVertex
 * @property {number} i
 * @property {number} j
 * @property {() => string} toString
 */

/**
 * 
 * @param {number[]} displaySetup
 * @returns {SudokuVertex}
 */
function sudokuVertex(displaySetup) {
	const vertex = {
		i: 0,
		j: displaySetup[4],
		toString: () => `${vertex.i}-${vertex.j}`
	};
	return vertex;
}

/**
 * 
 * @param {string} name 
 * @param  {...any} content 
 * @returns {string}
 */
function dataPoint(name, ...content) {
	return `${name.padStart(7, ' ')}: ${content.join("\n         ")}`;
}

/**
 * 
 * @param {Point}
 * @returns {string}
 */
function pointToString({ x, y }) {
	return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
}

/**
 * 
 * @param {SudokuVertex} vertex 
 * @param {SudokuLevel} level 
 * @param {Point} mouse 
 * @returns {string}
 */
function flightData(input, vertex, level, mouse) {
	return [
		dataPoint("mouse", pointToString(mouse)),
		dataPoint("clues", level.walk.currTile()),
		dataPoint("input", input[vertex.i]),
		dataPoint("vertex", vertex),
		dataPoint("level", ...level.matrix())
	].join("\n\n");
}

function boardData(order, puzzleKey, input, length) {
	return [
		dataPoint("order", order),
		dataPoint("title", puzzleKey),
		dataPoint("regions", input.length),
		dataPoint("length", length.toFixed(4))
	].join("\n\n");
}

/**
 * An implementation of the modulo operation. Differs from the '%' operator when
 * the dividend is negative.
 * @param {number} n - An integer dividend.
 * @param {number} order - A positive integer divisor, in this case the order of
 * some puzzle's board.
 * @returns {number} An integer remainder which is at least zero and less than
 * the divisor.
 */
function modulo(n, order) {
	return (n % order + order) % order;
}

/**
 * 
 * @param {number} order 
 * @param {SudokuLevel} level 
 * @returns {number}
 */
function regionIndex(order, level) {
	let row = modulo(level.y, order);
	let col = modulo(level.x, order);
	const orient = level.walk.currOri();
	if (orient.negativeH) {
		col = order - 1 - col;
	}
	if (orient.negativeV) {
		row = order - 1 - row;
	}
	return orient.verticalX ? (row + col * order) : (row * order + col);
}

/**
 * 
 * @param {number} order 
 * @param {SudokuVertex} vertex 
 * @param {SudokuLevel} level 
 * @returns {(directIndex: number) => boolean}
 */
function startFlight(order, vertex, level) {
	return function (directIndex) {
		const direct = getDir(directIndex);
		const axis = direct.isVertical ? 'y' : 'x';
		let targetRow, stepSize;
		if (direct.isNegative) {
			targetRow = 0;
			stepSize = -1;
		} else {
			targetRow = order - 1;
			stepSize = 1;
		}
		if (modulo(level[axis], order) == targetRow) {
			if (level.walk.attempt(direct)) {
				vertex.i = level.walk.currTile().id;
			} else {
				return false;
			}
		}
		level[axis] += stepSize;
		vertex.j = regionIndex(order, level);
		return true;
	};
}

/**
 * @typedef SymbolSet
 * @property {VertexArrayPolygon[]} whiteCell
 * @property {VertexArrayPolygon[]} blueCell
 * @property {VertexArrayPolygon[]} cellBorder
 * @property {VertexArrayPolygon[][]} cellGlyph
 */

/**
 * @typedef Region
 * @property {Tile} tile
 * @property {(cellIndex: number) => void} reselect
 * @property {(cellIndex: number, glyphIndex: number) => boolean} overwrite
 */

/**
 * 
 * @param {number} area 
 * @param {SymbolSet} symbolSet 
 * @returns {(cells: number[], id: number) => Region}
 */
function createRegion(area, symbolSet) {
	return function (cells, id) {
		const polygons = new Array(1 + area * 2).fill(null);
		for (let i = 0; i < area; ++i) {
			if (cells[i] > 0) {
				polygons[i + 1] = symbolSet.blueCell[i];
				polygons[i + 1 + area] = symbolSet.cellGlyph[cells[i] - 1][i];
			} else {
				polygons[i + 1] = symbolSet.whiteCell[i];
			}
		}
		return {
			tile: createTile(polygons, cells.join(), id),
			reselect: function (cellIndex = -1) {
				polygons[0] = cellIndex < 0
					? null
					: symbolSet.cellBorder[cellIndex];
			},
			overwrite: function (cellIndex, glyphIndex) {
				if (cells[cellIndex] != 0 && !debugMode) {
					return false;
				}
				polygons[cellIndex + 1 + area] = glyphIndex < 0
					? null
					: symbolSet.cellGlyph[glyphIndex][cellIndex];
				return true;
			}
		};
	};
}

function limitsFrom(order, level, length, origin) {
	// use display width/height instead?
	// range = {
	// 	west: Math.min(rangeBound, Math.ceil(origin.x / (length * order))),
	// 	north: Math.min(rangeBound, Math.ceil(origin.y / (length * order))),
	// };
	// limits = [
	// 	range.west + tableWidth - Math.floor(level.x / order), range.west + Math.floor(level.x / order),
	// 	range.north + tableHeight - Math.floor(level.y / order), range.north + Math.floor(level.y / order)
	// ];
	return [3, 3, 3, 3];
}

function topLeftOfRegion(order, level, length, origin) {
	return {
		x: origin.x + Math.floor(level.x / order) * length * order,
		y: origin.y + Math.floor(level.y / order) * length * order
	};
}

/**
 * @typedef SudokuGame
 * @property {(target: Point) => SudokuGame} moveMouse
 * @property {(HTMLCanvasElement) => SudokuGame} recomputeLength
 * @property {(glyphIndex: number) => SudokuGame} overwriteInput
 * @property {(ctx: CanvasRenderingContext2D) => void} draw
 */

/**
 * length is length of box, so equal to the region length divided by order
 * @param {PuzzleBoard} 
 * @returns {[string, SudokuGame]}
 */
function startGame({
	order,
	puzzleKey,
	displaySetup,
	symbolSet,
	puzzleCells,
	halfEdges
}) {
	const regions = puzzleCells.map(createRegion(order * order, symbolSet));
	const input = puzzleCells.map(regionCells => regionCells.map(x => x));
	const vertex = sudokuVertex(displaySetup);
	const level = sudokuLevel(regions[vertex.i].tile, displaySetup);
	regions[vertex.i].reselect(vertex.j);
	halfEdges.forEach(function ([startId, targetId, direct, orient]) {
		const start = regions[startId].tile;
		const target = regions[targetId].tile;
		start.linkTo(target, getDir(direct), getOri(orient));
	});
	let mouse = { x: 0, y: 0 };
	let paused = true;
	let displayWidth;
	let displayHeight;
	let length;
	let origin;
	let limits;
	let pTL;
	const xBox = target => Math.floor((target.x - origin.x) / length);
	const yBox = target => Math.floor((target.y - origin.y) / length);
	const attemptStep = startFlight(order, vertex, level);
	return [puzzleKey, {
		overwriteInput: function (glyphIndex = -1) {
			if (regions[vertex.i].overwrite(vertex.j, glyphIndex)) {
				input[vertex.i][vertex.j] = glyphIndex + 1;
			}
			return this;
		},
		getInput: () => JSON.stringify(input),
		resetState: function () { // call this on load?
			regions[vertex.i].reselect();
			vertex.i = 0;
			vertex.j = displaySetup[4];
			regions[vertex.i].reselect(vertex.j);
			level.x = displaySetup[2];
			level.y = displaySetup[3];
			level.walk.from(regions[vertex.i].tile, getOri(0));
			paused = true;
			limits = limitsFrom();
			pTL = topLeftOfRegion(order, level, length, origin);
			return this;
		},
		moveMouse: function (target) {
			if (paused) {
				paused = xBox(target) != level.x || yBox(target) != level.y;
				mouse = target;
				return this;
			}
			const steps = {
				x: xBox(target) - xBox(mouse),
				y: yBox(target) - yBox(mouse)
			};
			if (steps.x == 0 && steps.y == 0) {
				mouse = target;
				return this;
			}
			regions[vertex.i].reselect();
			let wallsHit;
			do {
				wallsHit = 2;
				if (steps.x > 0) {
					if (attemptStep(0)) {
						--steps.x;
						--wallsHit;
					}
				} else if (steps.x < 0) {
					if (attemptStep(1)) {
						++steps.x;
						--wallsHit;
					}
				}
				if (steps.y > 0) {
					if (attemptStep(2)) {
						--steps.y;
						--wallsHit;
					}
				} else if (steps.y < 0) {
					if (attemptStep(3)) {
						++steps.y;
						--wallsHit;
					}
				}
				if (wallsHit == 2) {
					paused = true;
					break;
				}
			} while (steps.x != 0 || steps.y != 0);
			regions[vertex.i].reselect(vertex.j);
			mouse = target;
			limits = limitsFrom();
			pTL = topLeftOfRegion(order, level, length, origin);
			return this;
		},
		togglePaused: function () {
			paused = !paused;
			return this;
		},
		recomputeLength: function ({ width, height }) {
			paused = true;
			displayWidth = width;
			displayHeight = height;
			let [tableWidth, tableHeight] = displaySetup;
			const horizontalFit = (width - tableMargin * 2) / tableWidth;
			const verticalFit = (height - tableMargin * 2) / tableHeight;
			length = Math.min(horizontalFit, verticalFit) / order;
			origin = {
				x: (width - tableWidth * length * order) / 2,
				y: (height - tableHeight * length * order) / 2
			};
			limits = limitsFrom();
			pTL = topLeftOfRegion(order, level, length, origin);
			if (debugMode) {
				const p = document.getElementById("board");
				p.innerText = boardData(order, puzzleKey, input, length);
			}
			return this;
		},
		draw: function (ctx) {
			ctx.clearRect(0, 0, displayWidth, displayHeight);
			if (paused) {
				mouse = {
					x: origin.x + (level.x + 0.5) * length,
					y: origin.y + (level.y + 0.5) * length
				};
			}
			tileTree(level.walk, pTL, mouse, length * order, limits, ctx);
			if (debugMode) {
				const p = document.getElementById("flight");
				p.innerText = flightData(input, vertex, level, mouse);
			}
		}
	}];
}

function onMouseMove({ clientX, clientY }, menuWidth, game, ctx) {
	const target = {
		x: clientX - menuWidth,
		y: clientY
	};
	game.moveMouse(target).draw(ctx);
}

function onResize(menuWidth, game, canvas, ctx) {
	canvas.width = window.innerWidth - menuWidth;
	canvas.height = window.innerHeight;
	game.recomputeLength(canvas).draw(ctx);
}

function debugKeys(key, game, ctx) {
	switch (key) {
		case 'p':
			game.togglePaused().draw(ctx);
			break;
		case 'o':
			console.log(game.getInput());
	}
}

function onKeyDown({ key, repeat }, game, ctx) {
	if (repeat) {
		return;
	}
	switch (key) {
		case "Backspace":
		case "Delete":
			game.overwriteInput().draw(ctx);
			return;
		case "Escape":
			game.resetState().draw(ctx);
			return;
		case "F3":
			debugMode = !debugMode;
			document.getElementById("board").innerText = "";
			document.getElementById("flight").innerText = "";
		case ' ':
			return;
	}
	if (isFinite(key)) {
		game.overwriteInput(parseInt(key) - 1).draw(ctx);
	} else if (debugMode) {
		debugKeys(key, game, ctx);
	}
}

function onClick({ target }, games, puzzleKey, canvas, ctx) {
	if (target.className == "thumb") {
		puzzleKey = target.id;
		games[puzzleKey].recomputeLength(canvas).draw(ctx);
	}
	return puzzleKey;
}

/**
 * 
 * @param {PuzzleBoard} 
 */
function insertThumb({ puzzleKey, altText, isHidden }) {
	if (isHidden) {
		return;
	}
	const img = document.createElement("img");
	img.id = puzzleKey;
	img.className = "thumb";
	img.src = `graphics/${puzzleKey}.png`;
	img.alt = altText;
	document.getElementById("puzzles").appendChild(img);
}

function getEventHandler(canvas, menuWidth) {
	const ctx = canvas.getContext("2d");
	const games = Object.fromEntries(puzzleBoards.map(startGame));
	let gameKey = puzzleBoards[0].puzzleKey;
	return function (event) {
		switch (event.type) {
			case "mousemove":
				onMouseMove(event, menuWidth, games[gameKey], ctx);
				break; // limit number of times per second this runs?
			case "ns_menu_resize":
				menuWidth = event.detail;
			case "resize":
				onResize(menuWidth, games[gameKey], canvas, ctx);
				break;
			case "keydown":
				onKeyDown(event, games[gameKey], ctx);
				break;
			case "click":
				gameKey = onClick(event, games, gameKey, canvas, ctx);
		}
	};
}

window.onload = function () {
	puzzleBoards.forEach(insertThumb);
	const canvas = document.getElementById("canvas");
	const eventHandler = getEventHandler(canvas, initialMenuWidth);
	canvas.addEventListener("mousemove", eventHandler);
	window.addEventListener("resize", eventHandler);
	window.addEventListener("keydown", eventHandler);
	window.addEventListener("click", eventHandler);
	eventHandler({ type: "resize" });
}
