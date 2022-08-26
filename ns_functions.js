// /* Non-essential global variable, edited in index.html
let debugMode = false; // (used in drawPolygon) */

/**
 * A point on the xy-plane
 * 
 * @typedef Point
 * @property {number} x - This point's x-coordinate
 * @property {number} y - This point's y-coordinate
 * @property {boolean} [outL] - True if this point is "out to the left"
 * @property {boolean} [outR] - True if this point is "out to the right"
 */

/**
 * A line defined by a pair of two-dimensional points. The equation of the line is:
 *  y = (x - a.x) * (b.y - a.y) / (b.x - a.x) + a.y
 * 
 * @typedef TwoPointLine
 * @property {Point} a - A point on this line, not equal to 'b'
 * @property {Point} b - A point on this line, not equal to 'a'
 */

/**
 * Because left is the direction of the negative x-axis, this function determines if the given point's
 * 	x-coordinate is less than the x-value of the given line at the same y-value
 * 
 * @param {Point} point - The point to be compared with a given line
 * @param {TwoPointLine} line - The line to be compared with a given point
 * @returns {boolean} True if the given point is to the left of the given line, and false otherwise
 */
function leftOfLine(point, line) {
	return point.x < (point.y - line.a.y) * (line.b.x - line.a.x) / (line.b.y - line.a.y) + line.a.x;
}

/**
 * Because right is the direction of the positive x-axis, this function determines if the given point's
 * 	x-coordinate is greater than the x-value of the given line at the same y-value
 * 
 * @param {Point} point - The point to be compared with a given line
 * @param {TwoPointLine} line - The line to be compared with a given point
 * @returns {boolean} True if the given point is to the right of the given line, and false otherwise
 */
function rightOfLine(point, line) {
	return point.x > (point.y - line.a.y) * (line.b.x - line.a.x) / (line.b.y - line.a.y) + line.a.x;
}

/**
 * Finds the intersection point of two lines. One line is given, and the other is the extention of the
 *  line segment between two given points
 * 
 * @param {Point} a - The first of the two points which define the first line
 * @param {Point} b - The second of the two points which define the first line
 * @param {TwoPointLine} line - The second line, given in two-point form
 * @returns {Point} The 2D point of intersection
 */
function lineIntersectSegment(a, b, line) {
	const n1 = a.x * b.y - a.y * b.x;
	const n2 = line.a.x * line.b.y - line.a.y * line.b.x;
	const n3 = (a.x - b.x) * (line.a.y - line.b.y) - (a.y - b.y) * (line.a.x - line.b.x);
	return {
		x: (n1 * (line.a.x - line.b.x) - (a.x - b.x) * n2) / n3,
		y: (n1 * (line.a.y - line.b.y) - (a.y - b.y) * n2) / n3
	};
}

/**
 * Represents a polygon as an ordered list of its vertex coordinates
 * 
 * @typedef VertexArrayPolygon
 * @property {string | CanvasGradient | CanvasPattern} fillStyle - A property of the Canvas 2D API
 * 	which specifies the color, gradient, or pattern to use when drawing this polygon
 * @property {number[]} verts - Array with an even number of elements (at least four) which represent
 * 	2D point coordinates in the form [x0, y0, x1, y1, x2, y2...]
 */

/**
 * 
 * 
 * @typedef SquareSymmetry
 * @property {boolean} negativeH
 * @property {boolean} negativeV
 * @property {boolean} verticalX
 * @property {() => string} toString
 */

/**
 * 
 * @param {boolean} negH
 * @param {boolean} negV
 * @param {boolean} verX
 * @returns {SquareSymmetry}
 */
 function square(negH, negV, verX) {
	return {
		negativeH: negH,
		negativeV: negV,
		verticalX: verX,
		toString: () => (negH + (negV * 2) + (verX * 4)).toString()
	};
}

/**
 * 
 * @param {number} i - A non-negative integer
 * @returns {SquareSymmetry}
 */
