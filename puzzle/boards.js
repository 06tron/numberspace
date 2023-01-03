const cellMargin = 15;

/**
 * The verts array describes a symbol centered in the unit square.
 * @param {number} order - A nonnegative integer.
 * @param {VertexArray} vertices
 * @returns {VertexArray[]}
 */
function cellSymbols(order, vertices) {
	const smallStep = 1 / (order * cellMargin + order + 1);
	vertices = vertices.map(v => smallStep * (v * cellMargin + 1));
	const largeStep = smallStep * (cellMargin + 1);
	const variants = [];
	for (let r = 0; r < order; ++r) {
		for (let c = 0; c < order; ++c) {
			const copy = [];
			for (let i = 0; i < vertices.length; i += 2) {
				copy.push(vertices[i] + c * largeStep);
				copy.push(vertices[i + 1] + r * largeStep);
			}
			variants.push(copy);
		}
	}
	return variants;
}

/**
 * 
 * @param {FillStyle} fs 
 * @returns {(vertices: VertexArray) => VertexArrayPolygon}
 */
function toPolygon(fs) {
	return function (vertices) {
		return { fillStyle: fs, verts: vertices };
	};
}

const selectionVerts = (function () {
	const step = 1.03 / cellMargin;
	return vertexArrays.square.map(v => v ? (1 + step) : -step);
})();

/**
 * @typedef SymbolSet
 * @property {VertexArrayPolygon[]} whiteCell
 * @property {VertexArrayPolygon[]} blueCell
 * @property {VertexArrayPolygon[]} cellBorder
 * @property {VertexArrayPolygon[][]} cellGlyph
 */

function getSharedSymbols(order) {
	const plainCell = cellSymbols(order, vertexArrays.square);
	return [
		plainCell.map(toPolygon("white")),
		plainCell.map(toPolygon("lightsteelblue")),
		cellSymbols(order, selectionVerts).map(toPolygon("coral"))
	];
}

function fullSymbolSet(sharedSymbols, order, glyphSet, ...styles) {
	for (let i = styles.length; i < glyphSet.length; ++i) {
		styles.push(styles[styles.length - 1]);
	}
	return {
		whiteCell: sharedSymbols[0],
		blueCell: sharedSymbols[1],
		cellBorder: sharedSymbols[2],
		cellGlyph: glyphSet.map(function (glyph, i) {
			return cellSymbols(order, glyph).map(toPolygon(styles[i]));
		})
	};
}

const orderThree = getSharedSymbols(3);
const nineDigits = fullSymbolSet(orderThree, 3, vertexArrays.quantico.slice(1), "black");

const puzzleBoards = [
	{
		"order": 3,
		"puzzleKey": "hallway",
		"altText": "A 3-region planar puzzle.",
		"isHidden": false,
		"displaySetup": [5, 3, 7, 4, 4],
		"symbolSet": nineDigits,
		"puzzleCells": [
			[5, 0, 9, 4, 8, 0, 0, 0, 0],
			[0, 2, 0, 0, 0, 1, 0, 0, 3],
			[0, 6, 0, 0, 0, 0, 0, 9, 0]
		],
		"halfEdges": [
			[1, 0, 0, 0],
			[1, 0, 3, 0],
			[2, 0, 1, 0],
			[2, 0, 2, 0]
		]
	},
	{
		"order": 3,
		"puzzleKey": "courtyard",
		"altText": "An 18-region nonplanar puzzle.",
		"isHidden": false,
		"displaySetup": [3, 3, 4, 4, 4],
		"symbolSet": nineDigits,
		"puzzleCells": [[0,2,0,0,7,4,6,0,8],[7,0,3,0,0,0,2,0,1],[8,6,0,0,2,3,0,0,4],[8,0,6,3,0,5,0,1,0],[4,5,0,0,8,7,1,0,6],[0,0,5,7,0,1,9,4,6],[2,0,3,4,5,0,1,0,7],[5,0,0,6,7,0,0,3,8],[6,0,0,0,1,8,0,0,2],[2,0,8,9,0,4,0,0,0],[1,4,3,5,0,6,0,0,0],[6,7,0,3,1,2,0,0,5],[7,0,0,0,6,5,3,0,9],[4,7,0,9,0,2,0,0,0],[8,0,0,9,2,1,0,4,7],[5,0,7,0,2,1,0,0,3],[6,0,0,0,5,8,0,2,9],[0,3,0,7,9,4,1,0,6]],
		"halfEdges": [
			[0, 1, 0, 0], [1, 2, 0, 0],
			[3, 13, 0, 0], [13, 5, 0, 0],
			[6, 7, 0, 0], [7, 8, 0, 0],
			[9, 10, 0, 0], [10, 11, 0, 0],
			[12, 4, 0, 0], [4, 14, 0, 0],
			[15, 16, 0, 0], [16, 17, 0, 0],
			[0, 3, 2, 0], [3, 6, 2, 0],
			[1, 4, 2, 0], [4, 7, 2, 0],
			[2, 5, 2, 0], [5, 8, 2, 0],
			[9, 12, 2, 0], [12, 15, 2, 0],
			[10, 13, 2, 0], [13, 16, 2, 0],
			[11, 14, 2, 0], [14, 17, 2, 0]
		]
	},
	{
		"order": 1,
		"puzzleKey": "ns_heart",
		"isHidden": true,
		"displaySetup": [2, 2, 0, 0, 0],
		"symbolSet": fullSymbolSet(getSharedSymbols(1), 1, [vertexArrays.snake], "black"),
		"puzzleCells": [[1]],
		"halfEdges": [[0, 0, 0, 7]]
	}
];

