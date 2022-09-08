// 4 color squares, 4 or less glyphs
// on creation: no args -> 4 white squares
// up to 4 args: -> replace white square with light steel blue, and add the glyph that was passes
// exactly four args: each  is either 0,1,2,3,4
function sudoTile(tl, tr, bl, br) {
	const polygons = [
		getSquare(0, tl == 0 ? "white" : "lightsteelblue"),
		getSquare(1, tr == 0 ? "white" : "lightsteelblue"),
		getSquare(2, bl == 0 ? "white" : "lightsteelblue"),
		getSquare(3, br == 0 ? "white" : "lightsteelblue")
	];
	if (tl > 0) {
		polygons.push(getGlyph(tl - 1, 0));
	}
	if (tr > 0) {
		polygons.push(getGlyph(tr - 1, 1));
	}
	if (bl > 0) {
		polygons.push(getGlyph(bl - 1, 2));
	}
	if (br > 0) {
		polygons.push(getGlyph(br - 1, 3));
	}
	return polygons;
}
function getSquare(b, color) {
	const glyph = [
		0.04, 0.04,
		0.48, 0.04,
		0.48, 0.48,
		0.04, 0.48,
		0.04, 0.04
	]
	for (let i = 0; i < glyph.length; i += 2) {
		if (b % 2 > 0) {
			glyph[i] += 0.48;
		}
		if (b > 1) {
			glyph[i + 1] += 0.48;
		}
	}
	return { fillStyle: color, verts: glyph };
}
function getGlyph(b1, b2) {
	const glyph = [
		0.16, 0.16,
		0.20, 0.16,
		0.20, 0.32,
		0.32, 0.32,
		0.32, 0.16,
		0.36, 0.16,
		0.36, 0.36,
		0.16, 0.36,
		0.16, 0.16
	];
	for (let i = 0; i < glyph.length; i += 2) {
		const flip = b1 % 2 > 0;
		if (flip) {
			temp = glyph[i];
			glyph[i] = glyph[i + 1];
			glyph[i + 1] = temp;
		}
		if (b1 > 1) {
			const j = flip ? i : i + 1;
			glyph[j] = 0.52 - glyph[j];
		}
		if (b2 % 2 > 0) {
			glyph[i] += 0.48;
		}
		if (b2 > 1) {
			glyph[i + 1] += 0.48;
		}
	}
	return { fillStyle: "black", verts: glyph };
}
const sudokuTile = {
	fillStyle: "black",
	verts: [
		0.1, 0.1,
		0.3, 0.1,
		0.3, 0.3,
		0.1, 0.3,
		0.1, 0.1
	]
};
function tileFace(color) {
	return {
		fillStyle: color,
		verts: [
			0.03, 0.03,
			0.97, 0.03,
			0.97, 0.97,
			0.03, 0.97,
			0.03, 0.03
		]
	};
}
const pipTL = {
	fillStyle: "black",
	verts: [
		0.1, 0.1,
		0.3, 0.1,
		0.3, 0.3,
		0.1, 0.3,
		0.1, 0.1
	]
};
const pipTR = {
	fillStyle: "black",
	verts: [
		0.7, 0.1,
		0.9, 0.1,
		0.9, 0.3,
		0.7, 0.3,
		0.7, 0.1
	]
};
const pipCL = {
	fillStyle: "black",
	verts: [
		0.1, 0.4,
		0.3, 0.4,
		0.3, 0.6,
		0.1, 0.6,
		0.1, 0.4
	]
};
const pipCC = {
	fillStyle: "black",
	verts: [
		0.4, 0.4,
		0.6, 0.4,
		0.6, 0.6,
		0.4, 0.6,
		0.4, 0.4
	]
};
const pipCR = {
	fillStyle: "black",
	verts: [
		0.7, 0.4,
		0.9, 0.4,
		0.9, 0.6,
		0.7, 0.6,
		0.7, 0.4
	]
};
const pipBL = {
	fillStyle: "black",
	verts: [
		0.1, 0.7,
		0.3, 0.7,
		0.3, 0.9,
		0.1, 0.9,
		0.1, 0.7
	]
};
const pipBR = {
	fillStyle: "black",
	verts: [
		0.7, 0.7,
		0.9, 0.7,
		0.9, 0.9,
		0.7, 0.9,
		0.7, 0.7
	]
};
const digit1 = [
	0.6116, 0.7924,
	0.5372, 0.7924,
	0.5372, 0.2992,
	0.388, 0.354,
	0.388, 0.2868,
	0.6, 0.2072,
	0.6116, 0.2072,
	0.6116, 0.7924,
];
const digit4 = [
	0.6296, 0.5968,
	0.7104, 0.5968,
	0.7104, 0.6572,
	0.6296, 0.6572,
	0.6296, 0.7924,
	0.5552, 0.7924,
	0.5552, 0.317,
	0.374, 0.5968,
	0.5552, 0.5968,
	0.5552, 0.6572,
	0.29, 0.6572,
	0.29, 0.6136,
	0.5508, 0.21,
	0.6296, 0.21,
	0.6296, 0.5968
];
const digit7 = [
	0.6968, 0.2516,
	0.4556, 0.7924,
	0.378, 0.7924,
	0.6184, 0.2708,
	0.3032, 0.2708,
	0.3032, 0.21,
	0.6968, 0.21,
	0.6968, 0.2516
];
