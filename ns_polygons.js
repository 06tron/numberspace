let digit1 = [
	0.6116, 0.7924,
	0.5372, 0.7924,
	0.5372, 0.2992,
	0.388, 0.354,
	0.388, 0.2868,
	0.6, 0.2072,
	0.6116, 0.2072,
	0.6116, 0.7924,
];

let digit4 = [
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

let digit7 = [
	0.6968, 0.2516,
	0.4556, 0.7924,
	0.378, 0.7924,
	0.6184, 0.2708,
	0.3032, 0.2708,
	0.3032, 0.21,
	0.6968, 0.21,
	0.6968, 0.2516
];

// function tlbranch(cx, cy, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: cx + len, y: cy + len } };
// 	tile.draw(getUpdater({ x: cx, y: cy }, len, orient), edgeL, edgeR, context);
// 	if (xMax > 0 && walk.to(getDir(0)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) < 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) < 0) {
// 			tlbranch(cx + len, cy, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(2)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) < 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) < 0) {
// 			tlbranch(cx, cy + len, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function trbranch(cx, cy, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: cx - len, y: cy + len } };
// 	if (yMax != lim.x) {
// 		tile.draw(getUpdater({ x: cx - len, y: cy }, len, orient), edgeL, edgeR, context);
// 	}
// 	if (xMax > 0 && walk.to(getDir(2)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) > 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) > 0) {
// 			trbranch(cx, cy + len, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(1)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) > 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) > 0) {
// 			trbranch(cx - len, cy, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function blbranch(cx, cy, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: cx + len, y: cy - len } };
// 	if (yMax != lim.y) {
// 		tile.draw(getUpdater({ x: cx, y: cy - len }, len, orient), edgeL, edgeR, context);
// 	}
// 	if (xMax > 0 && walk.to(getDir(0)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) < 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) < 0) {
// 			blbranch(cx + len, cy, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(3)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) < 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) < 0) {
// 			blbranch(cx, cy - len, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function brbranch(cx, cy, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: cx - len, y: cy - len } };
// 	if (xMax != lim.y && yMax != lim.x) {
// 		tile.draw(getUpdater({ x: cx - len, y: cy - len }, len, orient), edgeL, edgeR, context);
// 	}
// 	if (xMax > 0 && walk.to(getDir(3)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) > 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) > 0) {
// 			brbranch(cx, cy - len, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(1)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) > 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) > 0) {
// 			brbranch(cx - len, cy, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// walk.from(start, getOri(0));
// tlbranch(pTL.x, pTL.y, yLef, xTop, lim.x, lim.y);
// walk.from(start, getOri(0));
// trbranch(pTL.x + len, pTL.y, xTop, yRig, lim.y, lim.x);
// walk.from(start, getOri(0));
// blbranch(pTL.x, pTL.y + len, yLef, xBot, lim.x, lim.y);
// walk.from(start, getOri(0));
// brbranch(pTL.x + len, pTL.y + len, xBot, yRig, lim.y, lim.x);
