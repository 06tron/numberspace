const drawBound = 6;
let debugMode = false;

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
 * The level property which can be represented as a matrix.
 * @param {Tile} startTile - Needed for the internal walk object.
 * @param {number[]} displaySetup - Contains information about the initial state
 * of this level.
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
 * @property {number} i - The region/block index.
 * @property {number} j - The cell index within a block.
 * @property {() => string} toString
 */

/**
 * TODO: Make display object that stores displaySetup and maybe does the sudoku
 * vertex and level constructors.
 * @param {number[]} displaySetup - States the initial cell index.
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
 * @param {string} name - A title for this data point.
 * @param  {...any} content - The data to be converted to a string. Each
 * argument will be placed on a new line.
 * @returns {string}
 */
function dataPoint(name, ...content) {
	return `${name.padStart(6, ' ')}: ${content.join("\n        ")}`;
}

/**
 * @param {Point} - A 2D point.
 * @returns {string} - The given point rounded to two decimal points.
 */
function pointToString({ x, y }) {
	return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
}

/**
 * The parameters contain the data about the player's flight.
 * @param {number[][]} input
 * @param {SudokuVertex} vertex 
 * @param {SudokuLevel} level 
 * @param {Point} mouse 
 * @param {number} correctCells
 * @returns {string} - The data formatted to appear in the sidebar.
 */
function flightData(input, vertex, level, mouse, correctCells) {
	return [
		dataPoint("mouse", pointToString(mouse)),
		dataPoint("clues", level.walk.currTile()),
		dataPoint("input", input[vertex.i]),
		dataPoint("filled", correctCells),
		dataPoint("vertex", vertex),
		dataPoint("level", ...level.matrix())
	].join("\n\n");
}

/**
 * The parameters contain the data about the current puzzle board.
 * @param {number} order 
 * @param {string} puzzleKey 
 * @param {number[][]} input 
 * @param {number} length 
 * @returns {string} - The data formatted to appear in the sidebar.
 */
