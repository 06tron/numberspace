const tableMargin = 100;
let debugMode = 0;

// returns sudoku game
function startGame({
	cellNumber,
	tableWidth,
	tableHeight,
	symbolSet,
	sudokuCells,
	halfEdges
}) {

	const regionArea = cellNumber * cellNumber;

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
			select: function (cellIndex) {
				polygons[0] = {
					fillStyle: "darkgrey",
					verts: symbolSet.selection[cellIndex]
				};
			},
			deselect: function () {
				polygons[0] = null;
			},
			setSymbol: function (cellIndex, symbolIndex = -1) {
				if (cells[cellIndex] != 0) {
					return;
				}
				if (symbolIndex == -1) {
					polygons[cellIndex + 1 + regionArea] = null;
				} else {
					polygons[cellIndex + 1 + regionArea] = {
						fillStyle: "black",
						verts: symbolSet.glyph[symbolIndex][cellIndex]
					};
				}
			}
		};
	}

	let regionLength;
	const regions = sudokuCells.map(createRegion);
	halfEdges.forEach(function ([startId, targetId, dirIndex, oriIndex]) {
		const start = regions[startId].tile;
		const target = regions[targetId].tile;
		start.linkTo(target, getDir(dirIndex), getOri(oriIndex));
	});
	regions[0].select(0, getOri(0));
	const walk = startWalk(regions[0].tile, getOri(0));
	return {
		resize: function (canvas) {
			const horizontalFit = (canvas.width - tableMargin * 2) / tableWidth;
			const verticalFit = (canvas.height - tableMargin * 2) / tableHeight;
			regionLength = Math.min(horizontalFit, verticalFit);
		},
		draw: function (canvas) {
			const pTL = {
				x: (canvas.width - regionLength * tableWidth) / 2,
				y: (canvas.height - regionLength * tableHeight) / 2
			};
			tileTree(walk, pTL, pTL, regionLength, [5,5,5,5], canvas.getContext("2d"));
		}
	}
}

window.onload = function () {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	let menuWidth = 300;
	const sudokuGames = puzzleBoards.map(startGame);
	let gameIndex = 0;

	canvas.onclick = function (event) {
		ctx.beginPath();
		ctx.arc(event.clientX - menuWidth, event.clientY, 10, 0, 2 * Math.PI);
		ctx.stroke();
	}

	function redrawCanvas() {
		ctx.strokeStyle = "red";
		ctx.lineWidth = 10;
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		sudokuGames[gameIndex].draw(canvas);
	}

	// canvas.onmousemove = function (event) {
	// 	sudokuGames[gameIndex].moveTo(event.clientX - menuWidth, event.clientY);
	// 	redrawCanvas();
	// }

	function resizeCanvas() {
		canvas.width = window.innerWidth - menuWidth;
		canvas.height = window.innerHeight;
		sudokuGames[gameIndex].resize(canvas);
		redrawCanvas();
	}

	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
}