function getOri(i) {
	return square(i % 2 > 0, i % 4 > 1, i % 8 > 3); 
}

/**
 * 
 * 
 * @typedef Cardinal
 * @property {boolean} isNegative
 * @property {boolean} isVertical
 * @property {() => number} index
 * @property {() => Cardinal} opposite
 * @property {(s: SquareSymmetry) => Cardinal} transferTo
 * @property {() => string} toString
 */

/**
 * 
 * 
 * @param {boolean} negC 
 * @param {boolean} verC 
 * @returns {Cardinal}
 */
function cardinal(negC, verC) {
	return {
		isNegative: negC,
		isVertical: verC,
		index: () => negC + (verC * 2),
		opposite: () => cardinal(!negC, verC),
		transferTo: s => cardinal(negC != (verC ? s.negativeV : s.negativeH), verC != s.verticalX),
		toString: () => verC ? negC ? "/\\" : "\\/" : negC ? "<-" : "->"
	};
}

/**
 * ->, <-, \/, /\
 * @param {number} i - A non-negative integer
 * @returns {Cardinal}
 */
function getDir(i) {
	return cardinal(i % 2 > 0, i % 4 > 1); 
}

/**
 * Any function which takes two coordinates, both in the range between 0 and 1 (inclusive), and returns
 *	a point on the xy-plane
 * 
 * @callback PointUpdater
 * @param {number} xCoord - A number between 0 and 1 which is the x-coordinate of the given point
 * @param {number} yCoord - A number between 0 and 1 which is the y-coordinate of the given point
 * @returns {Point} A new point created by the updater function
 */

/**
 * The return value of this function, the updater function, takes as input a point in the unit square.
 * 	The parameters of this function determine how any point in the input space will be transformed
 *  (scaled, translated, rotated, or reflected) into a new point in the output space. The output space
 * 	is a square defined by the given side length and top left point
 * 
 * @param {Point} topLeft - The the top left point of the output square
 * @param {number} sideLength - The side length of the output square
 * @param {SquareSymmetry} orient - One of eight ways to rotate and reflect the input
 * @returns {PointUpdater} A function which takes a point in the input square and returns its
 * 	corresponding point in the output square
 */
 function getUpdater(topLeft, sideLength, orient) {
	const updateX = orient.negativeH ? (n => 1 - n) : (n => n);
	const updateY = orient.negativeV ? (n => 1 - n) : (n => n);
	if (orient.verticalX)  {
		return function updater(xCoord, yCoord) {
			return {
				x: sideLength * updateX(yCoord) + topLeft.x,
				y: sideLength * updateY(xCoord) + topLeft.y,
				outL: false, outR: false
			};
		};
	} else {
		return function updater(xCoord, yCoord) {
			return {
				x: sideLength * updateX(xCoord) + topLeft.x,
				y: sideLength * updateY(yCoord) + topLeft.y,
				outL: false, outR: false
			};
		};
	}
}

/**
 * 
 * @param {VertexArrayPolygon} plg - A template defining the shape of the polygon to be drawn
 * @param {TwoPointLine} edgeL - Cut off any part of the updated polygon left of this line
 * @param {TwoPointLine} edgeR - Cut off any part of the updated polygon right of this line
 * @param {PointUpdater} updater - A function to transform the template polygon's vertices
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides the 2D rendering
 * 	context for the drawing surface of a <canvas> element
 */
