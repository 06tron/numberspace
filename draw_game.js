const tableMargin = 80;  // make not global?
const rangeBound = 5;
const menuWidth = 300;

function modulo(n, order) {
	return (n % order + order) % order;
}

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

function startFlight(order, vertex, level) {
	return function attemptStep(directIndex) {
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
		vertex.j = regionIndex(order, level);
		level[axis] += stepSize;
		return true;
	};
}

function createRegion(numCells, symbolSet) {
	return function (cells, id) {
		const polygons = new Array(1 + numCells * 2).fill(null);
		for (let i = 0; i < numCells; ++i) {
			polygons[i + 1] = {
				fillStyle: "white",
				verts: symbolSet.cell[i] // avoid making so many objects?
			};
			if (cells[i] > 0) {
				polygons[i + 1].fillStyle = "lightsteelblue";
				polygons[i + 1 + numCells] = {
					fillStyle: "black",
					verts: symbolSet.glyph[cells[i] - 1][i]
				};
			}
		}
		return {
			tile: createTile(polygons, cells.join(), id),
			reselect: function (cellIndex = -1) {
				polygons[0] = cellIndex < 0 ? null : {
					fillStyle: "darkgrey",
					verts: symbolSet.selection[cellIndex]
				};
			},
			overwrite: function (cellIndex, glyphIndex) {
				if (cells[cellIndex] != 0) {
					return false;
				}
				polygons[cellIndex + 1 + numCells] = glyphIndex < 0 ? null : {
					fillStyle: "black",
					verts: symbolSet.glyph[glyphIndex][cellIndex]
				};
				return true;
			}
		};
	};
}

function startGame({
	order,
	puzzleKey,
	tableWidth,
	tableHeight,
	symbolSet,
	puzzleCells,
	halfEdges
}) {
	const regions = puzzleCells.map(createRegion(order * order, symbolSet));
	halfEdges.forEach(function ([startId, targetId, dirIndex, oriIndex]) {
		const start = regions[startId].tile;
		const target = regions[targetId].tile;
		start.linkTo(target, getDir(dirIndex), getOri(oriIndex));
	});
	const vertex = { i: 0, j: 0 }; // i is regionIndex, j is cellIndex
	regions[vertex.i].reselect(vertex.j);
	const level = {
		x: 0, y: 0, // x and y are coordinates of mouseBox
		walk: startWalk(regions[vertex.i].tile, getOri(0))
	};
	let mouse = { x: 0, y: 0 };
	let paused = true;
	const input = puzzleCells.map(region => region.map(x => x));
	let length; // length of box, so regionLength / order
	// let range;
	let origin;
	let pTL;
	let displayWidth;
	let displayHeight;
	// things that change:
	// sizing (length, range, origin, height, width)
	// state (level, vertex, paused, mouse)
	// sizing and state (regionTL, limits)
	let limits = [5, 5, 5, 5];
	const xBox = target => Math.floor((target.x - origin.x) / length);
	const yBox = target => Math.floor((target.y - origin.y) / length);
	const attemptStep = startFlight(order, vertex, level);
	return [puzzleKey, {
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
			do {
				if (steps.x > 0) {
					if (!attemptStep(0)) {
						paused = true;
						break;
					}
					--steps.x;
				} else if (steps.x < 0) {
					if (!attemptStep(1)) {
						paused = true;
						break;
					}
					++steps.x;
				}
				if (steps.y > 0) {
					if (!attemptStep(2)) {
						paused = true;
						break;
					}
					--steps.y;
				} else if (steps.y < 0) {
					if (!attemptStep(3)) {
						paused = true;
						break;
					}
					++steps.y;
				}
			} while (steps.x != 0 && steps.y != 0);
			regions[vertex.i].reselect(vertex.j);
			pTL = {
				x: origin.x + Math.floor(level.x / order) * length * order,
				y: origin.y + Math.floor(level.y / order) * length * order
			};
			// limits = [
			// 	range.west + tableWidth - Math.floor(level.x / order), range.west + Math.floor(level.x / order),
			// 	range.north + tableHeight - Math.floor(level.y / order), range.north + Math.floor(level.y / order)
			// ];
			mouse = target;
			return this;
		},
		recomputeLength: function ({ width, height }) {
			displayWidth = width;
			displayHeight = height;
			paused = true;
			const horizontalFit = (width - tableMargin * 2) / tableWidth;
			const verticalFit = (height - tableMargin * 2) / tableHeight;
			length = Math.min(horizontalFit, verticalFit) / order;
			origin = {
				x: (width - tableWidth * length * order) / 2,
				y: (height - tableHeight * length * order) / 2
			};
			pTL = {
				x: origin.x + Math.floor(level.x / order) * length * order,
				y: origin.y + Math.floor(level.y / order) * length * order
			};
			// range = {
			// 	west: Math.min(rangeBound, Math.ceil(origin.x / (length * order))),
			// 	north: Math.min(rangeBound, Math.ceil(origin.y / (length * order))),
			// };
			return this;
		},
		overwriteInput: function (glyphIndex = -1) {
			if (regions[vertex.i].overwrite(vertex.j, glyphIndex)) {
				input[vertex.i][vertex.j] = glyphIndex + 1;
			}
			return this;
		},
		draw: function (ctx) {
			ctx.clearRect(0, 0, displayWidth, displayHeight);
			if (paused) {
				mouse = {
					x: origin.x + level.x * length,
					y: origin.y + level.y * length
				};
			}
			tileTree(level.walk, pTL, mouse, length * order, limits, ctx);
			if (debugMode) {
				const p = document.getElementById("debug");
				p.innerText = flightData(vertex, level);
			}
		}
	}];
}