function boardData(order, puzzleKey, input, length) {
	return [
		dataPoint("order", order),
		dataPoint("title", puzzleKey),
		dataPoint("blocks", input.length),
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
 * Finds the cell index of the current vertex given the current level.
 * @param {number} order - The block/region's order.
 * @param {SudokuLevel} level - Contains the required placement information.
 * @returns {number} - The cell index of the current vertex.
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
 * A flight is a navigation of the internal graph. It's current state has two
 * components: the vertex and level. This function returns a function that
 * allows for the continuation of this flight and the navigation of the board.
 * It takes a cardinal direction and updates the flight's state to move in that
 * direction. This returned function returns true if the game state can change,
 * and false if there is no edge to follow in the given direction.
 * @param {number} order 
 * @param {SudokuVertex} vertex - The vertex mutated by this flight.
 * @param {SudokuLevel} level - The level mutated by this flight.
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
 * Contains all the polygons that make up the sudoku board.
 * @typedef SymbolSet
 * @property {VertexArrayPolygon[]} whiteCell - The white squares.
 * @property {VertexArrayPolygon[]} blueCell - The blue squares.
 * @property {VertexArrayPolygon[]} cellBorder - The coral borders. This is
 * another square that is larger than the white and blue cell squares and is
 * visible as it sits behind them.
 * @property {VertexArrayPolygon[][]} cellGlyph - The characters that can be
 * inserted by the player.
 */

/**
 * This is also called a block. This object controls an array of polygons which
 * appear inside this region/block.
 * @typedef Region
 * @property {Tile} tile - The underlying tile object.
 * @property {([cellIndex]: number) => void} reselect - Removes or changes the
 * cell border polygon. If no index is provided then no cell in this block will
 * be selected.
 * @property {
 * 	(cellIndex: number, [glyphIndex]: number) => boolean
 * } overwrite - A function to changes the glyphs present in this block. The
 * parameters are the target cell index and the index of the glyph to put there.
 * Returns true if this overwrite was successful, and false if the target cell
 * contains a clue which cannot be overwritten. If no glyph index is provided,
 * then this function attempted to clear the target cell.
 */

/**
 * @param {number} area - The number of cells in these blocks. Equal to the
 * Sudoku board's order squared.
 * @param {SymbolSet} symbolSet - The set of polygons to be used within all of
 * the created blocks.
 * @returns {(cells: number[], id: number) => Region} - A function which creates
 * a block given a unique id and an array of numbers representing the clues
 * present in the block. Intended for use as a callback to the map function.
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
			overwrite: function (cellIndex, glyphIndex = -1) {
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

/**
 * Calculates and sets the screen coordinates of a block's top left corner given
 * many variables from an instance of a Sudoku game.
 * @param {number} order 
 * @param {SudokuLevel} level 
 * @param {number} length 
 * @param {Point} origin 
 * @param {Point} pTL 
 */
function topLeftOfRegion(order, level, length, origin, pTL) {
	pTL.x = origin.x + Math.floor(level.x / order) * length * order;
	pTL.y = origin.y + Math.floor(level.y / order) * length * order;
}

/**
 * Calculates and sets the limits from the given variables. The limits control
 * how far the tile tree can extend in any cardinal direction.
 * @param {number} len 
 * @param {number} canvasWidth 
 * @param {number} canvasHeight 
 * @param {Point} pTL 
 * @param {number[]} limits 
 */
function setLimits(len, canvasWidth, canvasHeight, pTL, limits) {
	const west = pTL.x / len;
	const north = pTL.y / len;
	limits[0] = Math.min(drawBound, Math.ceil(canvasWidth / len - west) - 1);
	limits[1] = Math.min(drawBound, Math.ceil(west));
	limits[2] = Math.min(drawBound, Math.ceil(canvasHeight / len - north) - 1);
	limits[3] = Math.min(drawBound, Math.ceil(north));
}

/**
 * Contains all the configurations of a single puzzle.
 * @typedef PuzzleBoard
 * @property {number} order - The number of cells along one edge of a block.
 * @property {string} puzzleKey - The name of this puzzle.
 * @property {string} altText - A short description of this puzzle.
 * @property {boolean} isHidden - False if the puzzle should appear in a list of
 * puzzles at the top of the side bar.
 * @property {number[]} displaySetup - Describes which cell to select as the
 * starting point, where that cell should be placed on the screen, and also the
 * size of the whole puzzle on the screen.
 * @property {SymbolSet} symbolSet - The set of polygons used in this puzzle.
 * @property {number[][]} puzzleCells - An array of arrays, one for each block
 * in the puzzle. The smaller arrays have a number for each cell in the block it
 * describes. A number is nonzero if a clue should be placed at that cell. The
 * nonzero number is one greater than the glyph index of that clue.
 * @property {number[][]} halfEdges - An array of length four arrays. Each
 * smaller array represents a directed edge between the blocks of this puzzle.
 * There are two directed edges between each block in the final graph, and this
 * array contains only one of those two for each pair of connected blocks.
 * Suppose there are two blocks, A and B. If the edge A to B is described in
 * this array, then the edge B to A is not described here and can be generated
 * using the A to B edge. The label of the B to A edge is exactly the inverse of
 * the A to B edge label.
 * @property {number} emptyCells - The number of cells in this puzzle that do
 * not contain a clue. If the player has inserted a number of correct answers
 * equal to the number of empty cells, then they have solved the puzzle.
 * @property {number[][]} solution - An array containing this puzzle's solution.
 * Very similar to puzzleCells, except there are no zeros.
 */

/**
 * The object that allows the puzzle to be drawn and played. Most of the
 * functions return this Sudoku game object, to allow chaining them together.
 * @typedef SudokuGame
 * @property {(glyphIndex: number) => SudokuGame} overwriteInput - Tries to
 * insert a glyph into the current cell. Also checks to see if the player has
 * solved the puzzle. A clue can only be overwritten in debug mode.
 * @property {() => string} getInput - A string representation of all the glyphs
 * on the board. This includes the clues and player inserted glyphs.
 * @property {() => SudokuGame} resetState - Returns the player to the start of
 * the flight. Vertex and level are reset, but player input remains unchanged.
 * @property {(target: Point) => boolean} moveMouse - Updates the flight
 * according to the player's mouse movement. If the game state does not change,
 * then this function returns false. It returns true whenever the game is
 * unpaused or becomes unpaused.
 * @property {([value]: boolean) => SudokuGame} switchPaused - Sets the paused
 * variable. If no boolean value is provided, then this function toggles the
 * pause on or off.
 * @property {
 * 	(HTMLCanvasElement, barWidth: number) => SudokuGame
 * } recomputeLength - Takes the height and width of the canvas, as well as the
 * width of the side bar. The coordinate system is recalculated based on these
 * parameters. This function should be called whenever the canvas size changes.
 * @property {() => SudokuGame} draw - Requests a frame to be drawn.
 * @property {(ctx: CanvasRenderingContext2D) => void} frame - Will draw the
 * game onto the given context, unless there is no need to.
 */

/**
 * Long and not super well organized function that starts a Sudoku game from a
 * puzzle board, and returns an object that allows the game to be played.
 * @param {PuzzleBoard} 
 * @returns {[string, SudokuGame]} - A key value pair that contains the created
 * Sudoku game object and its name.
 */
function startGame({
	order,
	puzzleKey,
	displaySetup,
	symbolSet,
	puzzleCells,
	halfEdges,
	emptyCells,
	solution
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
	let correctCells = 0;
	let solved = false;
	let skipFrame = true;
	let paused = true;
	let canvasWidth;
	let canvasHeight;
	let length;
	const origin = { x: 0, y: 0 };
	const pTL = { x: 0, y: 0 };
	const limits = new Array(4);
	const xBox = target => Math.floor((target.x - origin.x) / length);
	const yBox = target => Math.floor((target.y - origin.y) / length);
	const attemptStep = startFlight(order, vertex, level);
	const p1 = document.getElementById("fps");
	const p2 = document.getElementById("board");
	const p3 = document.getElementById("flight");
	const frameTimes = [];
	return [puzzleKey, {
		overwriteInput: function (glyphIndex = -1) {
			if (regions[vertex.i].overwrite(vertex.j, glyphIndex)) {
				if (input[vertex.i][vertex.j] == solution[vertex.i][vertex.j]) {
					--correctCells;
				}
				if (glyphIndex + 1 == solution[vertex.i][vertex.j]) {
					++correctCells;
				}
				input[vertex.i][vertex.j] = glyphIndex + 1;
				solved = correctCells == emptyCells;
			}
			return this;
		},
		getInput: () => JSON.stringify(input),
		resetState: function () {
			regions[vertex.i].reselect();
			vertex.i = 0;
			vertex.j = displaySetup[4];
			regions[vertex.i].reselect(vertex.j);
			level.x = displaySetup[2];
			level.y = displaySetup[3];
			level.walk.from(regions[vertex.i].tile, getOri(0));
			paused = true;
			topLeftOfRegion(order, level, length, origin, pTL);
			setLimits(length * order, canvasWidth, canvasHeight, pTL, limits);
			return this;
		},
		moveMouse: function (target) {
			if (paused) {
				paused = xBox(target) != level.x || yBox(target) != level.y;
				mouse = target;
				return !paused;
			}
			const steps = {
				x: xBox(target) - xBox(mouse),
				y: yBox(target) - yBox(mouse)
			};
			if (steps.x == 0 && steps.y == 0) {
				mouse = target;
				return true;
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
			topLeftOfRegion(order, level, length, origin, pTL);
			setLimits(length * order, canvasWidth, canvasHeight, pTL, limits);
			return true;
		},
		switchPaused: function (value = null) {
			paused = (value == null) ? !paused : value;
			return this;
		},
		recomputeLength: function ({ width, height }, barWidth) {
			paused = true;
			canvasWidth = width;
			canvasHeight = height;
			let [tableWidth, tableHeight] = displaySetup;
			const horizontalFit = (width - barWidth * 0.25) / tableWidth;
			const verticalFit = (height - barWidth * 0.25) / tableHeight;
			length = Math.min(horizontalFit, verticalFit) / order;
			origin.x = (width - tableWidth * length * order) * 0.5;
			origin.y = (height - tableHeight * length * order) * 0.5;
			topLeftOfRegion(order, level, length, origin, pTL);
			setLimits(length * order, canvasWidth, canvasHeight, pTL, limits);
			if (debugMode) {
				p2.innerText = boardData(order, puzzleKey, input, length);
			}
			return this;
		},
		draw: function () {
			skipFrame = false;
			return this;
		},
		frame: function (ctx) {
			if (debugMode) {
				const now = performance.now();
				while (frameTimes.length > 0 && frameTimes[0] <= now - 1000) {
					frameTimes.shift();
				}
				p1.innerText = dataPoint("fps", frameTimes.length);
			}
			if (skipFrame) {
				return;
			}
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			if (paused) {
				mouse.x = origin.x + (level.x + 0.5) * length;
				mouse.y = origin.y + (level.y + 0.5) * length;
				tileTree(level.walk, pTL, mouse, length * order, limits, ctx);
				ctx.fillStyle = "rgba(255, 127, 80, 0.4)"; // coral
				mouse.x -= 0.5 * length;
				mouse.y -= 0.5 * length;
				ctx.fillRect(mouse.x, mouse.y, length, length);			
			} else {
				tileTree(level.walk, pTL, mouse, length * order, limits, ctx);
			}
			if (solved) {
				ctx.strokeStyle = "coral";
				ctx.lineWidth = 20;
				ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
				ctx.strokeStyle = "black";
				ctx.lineWidth = 1;
			}
			if (debugMode) {
				frameTimes.push(performance.now());
				p3.innerText = flightData(input, vertex, level, mouse, correctCells);
			}
			skipFrame = true;
		}
	}];
}

/**
 * Calculates the canvas coordinates of the current mouse position, and requests
 * to draw the game if the motion of the mouse changed the game state.
 * @param {MouseEvent}
 * @param {number} barWidth - Width of the side bar in pixels.
 * @param {SudokuGame} game 
 */
function onMouseMove({ clientX, clientY }, barWidth, game) {
	const target = {
		x: clientX - barWidth,
		y: clientY
	};
	if (game.moveMouse(target)) {
		game.draw();
	}
}

/**
 * Resizes the canvas to fit the newly resized window, then updates the Sudoku
 * game and draws it immediately.
 * @param {number} barWidth - Width of the side bar in pixels.
 * @param {SudokuGame} game 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 */
function onResize(barWidth, game, canvas, ctx) {
	canvas.width = window.innerWidth - barWidth;
	canvas.height = window.innerHeight;
	game.recomputeLength(canvas, barWidth).draw().frame(ctx);
}

/**
 * An extension of the onKeyDown function which performs actions only available
 * in debug mode. Press 'p' to pause or unpause the Sudoku game. Press 'o' to
 * log the current input array.
 * @param {string} key - The keyboard key that has been pressed.
 * @param {SudokuGame} game 
 */
function debugKeys(key, game) {
	switch (key) {
		case 'p':
			game.switchPaused().draw();
			break;
		case 'o':
			console.log(game.getInput());
	}
}

/**
 * @param {string} id - The target HTML element's id.
 * @param {string} classes - A single string containing a list of classes to
 * assign to the target HTML element.
 */
function setClassName(id, classes) {
	document.getElementById(id).className = classes;
}

/**
 * Controls keyboard actions. A held down key will only perform an action once.
 * Press F3 to start or end debug mode.
 * @param {KeyboardEvent}
 * @param {SudokuGame} game
 */
function onKeyDown({ key, repeat }, game) {
	if (repeat) {
		return;
	}
	switch (key) {
		case "Backspace":
		case "Delete":
			game.overwriteInput().draw();
			return;
		case "Escape":
			game.resetState().draw();
			return;
		case "F3":
			debugMode = !debugMode;
			setClassName("debug", debugMode ? "info" : "hidden");
			setClassName("about", debugMode ? "hidden" : "");
		case ' ':
			return;
	}
	if (isFinite(key)) {
		game.overwriteInput(parseInt(key) - 1).draw();
	} else if (debugMode) {
		debugKeys(key, game);
	}
}

/**
 * An object to control the set of puzzles that can be played.
 * @typedef GameControl
 * @property {() => SudokuGame} current - Returns the currently selected game.
 * @property {
 * 	(MouseEvent, barWidth: number, canvas: HTMLCanvasElement) => void
 * } onMouseDown - Allows the player to switch between puzzles by clicking on an
 * unselected puzzle from the side bar.
 */

/**
 * Sets the current game to the first one in the puzzleBoards array. Also starts
 * all of the games and stores them in an object.
 * @returns {GameControl}
 */
function getGameControl() {
	let gameKey = puzzleBoards[0].puzzleKey;
	setClassName(gameKey, "selected thumb");
	const games = Object.fromEntries(puzzleBoards.map(startGame));
	return {
		current: () => games[gameKey],
		onMouseDown: function({ target }, barWidth, canvas) {
			if (target.className != "thumb") {
				return;
			}
			setClassName(gameKey, "thumb");
			target.className = "selected thumb";
			gameKey = target.id;
			games[gameKey].recomputeLength(canvas, barWidth).draw();
		}
	};
}

/**
 * @param {string} selector - The target CSS class selector.
 * @returns {CSSStyleDeclaration}
 */
function getStyleOf(selector) {
	return window.getComputedStyle(document.querySelector(selector));
}

/**
 * Returns a function which handles UI events.
 * @param {GameControl} gameControl 
 * @returns {(event: UIEvent) => void} - Determines which other function to call
 * for the given event. In case of a "mouseleave" event the current game pauses. 
 */
function getEventHandler(gameControl) {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	let barWidth = parseInt(getStyleOf(".sidebar").width);
	return function (event) {
		switch (event.type) {
			case "mousemove":
				onMouseMove(event, barWidth, gameControl.current());
				break;
			case "resize":
				onResize(barWidth, gameControl.current(), canvas, ctx);
				break;
			case "keydown":
				onKeyDown(event, gameControl.current());
				break;
			case "mouseleave":
				gameControl.current().switchPaused(true).draw();
				break;
			case "mousedown":
				gameControl.onMouseDown(event, barWidth, canvas);
		}
	};
}

/**
 * Adds the available non-hidden puzzles to the sidebar. The inserted images can
 * be clicked on in order to switch between puzzles.
 * @param {PuzzleBoard} 
 */
function insertThumb({ puzzleKey, altText, isHidden }) {
	if (isHidden) {
		return;
	}
	const img = document.createElement("img");
	img.id = puzzleKey;
	img.className = "thumb";
	img.src = `graphics/images/${puzzleKey}.png`;
	img.alt = altText;
	document.getElementById("puzzles").appendChild(img);
}

/**
 * Begins the canvas animation. The current game's frame function will be called
 * once for each animation frame.
 * @param {GameControl} gameControl 
 * @param {CanvasRenderingContext2D} ctx 
 */
function startAnimation(gameControl, ctx) {
	(function animate() {
		gameControl.current().frame(ctx);
		window.requestAnimationFrame(animate);
	})();
}

window.onload = function () {
	puzzleBoards.forEach(insertThumb);
	const gameControl = getGameControl();
	const eventHandler = getEventHandler(gameControl);
	const canvas = document.getElementById("canvas");
	canvas.addEventListener("mousemove", eventHandler);
	window.addEventListener("resize", eventHandler);
	window.addEventListener("keydown", eventHandler);
	canvas.addEventListener("mouseleave", eventHandler);
	window.addEventListener("mousedown", eventHandler);
	eventHandler({ type: "resize" });
	startAnimation(gameControl, canvas.getContext("2d"));
}