// const puzzleBoards2 = {
// 	"S2": [
// 		{
// 			"cells": [[1, 0, 0, 0]],
// 			"links": [[0, 0, 0, 5]]
// 		},
// 		{
// 			"cells": [[1, 0, 0, 0], [0, 4, 0, 0]],
// 			"links": [[0, 1, 2, 0], [0, 1, 0, 3]]
// 		},
// 		{
// 			"cells": [[1, 2, 0, 0], [0, 4, 0, 0], [0, 0, 0, 0]],
// 			"links": [[0, 1, 2, 0], [0, 2, 0, 6], [1, 2, 0, 0]]
// 		},
// 		{
// 			"cells": [[1, 0, 0, 0], [0, 0, 3, 0], [0, 0, 2, 1], [0, 0, 0, 0]],
// 			"links": [[0, 1, 0, 0], [0, 2, 2, 0], [1, 3, 2, 0], [2, 3, 0, 0]]
// 		}
// 	]

// [[5,2,1,9,7,4,6,3,8],[7,4,3,8,6,5,2,9,1],[8,6,9,1,2,3,5,7,4],[8,9,6,3,4,5,7,1,2],[4,5,9,3,8,7,1,2,6],[2,3,5,7,8,1,9,4,6],[2,8,3,4,5,9,1,6,7],[5,1,4,6,7,2,9,3,8],[6,9,7,3,1,8,4,5,2],[2,5,8,9,7,4,1,3,6],[1,4,3,5,8,6,2,9,7],[6,7,9,3,1,2,4,8,5],[7,1,2,4,6,5,3,8,9],[4,7,1,9,6,2,8,3,5],[8,6,3,9,2,1,5,4,7],[5,9,7,6,2,1,8,4,3],[6,1,4,3,5,8,7,2,9],[2,3,8,7,9,4,1,5,6]]
// [[5,2,0,0,7,4,6,0,8],[7,0,3,0,6,0,2,0,1],[8,6,0,0,2,3,5,7,4],[8,0,6,3,0,5,0,1,0],[4,5,0,0,8,7,1,0,6],[0,3,5,7,0,1,9,4,6],[2,0,3,4,5,0,1,6,7],[5,0,4,6,7,0,0,3,8],[6,0,0,3,1,8,4,5,2],[2,0,8,9,0,4,0,0,0],[1,4,3,5,8,6,0,0,0],[6,7,0,3,1,2,0,0,5],[7,0,2,0,6,5,3,0,9],[4,7,0,9,0,2,0,0,0],[8,0,0,9,2,1,0,4,7],[5,0,7,0,2,1,8,0,3],[6,0,0,0,5,8,0,2,9],[0,3,0,7,9,4,1,0,6]]
// [[0,2,0,0,7,4,6,0,8],[7,0,3,0,0,0,2,0,1],[8,6,0,0,2,3,0,0,4],[8,0,6,3,0,5,0,1,0],[4,5,0,0,8,7,1,0,6],[0,0,5,7,0,1,9,4,6],[2,0,3,4,5,0,1,0,7],[5,0,0,6,7,0,0,3,8],[6,0,0,0,1,8,0,0,2],[2,0,8,9,0,4,0,0,0],[1,4,3,5,0,6,0,0,0],[6,7,0,3,1,2,0,0,5],[7,0,0,0,6,5,3,0,9],[4,7,0,9,0,2,0,0,0],[8,0,0,9,2,1,0,4,7],[5,0,7,0,2,1,0,0,3],[6,0,0,0,5,8,0,2,9],[0,3,0,7,9,4,1,0,6]]
