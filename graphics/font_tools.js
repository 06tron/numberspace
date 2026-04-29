/* Copyright (c) 2022-2026, Matthew Richardson
(https://orcid.org/0009-0001-0977-2029).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>. */

/**
 * @param {*} raw An array of numbers.
 * @returns {string} An array of 2D coordinates in string form.
 */
function processArray(raw, index) {
	if (index == 5) {
		const reflected = glyphs[2].map((x, i) => (i & 1) ? -x : x);
		reflected[1] += 25;
		return processArray(reflected);
	}
	if (index == 9) {
		const rotated = glyphs[6].map(x => -x);
		rotated[0] += 19;
		rotated[1] += 25;
		return processArray(rotated);
	}
	const resize = raw.map(x => (x / 50));
	const lines = [];
	resize.unshift(0.31, 0.25);
	for (let i = 2; i < resize.length; i += 2) {
		resize[i] += resize[i - 2];
		resize[i + 1] += resize[i - 1];
		lines.push(resize[i].toFixed(4) + ", " + resize[i + 1].toFixed(4));
	}
	lines.push(lines[0]);
	return "[\n\t" + lines.join(",\n\t") + "\n]";
}

// outlines for the Countico glyphs I created, inspired by Quantico
const glyphs = [
	[
		2, 0,
		15, 0,
		0, 3,
		-11, 0,
		0, 7,
		9, 0,
		0, 3,
		-9, 0,
		0, 12,
		-4, 0
	],
	[
		8.625, 0,
		2.875, 0,
		0, 22,
		5.625, 0,
		0, 3,
		-15.25, 0,
		0, -3,
		5.625, 0,
		0, -18,
		-5.625, 2.5,
		0, -3.5
	],
	[
		5.5, 0,
		8, 0,
		4.5, 2,
		0, 11,
		-4.5, 2,
		-8.5, 0,
		0, 7,
		13, 0,
		0, 3,
		-17, 0,
		0, -11,
		4.5, -2,
		8.5, 0,
		0, -9,
		-9, 0,
		0, 3,
		-4, 0,
		0, -4
	], 
	[
		5.5, 0,
		8, 0,
		4.5, 2,
		0, 9,
		-3.375, 1.5,
		3.375, 1.5,
		0, 9,
		-4.5, 2,
		-8, 0,
		-4.5, -2,
		0, -4,
		4, 0,
		0, 3,
		9, 0,
		0, -8,
		-6, 0,
		0, -3,
		6, 0,
		0, -8,
		-9, 0,
		0, 3,
		-4, 0,
		0, -4
	], 
	[
		12, 0,
		4, 0,
		0, 16,
		3, 0,
		0, 3,
		-3, 0,
		0, 6,
		-4, 0,
		0, -19.88,
		-8.5, 10.88,
		8.5, 0,
		0, 3,
		-12, 0,
		0, -3.64
	],
	null,
	[
		5.5, 0,
		8, 0,
		4.5, 2,
		0, 4,
		-4, 0,
		0, -3,
		-9, 0,
		0, 19,
		9, 0,
		0, -9,
		-9, 0,
		0, -2,
		2.25, -1,
		6.25, 0,
		4.5, 2,
		0, 11,
		-4.5, 2,
		-8, 0,
		-4.5, -2,
		0, -21
	],
	[
		0, 0,
		19, 0,
		0, 1.9,
		-10.5, 23.1,
		-4, 0,
		10, -22,
		-10.5, 0,
		0, 3,
		-4, 0
	], 
	[
		5.5, 0,
		8, 0,
		4.5, 2,
		0, 9,
		-3.375, 1.5,
		3.375, 1.5,
		0, 9,
		-4.5, 2,
		-8, 0,
		-4.5, -2,
		0, -9,
		3.375, -1.5,
		-3.375, -1.5,
		0, -8,
		13, 0,
		0, 19,
		-9, 0,
		0, -8,
		9, 0,
		0, -3,
		-9, 0,
		0, -8,
		-4, 0,
		0, -1
	],
	null
];

console.log(glyphs.map(processArray).join(",\n"));

const unusedBoards = [
	{
		"order": 2,
		"displaySetup": [2, 2, 0, 0, 0],
		"symbolSet": undefined,
		"puzzleCells": [[1, 0, 0, 0]],
		"halfEdges": [[0, 0, 0, 5]]
	},
	{
		"order": 2,
		"displaySetup": [2, 2, 0, 0, 0],
		"symbolSet": undefined,
		"puzzleCells": [[1, 0, 0, 0], [0, 4, 0, 0]],
		"halfEdges": [[0, 1, 2, 0], [0, 1, 0, 3]]
	},
	{
		"order": 2,
		"displaySetup": [2, 2, 0, 0, 0],
		"symbolSet": undefined,
		"puzzleCells": [[1, 2, 0, 0], [0, 4, 0, 0], [0, 0, 0, 0]],
		"halfEdges": [[0, 1, 2, 0], [0, 2, 0, 6], [1, 2, 0, 0]]
	},
	{
		"order": 2,
		"displaySetup": [2, 2, 0, 0, 0],
		"symbolSet": undefined,
		"puzzleCells": [[1, 0, 0, 0], [0, 0, 3, 0], [0, 0, 2, 1], [0, 0, 0, 0]],
		"halfEdges": [[0, 1, 0, 0], [0, 2, 2, 0], [1, 3, 2, 0], [2, 3, 0, 0]]
	},
	{
		"order": 3,
		"puzzleKey": "closet",
		"altText": "An 9-block planar puzzle.",
		"isHidden": false,
		"displaySetup": [3, 3, 4, 4, 4],
		"symbolSet": symbolSets.nineDigits,
		"puzzleCells": [[1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1]],
		"halfEdges": [
			[0, 1, 0, 0],
			[1, 2, 3, 6],
			[2, 3, 0, 0],
			[3, 4, 3, 6],
			[4, 5, 0, 0],
			[5, 0, 3, 6],
			[0, 6, 3, 0],
			[2, 6, 3, 3],
			[4, 6, 3, 5],
			[7, 6, 3, 6],
			[7, 8, 0, 0],
			[7, 8, 1, 5]
		],
		"emptyCells": 0,
		"solution": [[1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1]]
	},
];