function drawPolygon(plg, edgeL, edgeR, updater, context) {
	context.fillStyle = plg.fillStyle;
	context.beginPath();
	let p1 = updater(plg.verts[0], plg.verts[1]);
	if (leftOfLine(p1, edgeL)) {
		p1.outL = true;
		const isectL = lineIntersectSegment(p1, updater(plg.verts[2], plg.verts[3]), edgeL);
		context.moveTo(isectL.x, isectL.y);
	} else if (rightOfLine(p1, edgeR)) {
		p1.outR = true;
		const isectR = lineIntersectSegment(p1, updater(plg.verts[2], plg.verts[3]), edgeR);
		context.moveTo(isectR.x, isectR.y);
	} else {
		context.moveTo(p1.x, p1.y);
	}
	for (let i = 2; i < plg.verts.length; i += 2) {
		const p2 = updater(plg.verts[i], plg.verts[i + 1]);
		p2.outR = (p2.outL = leftOfLine(p2, edgeL)) ? false : rightOfLine(p2, edgeR);
		if (p1.outL) {
			if (p2.outR) { // both out, on opposite sides				p1 \~~~\ p2
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(isectR.x, isectR.y);
			} else if (!p2.outL) { // p1 out and p2 in					p1 \~~~~~p2
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(p2.x, p2.y);
			} // else both out, on same side							p1 p2 \~~~~
		} else if (p1.outR) {
			if (p2.outL) { // both out, on opposite sides				p2 \~~~\ p1
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(isectL.x, isectL.y);
			} else if (!p2.outR) { // p1 out and p2 in					p2~~~~~\ p1
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(p2.x, p2.y);
			} // else both out, on same side							~~~~\ p2 p1
		} else {
			if (p2.outR) { // p1 in and p2 out							p1~~~~~\ p2
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
			} else if (p2.outL) { // p1 in and p2 out					p2 \~~~~~p1
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				context.lineTo(isectL.x, isectL.y);
			} else { // both in											p1~~~~~~~p2
				context.lineTo(p2.x, p2.y);
			}
		}
		p1 = p2;
	}
	context.fill("evenodd");
	// /* Non-essential addition, makes it easier to see the borders between polygons
	if (debugMode) {
		context.stroke();
	} // */
	context.closePath();
}

/**
 * 
 * 
 * @typedef Tile
 * @property {() => boolean} isEmpty
 * @property {(target: Tile, ori: SquareSymmetry, dir: Cardinal,
 *  andBack: boolean) => Tile} linkTo - Connects this tile to its new neigbor, and then returns this tile 
 * @property {(updater: PointUpdater, edgeL: TwoPointLine, edgeR: TwoPointLine,
 *  ctx: CanvasRenderingContext2D) => undefined} draw
 * @property {(p: VertexArrayPolygon) => Tile} addPolygon
 * @property {Tile[]} nei
 * @property {SquareSymmetry[]} rel
 * @property {() => string} toString
 */

/**
 * 
 * 
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides the 2D rendering
 * 	context for the drawing surface of a <canvas> element
 * @param {string | CanvasGradient | CanvasPattern } baseFillStyle - A property of the Canvas 2D API
 * 	which specifies the color, gradient, or pattern to use when drawing the created tile's background
 * @param {...VertexArrayPolygon} polygons 
 * @returns {Tile}
 */
function createTile(baseFillStyle, ...polygons) {
	polygons.unshift({ fillStyle: baseFillStyle, verts: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0] });
	const neighbors = new Array(4).fill({ isEmpty: () => true });
	const relations = new Array(4).fill(undefined);
	return {
		isEmpty: () => false,
		linkTo: function(target, ori, dir, andBack) {
			const i = dir.index();
			neighbors[i] = target;
			relations[i] = ori;
			if (andBack) {
				let back = dir.opposite().transferTo(ori);
				if (ori.verticalX && ori.negativeH != ori.negativeV) {
					ori = square(ori.negativeV, ori.negativeH, ori.verticalX);
				}
				target.linkTo(this, ori, back, false);
			}
			return this;
		},
		draw: function(updater, edgeL, edgeR, ctx) {
			polygons.forEach(p => drawPolygon(p, edgeL, edgeR, updater, ctx));
		},
		addPolygon: function(p) {
			polygons.push(p);
			return this;
		},
		nei: neighbors,
		rel: relations,
		toString: () => baseFillStyle.toString()
	}
}

