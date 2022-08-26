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

// function tlbranch(walk, tlx, tly, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: tlx + len, y: tly + len } };
// 	tile.draw(getUpdater({ x: tlx, y: tly }, len, orient), edgeL, edgeR, context);
// 	if (xMax > 0 && walk.to(getDir(0)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) < 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) < 0) {
// 			tlbranch(walk, tlx + len, tly, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(2)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) < 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) < 0) {
// 			tlbranch(walk, tlx, tly + len, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function trbranch(walk, tlx, tly, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: tlx - len, y: tly + len } };
// 	tile.draw(getUpdater({ x: tlx - len, y: tly }, len, orient), edgeL, edgeR, context);
// 	if (xMax > 0 && walk.to(getDir(2)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) < 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) < 0) {
// 			trbranch(walk, tlx, tly + len, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(1)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) < 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) < 0) {
// 			trbranch(walk, tlx - len, tly, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function blbranch(walk, tlx, tly, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: tlx + len, y: tly - len } };
// 	tile.draw(getUpdater({ x: tlx, y: tly - len }, len, orient), edgeL, edgeR, context);
// 	if (xMax > 0 && walk.to(getDir(0)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) > 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) > 0) {
// 			blbranch(walk, tlx + len, tly, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(3)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) > 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) > 0) {
// 			blbranch(walk, tlx, tly - len, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// function brbranch(walk, tlx, tly, edgeL, edgeR, xMax, yMax) {
// 	const tile = walk.currTile();
// 	const orient = walk.currOri();
// 	const newEdge = { a: origin, b: { x: tlx - len, y: tly - len } };
// 	tile.draw(getUpdater({ x: tlx - len, y: tly - len }, len, orient), edgeL, edgeR, context);
// 	if (xMax > 0 && walk.to(getDir(3)).canContinue()) {
// 		const newLeft = (compareSlope(newEdge, edgeL) > 0) ? edgeL : newEdge;
// 		if (compareSlope(newLeft, edgeR) > 0) {
// 			brbranch(walk, tlx, tly - len, newLeft, edgeR, xMax - 1, yMax);
// 		}
// 	}
// 	if (yMax > 0 && walk.from(tile, orient).to(getDir(1)).canContinue()) {
// 		if (compareSlope(newEdge, edgeR) > 0) {
// 			edgeR = newEdge;
// 		}
// 		if (compareSlope(edgeL, edgeR) > 0) {
// 			brbranch(walk, tlx - len, tly, edgeL, edgeR, xMax, yMax - 1);
// 		}
// 	}
// }
// tlbranch(startWalk(start, getOri(0)), pTL.x, pTL.y, yLefPos, xTopPos, quadSize.x, quadSize.y);
// trbranch(startWalk(start, getOri(0)), pTL.x + len, pTL.y, xTopNeg, yRigPos, quadSize.y, quadSize.x);
// blbranch(startWalk(start, getOri(0)), pTL.x, pTL.y + len, yLefNeg, xTopPos, quadSize.x, quadSize.y);
// brbranch(startWalk(start, getOri(0)), pTL.x + len, pTL.y + len, xTopNeg, yRigNeg, quadSize.y, quadSize.x);