function flightData(vertex, level) { // when should this be updated?
	const orient = level.walk.currOri();
	const a = orient.negativeH ? " -1" : "  1";
	const x = level.x.toString().padStart(4, ' ');
	const b = orient.negativeV ? " -1" : "  1";
	const y = level.y.toString().padStart(4, ' ');
	return `vertex: (${vertex.i}, ${vertex.j})\n\n level: ` + (orient.isVertical
		? `[[  0 ${a}${x}]\n         [${b}   0${y}]\n         [  0   0   1]]`
		: `[[${a}   0${x}]\n         [  0 ${b}${y}]\n         [  0   0   1]]`);
}

function insertThumb({ puzzleKey }) {
	const img = document.createElement("img");
	img.className = "thumb";
	img.src = "graphics/" + puzzleKey + ".png";
	img.alt = puzzleKey;
	document.getElementById("puzzles").appendChild(img);
}

function eventHandlers(canvas) {
	let puzzleKey = puzzleBoards[0].puzzleKey;
	const games = Object.fromEntries(puzzleBoards.map(startGame));
	const ctx = canvas.getContext("2d");
	return {
		onMouseMove: function (event) {
			const target = {
				x: event.clientX - menuWidth,
				y: event.clientY
			};
			games[puzzleKey].moveMouse(target).draw(ctx);
		},
		onClick: function (event) {
			if (event.target.className != "thumb")  {
				return;
			}
			puzzleKey = event.target.alt;
			games[puzzleKey].recomputeLength(canvas).draw(ctx);
		},
		onKeyDown: function (event) {
			if (event.key == "Backspace" || event.key == "Delete") {
				games[puzzleKey].overwriteInput().draw(ctx);
			} else if (isFinite(event.key) && event.key != ' ') {
				games[puzzleKey].overwriteInput(parseInt(event.key) - 1).draw(ctx);
			} else {
				debugMode ^= event.key == "F3";
			}
		},
		onResize: function () {
			canvas.width = window.innerWidth - menuWidth;
			canvas.height = window.innerHeight;
			games[puzzleKey].recomputeLength(canvas).draw(ctx);
		}
	};
}

window.onload = function () {
	puzzleBoards.forEach(insertThumb);
	const canvas = document.getElementById("canvas");
	const ns = eventHandlers(canvas);
	canvas.addEventListener("mousemove", ns.onMouseMove);
	window.addEventListener("click", ns.onClick);
	window.addEventListener("keydown", ns.onKeyDown);
	window.addEventListener("resize", ns.onResize);
	ns.onResize(); // ^ something other than window?
}