/**
 * 
 * @param {SquareSymmetry} ori 
 * @param {SquareSymmetry} rel 
 * @returns {SquareSymmetry}
 */
 function takeStep(ori, rel) {
	return (ori.verticalX && rel.negativeH != rel.negativeV)
		? square(ori.negativeH == rel.negativeH, ori.negativeV == rel.negativeV, ori.verticalX != rel.verticalX)
		: square(ori.negativeH != rel.negativeH, ori.negativeV != rel.negativeV, ori.verticalX != rel.verticalX);
}

/**
 * 
 * @typedef Walk
 * @property {() => boolean} canContinue
 * @property {(direct: Cardinal) => Walk} to
 * @property {(t: Tile, o: SquareSymmetry) => Walk} from
 * @property {() => Tile} currTile
 * @property {() => SquareSymmetry} currOri
 */

/**
 * 
 * @param {Tile} tile 
 * @param {SquareSymmetry} orient 
 * @returns {Walk}
 */
function startWalk(tile, orient) {
	return {
		canContinue: () => !tile.isEmpty(),
		to: function(direct) {
			const i = direct.transferTo(orient).index();
			orient = takeStep(orient, tile.rel[i]);
			tile = tile.nei[i];
			return this;
		},
		from: function(t, o) {
			tile = t;
			orient = o;
			return this;
		},
		currTile: () => tile,
		currOri: () => orient
	}
}

/**
 * True if b is steeper / closer to y-axis
 * 
 * @param {TwoPointLine} f1 
 * @param {TwoPointLine} f2 
 * @returns {boolean}
 */
function compareSlope(f1, f2) {
	return (f1.b.x - f1.a.x) * (f2.b.y - f2.a.y) < (f2.b.x - f2.a.x) * (f1.b.y - f1.a.y);
}

/**
 * 
 * @param {Tile} start
 * @param {Point} pTL 
 * @param {Point} origin 
 * @param {number} len 
 * @param {Point} quadSize 
 * @param {CanvasRenderingContext2D} context
 */
function tileTree(start, pTL, origin, len, quadSize, context)  {
	const pBR = { x: pTL.x + len, y: pTL.y + len };
	const xTopPos = { a: pTL, b: { x: pTL.x + 1, y: pTL.y } };
	const xTopNeg = { a: { x: pTL.x + 1, y: pTL.y }, b: pTL };
	const yLefPos = { a: pTL, b: { x: pTL.x, y: pTL.y + 1 } };
	const yLefNeg = { a: { x: pTL.x, y: pTL.y + 1 }, b: pTL };
	const yRigPos = { a: pBR, b: { x: pBR.x, y: pBR.y + 1 } };
	const yRigNeg = { a: { x: pBR.x, y: pBR.y + 1 }, b: pBR };
	const directions = [0, 2, 0, 3, 2, 1, 3, 1].map(getDir);
	const axes = [yLefPos, xTopNeg, yLefNeg, xTopNeg, xTopPos, yRigPos, xTopPos, yRigNeg];
	for (let i = 0; i < 4; ++i) {
		const b = i > 1;
		const r = i % 2 > 0; 

		/**
		 * (b * len) == (b ? len : 0)
		 * 
		 * @param {Walk} walk 
		 * @param {number} cx 
		 * @param {number} cy 
		 * @param {TwoPointLine} edgeL 
		 * @param {TwoPointLine} edgeR 
		 * @param {number} xMax 
		 * @param {number} yMax 
		 */
		function branch(walk, cx, cy, edgeL, edgeR, xMax, yMax) {
			const tile = walk.currTile();
			const orient = walk.currOri();
			const newEdge = { a: origin, b: { x: cx + (r ? -len : len), y: cy + (b ? -len : len) } };
			tile.draw(getUpdater({ x: cx - (r ? len : 0), y: cy - (b ? len : 0) }, len, orient), edgeL, edgeR, context);
			// * Toggle here to draw the tree one tile at a time in the browser's debugger
			// debugger; // * /
			if (xMax > 0 && walk.to(directions[i]).canContinue()) {
				const newLeft = (b != compareSlope(newEdge, edgeL)) ? edgeL : newEdge;
				if (b != compareSlope(newLeft, edgeR)) {
					branch(walk, cx + (r ? 0 : len), cy + (r ? b ? -len : len : 0), newLeft, edgeR, xMax - 1, yMax);
				}
			}
			if (yMax > 0 && walk.from(tile, orient).to(directions[i + 4]).canContinue()) {
				if (b != compareSlope(newEdge, edgeR)) {
					edgeR = newEdge;
				}
				if (b != compareSlope(edgeL, edgeR)) {
					branch(walk, cx - (r ? len : 0), cy + (r ? 0 : b ? -len : len), edgeL, edgeR, xMax, yMax - 1);
				}
			}
		}

		branch(
			startWalk(start, getOri(0)),
			pTL.x + (r ? len : 0),
			pTL.y + (b ? len : 0),
			axes[i],
			axes[i + 4],
			quadSize[r ? 'y' : 'x'],
			quadSize[r ? 'x' : 'y']
		);
	}
}

