const tableMargin = 80;

// returns sudoku game
function startGame({
	cellNumber,
	puzzleName,
	tableWidth,
	tableHeight,
	symbolSet,
	sudokuCells,
	halfEdges
}) {

	const regionArea = cellNumber * cellNumber;
	const mouseRaw = { x: 0, y: 0 };
	const mouseBox = { x: 0, y: 0 };

	function createRegion(cells, regionId) {
		const polygons = new Array(1 + regionArea * 2).fill(null);
		for (let i = 0; i < regionArea; ++i) {
			polygons[i + 1] = {
				fillStyle: "white",
				verts: symbolSet.cell[i]
			};
			if (cells[i] > 0)  {
				polygons[i + 1].fillStyle = "lightsteelblue";
				polygons[i + 1 + regionArea] = {
					fillStyle: "black",
					verts: symbolSet.glyph[cells[i] - 1][i]
				};
			}
		}
		const tile = createTile(polygons, cells.join(), regionId);
		return {
			tile: tile,
			reselect: function (cellIndex = -1) {
				polygons[0] = cellIndex < 0 ? null : {
					fillStyle: "darkgrey",
					verts: symbolSet.selection[cellIndex]
				};
			},
			overwrite: function (cellIndex, glyphIndex = -1) {
				if (cells[cellIndex] != 0) {
					return;
				}
				polygons[cellIndex + 1 + regionArea] = glyphIndex < 0 ? null : {
					fillStyle: "black",
					verts: symbolSet.glyph[glyphIndex][cellIndex]
				}
			}
		};
	}

	const regions = sudokuCells.map(createRegion);
	halfEdges.forEach(function ([startId, targetId, dirIndex, oriIndex]) {
		const start = regions[startId].tile;
		const target = regions[targetId].tile;
		start.linkTo(target, getDir(dirIndex), getOri(oriIndex));
	});
	regions[0].reselect(0);
	const walk = startWalk(regions[0].tile, getOri(0));
	return [puzzleName, {
		draw: function (canvas) {
			const horizontalFit = (canvas.width - tableMargin * 2) / tableWidth;
			const verticalFit = (canvas.height - tableMargin * 2) / tableHeight;
			regionLength = Math.min(horizontalFit, verticalFit);
			const pTL = {
				x: (canvas.width + regionLength * (2 * mouseBox.x - tableWidth)) / 2,
				y: (canvas.height + regionLength * (2 * mouseBox.y - tableHeight)) / 2,
			};
			tileTree(walk, pTL, mouseRaw, regionLength, [5,5,5,5], canvas.getContext("2d"));
		}
	}];
}

function insertThumb({ puzzleName }) {
	const img = document.createElement("img");
	img.className = "thumb";
	img.src = "graphics/" + puzzleName + ".png";
	img.alt = puzzleName;
	document.getElementById("puzzles").appendChild(img);
}

window.onload = function () {
	puzzleBoards.forEach(insertThumb);
	const sudokuGames = Object.fromEntries(puzzleBoards.map(startGame));
	let currentGame = puzzleBoards[0].puzzleName;

	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const openMenuWidth = 300;
	let menuWidth = openMenuWidth;

	function redrawCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		sudokuGames[currentGame].draw(canvas);
	}

	window.addEventListener("click", function (event) {
		if (event.target.className != "thumb") {
			return;
		}
		currentGame = event.target.alt;
		redrawCanvas();
	});

	// canvas.onmousemove = function (event) {
	// 	sudokuGames[gameIndex].moveTo(event.clientX - menuWidth, event.clientY);
	// 	redrawCanvas();
	// }

	function resizeCanvas() {
		canvas.width = window.innerWidth - menuWidth;
		canvas.height = window.innerHeight;
		redrawCanvas();
	}

	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
}
