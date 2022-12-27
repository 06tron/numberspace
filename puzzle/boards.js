const cellMargin = 15;

/**
 * The verts array describes a symbol centered in the unit square.
 * @param {number} cellNumber - A nonnegative integer.
 * @param {VertexArray} verts 
 * @returns {VertexArray[]}
 */
function symbolVariants(cellNumber, verts) {
	const smallStep = 1 / (cellNumber * cellMargin + cellNumber + 1);
	verts = verts.map(v => smallStep * (v * cellMargin + 1));
	const largeStep = smallStep * (cellMargin + 1);
	const variants = [];
	for (let r = 0; r < cellNumber; ++r) {
		for (let c = 0; c < cellNumber; ++c) {
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
 * @returns {VertexArray}
 */
function selectionVerts() {
	const step = 1.1 / cellMargin;
	return vertexArrays.square.map(v => v ? (1 + step) : -step);
}

const nineDigits = {
	cell: symbolVariants(3, vertexArrays.square),
	selection: symbolVariants(3, selectionVerts()),
	glyph: vertexArrays.quantico.slice(1).map(digit => symbolVariants(3, digit))
};

const puzzleBoards = [
	{
		"cellNumber": 3,
		"previewImage": "graphics/puzzle1.png",
		"tableWidth": 3,
		"tableHeight": 3,
		"symbolSet": nineDigits,
		"sudokuCells": [
			[5, 2, 1, 0, 7, 4, 6, 3, 8],
			[7, 4, 3, 0, 6, 0, 2, 0, 1],
			[8, 6, 0, 1, 2, 3, 5, 7, 4],
			[8, 9, 6, 3, 4, 5, 7, 1, 0],
			[4, 5, 0, 0, 8, 7, 1, 2, 6],
			[0, 3, 5, 7, 8, 1, 9, 4, 6],
			[2, 8, 3, 4, 5, 0, 1, 6, 7],
			[5, 1, 4, 6, 7, 2, 0, 3, 8],
			[6, 0, 7, 3, 1, 8, 4, 5, 2],
			[2, 0, 8, 9, 0, 4, 0, 0, 0],
			[1, 4, 3, 5, 8, 6, 0, 0, 0],
			[6, 7, 0, 3, 1, 2, 4, 8, 5],
			[7, 0, 2, 4, 6, 5, 3, 8, 9],
			[4, 7, 1, 9, 0, 2, 8, 3, 5],
			[8, 6, 3, 9, 2, 1, 0, 4, 7],
			[5, 0, 7, 6, 2, 1, 8, 4, 3],
			[6, 0, 4, 3, 5, 8, 7, 2, 9],
			[2, 3, 0, 7, 9, 4, 1, 0, 6]
		],
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
	}
	// },
	// {
	// 	"cellNumber": 3,
	// 	"previewImage": "graphics/puzzle2.png",
	// 	"tableWidth": 3,
	// 	"tableHeight": 3,
	// 	"symbolSet": nineDigits,
	// 	"sudokuCells": [],
	// 	"halfEdges": []
	// }
];

const heartBoard = {
	"cellNumber": 1,
	"tableWidth": 3,
	"tableHeight": 3,
	"symbolSet": [vertexArrays.snake],
	"sudokuCells": [[1]],
	"halfEdges": [[0, 0, 0, 7]]
};

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
// 	],
// 	"S3": {
// 		"courtyard": {
// 			"symbols": vertexArrays.quantico.slice(1),
// 			"cells": [
// 				[5, 2, 1, 0, 7, 4, 6, 3, 8],
// 				[7, 4, 3, 0, 6, 0, 2, 0, 1],
// 				[8, 6, 0, 1, 2, 3, 5, 7, 4],
// 				[8, 9, 6, 3, 4, 5, 7, 1, 0],
// 				[4, 5, 0, 0, 8, 7, 1, 2, 6],
// 				[0, 3, 5, 7, 8, 1, 9, 4, 6],
// 				[2, 8, 3, 4, 5, 0, 1, 6, 7],
// 				[5, 1, 4, 6, 7, 2, 0, 3, 8],
// 				[6, 0, 7, 3, 1, 8, 4, 5, 2],
// 				[2, 0, 8, 9, 0, 4, 0, 0, 0],
// 				[1, 4, 3, 5, 8, 6, 0, 0, 0],
// 				[6, 7, 0, 3, 1, 2, 4, 8, 5],
// 				[7, 0, 2, 4, 6, 5, 3, 8, 9],
// 				[4, 7, 1, 9, 0, 2, 8, 3, 5],
// 				[8, 6, 3, 9, 2, 1, 0, 4, 7],
// 				[5, 0, 7, 6, 2, 1, 8, 4, 3],
// 				[6, 0, 4, 3, 5, 8, 7, 2, 9],
// 				[2, 3, 0, 7, 9, 4, 1, 0, 6]
// 			],
// 			"links": [
// 				[0, 1, 0, 0], [1, 2, 0, 0],
// 				[3, 13, 0, 0], [13, 5, 0, 0],
// 				[6, 7, 0, 0], [7, 8, 0, 0],
// 				[9, 10, 0, 0], [10, 11, 0, 0],
// 				[12, 4, 0, 0], [4, 14, 0, 0],
// 				[15, 16, 0, 0], [16, 17, 0, 0],
// 				[0, 3, 2, 0], [3, 6, 2, 0],
// 				[1, 4, 2, 0], [4, 7, 2, 0],
// 				[2, 5, 2, 0], [5, 8, 2, 0],
// 				[9, 12, 2, 0], [12, 15, 2, 0],
// 				[10, 13, 2, 0], [13, 16, 2, 0],
// 				[11, 14, 2, 0], [14, 17, 2, 0]
// 			]
// 		}
// 	}
// };

// "cells": [
// 	[5, 2, 1, 9, 7, 4, 6, 3, 8],
// 	[7, 4, 3, 8, 6, 5, 2, 9, 1],
// 	[8, 6, 9, 1, 2, 3, 5, 7, 4],
// 	[8, 9, 6, 3, 4, 5, 7, 1, 2],
// 	[4, 5, 9, 3, 8, 7, 1, 2, 6],
// 	[2, 3, 5, 7, 8, 1, 9, 4, 6],
// 	[2, 8, 3, 4, 5, 9, 1, 6, 7],
// 	[5, 1, 4, 6, 7, 2, 9, 3, 8],
// 	[6, 9, 7, 3, 1, 8, 4, 5, 2],
// 	[2, 5, 8, 9, 7, 4, 1, 3, 6],
// 	[1, 4, 3, 5, 8, 6, 2, 9, 7],
// 	[6, 7, 9, 3, 1, 2, 4, 8, 5],
// 	[7, 1, 2, 4, 6, 5, 3, 8, 9],
// 	[4, 7, 1, 9, 6, 2, 8, 3, 5],
// 	[8, 6, 3, 9, 2, 1, 5, 4, 7],
// 	[5, 9, 7, 6, 2, 1, 8, 4, 3],
// 	[6, 1, 4, 3, 5, 8, 7, 2, 9],
// 	[2, 3, 8, 7, 9, 4, 1, 5, 6]
// ],

// "cells": [
// 	[5, 2, 1, 0, 7, 4, 6, 3, 8],
// 	[7, 4, 3, 0, 6, 0, 2, 0, 1],
// 	[8, 6, 0, 1, 2, 3, 5, 7, 4],
// 	[8, 9, 6, 3, 4, 5, 7, 1, 0],
// 	[4, 5, 0, 0, 8, 7, 1, 2, 6],
// 	[0, 3, 5, 7, 8, 1, 9, 4, 6],
// 	[2, 8, 3, 4, 5, 0, 1, 6, 7],
// 	[5, 1, 4, 6, 7, 2, 0, 3, 8],
// 	[6, 0, 7, 3, 1, 8, 4, 5, 2],
// 	[2, 0, 8, 9, 0, 4, 0, 0, 0],
// 	[1, 4, 3, 5, 8, 6, 0, 0, 0],
// 	[6, 7, 0, 3, 1, 2, 4, 8, 5],
// 	[7, 0, 2, 4, 6, 5, 3, 8, 9],
// 	[4, 7, 1, 9, 0, 2, 8, 3, 5],
// 	[8, 6, 3, 9, 2, 1, 0, 4, 7],
// 	[5, 0, 7, 6, 2, 1, 8, 4, 3],
// 	[6, 0, 4, 3, 5, 8, 7, 2, 9],
// 	[2, 3, 0, 7, 9, 4, 1, 0, 6]
// ],