/* use 'Cmd'+'/' here to toggle testing

(function main() {
	console.log(main);
	test_transferTo();
	const abc = ["A", "B", "C"].map(x => createTile(x));
	test_linkTo(abc);
	test_walkTo(abc);
})();

function test_transferTo() {
	console.assert(getDir(1).transferTo(getOri(0)).toString() == "<-", "\"<-\" transfered to ori[0] should be \"<-\"");
	console.assert(getDir(2).transferTo(getOri(4)).toString() == "->", "\"\\/\" transfered to ori[4] should be \"->\"");
	console.assert(getDir(0).transferTo(getOri(6)).toString() == "\\/", "\"->\" transfered to ori[6] should be \"\\/\"");
	console.assert(getDir(3).transferTo(getOri(2)).toString() == "\\/", "\"/\\\" transfered to ori[2] should be \"\\/\"");
}

function test_linkTo(abc) {
	abc[0].linkTo(abc[1], getOri(0), getDir(0), true);
	abc[0].linkTo(abc[1], getOri(6), getDir(2), true);
	abc[2].linkTo(abc[0], getOri(2), getDir(3), true);
	abc[1].linkTo(abc[2], getOri(0), getDir(3), true);
	abc[2].linkTo(abc[0], getOri(0), getDir(0), true);
	abc[1].linkTo(abc[1], getOri(2), getDir(2), false);
	abc[2].linkTo(abc[0], getOri(1), getDir(1), false);
	console.assert(abc[1].rel[1].toString() == "0", "B's \"<-\" relation should be ori[0]");
	console.assert(abc[1].rel[0].toString() == "5", "B's \"->\" relation should be ori[5]");
	console.assert(abc[0].rel[3].toString() == "2", "B's \"/\\\" relation should be ori[2]");
	console.assert(abc[0].nei.map(x => x.toString()).join() == "B,C,B,C", "A's neigbor array should be [B, C, B, C]");
	console.assert(abc[1].nei.map(x => x.toString()).join() == "A,A,B,C", "B's neigbor array should be [A, A, B, C]");
	console.assert(abc[2].nei.map(x => x.toString()).join() == "A,A,B,A", "C's neigbor array should be [A, A, B, A]");
}

function test_walkTo(abc) {
	const walk = startWalk(abc[0], getOri(0));
	const seq = [1, 2, 0, 3];
	for (let i = 0; i < 6; ++i) {
		walk.to(getDir(seq[i % 4]));
	}
	console.assert(walk.currTile().toString() + walk.currOri().toString() == "A3",
		"Start at A in ori[0] and return to A in ori[3] after moving left, down, right, up, left, down");
}

// */
