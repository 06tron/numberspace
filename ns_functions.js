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
 * A non-vertical line defined by its slope and the coordinates of any point on the line. The equation
 * 	of the line is y = (x - pointX) / slopeInverse + pointY
 * 
 * @typedef PointSlopeLine
 * @property {number} pointX - The x-coordinate of a point on this line
 * @property {number} pointY - The y-coordinate of a point on this line
 * @property {number} slopeInverse - The reciprocal of this line's slope
 */

/**
 * Because left is the direction of the negative x-axis, this function determines if the given point's
 * 	x-coordinate is less than the x-value of the given line at the same y-value
 * 
 * @param {Point} point - The point to be compared with a given line
 * @param {PointSlopeLine} line - The line to be compared with a given point
 * @returns {boolean} True if the given point is to the left of the given line, and false otherwise
 */
function leftOfLine(point, line) {
	return point.x < ((line.p2.x - line.p1.x) / (line.p2.y - line.p1.y)) * (point.y - line.p1.y) + line.p1.x;
	// return point.x < line.slopeInverse * (point.y - line.pointY) + line.pointX;
}

/**
 * Because right is the direction of the positive x-axis, this function determines if the given point's
 * 	x-coordinate is greater than the x-value of the given line at the same y-value
 * 
 * @param {Point} point - The point to be compared with a given line
 * @param {PointSlopeLine} line - The line to be compared with a given point
 * @returns {boolean} True if the given point is to the right of the given line, and false otherwise
 */
function rightOfLine(point, line) {
	return point.x > ((line.p2.x - line.p1.x) / (line.p2.y - line.p1.y)) * (point.y - line.p1.y) + line.p1.x;
	// return point.x > line.slopeInverse * (point.y - line.pointY) + line.pointX;
}

/**
 * Finds the intersection point of two lines. One is an extention of the line segment between two given
 * 	points, and the other is given
 * 
 * @param {Point} p1 - The first of the two points which define the first line
 * @param {Point} p2 - The second of the two points which define the first line
 * @param {PointSlopeLine} line - The second line, given in point-slope form
 * @returns {Point} The 2D point of intersection
 */
function lineIntersectSegment(p1, p2, line) {
	return fourPointIntersection(p1, p2, line.p1, line.p2);
	// let isectX = p1.x * (line.slopeInverse * (p2.y - line.pointY) + line.pointX);
	// isectX -= p2.x * (line.slopeInverse * (p1.y - line.pointY) + line.pointX);
	// isectX /= p1.x + line.slopeInverse * (p2.y - p1.y) - p2.x;
	// return { x: isectX, y: (isectX - line.pointX) / line.slopeInverse + line.pointY };
}

function fourPointIntersection(a1, a2, b1, b2) {
	const n1 = (a1.x * a2.y) - (a1.y * a2.x);
	const n2 = (b1.x * b2.y) - (b1.y * b2.x);
	const n3 = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
	return {
		x: (n1 * (b1.x - b2.x) - (a1.x - a2.x) * n2) / n3,
		y: (n1 * (b1.y - b2.y) - (a1.y - a2.y) * n2) / n3
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

// TODO commenting below this point

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
 * @typedef SquareSymmetry
 * @property {boolean} negativeH
 * @property {boolean} negativeV
 * @property {boolean} verticalX
 * @property {() => number} index
 * @property {(c: Cardinal) => SquareSymmetry} asRelation
 * @property {(r: SquareSymmetry, c: Cardinal) => SquareSymmetry} applyRelation
 * @property {() => string} toString
 */

/**
 * WORKING
 * @param {*} negC 
 * @param {*} verC 
 * @returns {Cardinal}
 */
function cardinal(negC, verC) {
	return {
		isNegative: negC,
		isVertical: verC,
		opposite: () => cardinal(!negC, verC),
		transferTo: s => cardinal(negC != (verC ? s.negativeV : s.negativeH), verC != s.verticalX),
		index: () => negC + (verC * 2),
		toString: () => verC ? negC ? "/\\" : "\\/" : negC ? "<-" : "->"
	};
}

function getDir(i) {
	// ->, <-, \/, /\
	return cardinal(i % 2 > 0, i % 4 > 1); 
}

/**
 * 
 * @param {*} negH
 * @param {*} negV
 * @param {*} verX
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

function getOri(i) {
	// 0 1  1 0  2 3  3 2  0 2  1 3  2 0  3 1
	// 2 3, 3 2, 0 1, 1 0, 1 3, 0 2, 3 1, 2 0
	return square(i % 2 > 0, i % 4 > 1, i % 8 > 3); 
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
			}
		}
	} else {
		return function updater(xCoord, yCoord) {
			return {
				x: sideLength * updateX(xCoord) + topLeft.x,
				y: sideLength * updateY(yCoord) + topLeft.y,
				outL: false, outR: false
			}
		}
	}
}

/**
 * 
 * @param {VertexArrayPolygon} plg - A template defining the shape of the polygon to be drawn
 * @param {PointSlopeLine} leftEdge - Cut off any part of the updated polygon left of this line
 * @param {PointSlopeLine} rightEdge - Cut off any part of the updated polygon right of this line
 * @param {PointUpdater} updater - A function to transform the template polygon's vertices
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides the 2D rendering
 * 	context for the drawing surface of a <canvas> element
 */
function drawPolygon(plg, leftEdge, rightEdge, updater, context) {
	context.fillStyle = plg.fillStyle;
	context.beginPath();
	let p1 = updater(plg.verts[0], plg.verts[1]);
	if (leftOfLine(p1, leftEdge)) {
		p1.outL = true;
		const isectL = lineIntersectSegment(p1, updater(plg.verts[2], plg.verts[3]), leftEdge);
		context.moveTo(isectL.x, isectL.y);
	} else if (rightOfLine(p1, rightEdge)) {
		p1.outR = true;
		const isectR = lineIntersectSegment(p1, updater(plg.verts[2], plg.verts[3]), rightEdge);
		context.moveTo(isectR.x, isectR.y);
	} else {
		context.moveTo(p1.x, p1.y);
	}
	for (let i = 2; i < plg.verts.length; i += 2) {
		const p2 = updater(plg.verts[i], plg.verts[i + 1]);
		p2.outR = (p2.outL = leftOfLine(p2, leftEdge)) ? false : rightOfLine(p2, rightEdge);
		if (p1.outL) {
			if (p2.outR) { // both out, on opposite sides				p1 \~~~\ p2
				const isectL = lineIntersectSegment(p1, p2, leftEdge);
				const isectR = lineIntersectSegment(p1, p2, rightEdge);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(isectR.x, isectR.y);
			} else if (!p2.outL) { // p1 out and p2 in					p1 \~~~~~p2
				const isectL = lineIntersectSegment(p1, p2, leftEdge);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(p2.x, p2.y);
			} // else both out, on same side							p1 p2 \~~~~
		} else if (p1.outR) {
			if (p2.outL) { // both out, on opposite sides				p2 \~~~\ p1
				const isectL = lineIntersectSegment(p1, p2, leftEdge);
				const isectR = lineIntersectSegment(p1, p2, rightEdge);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(isectL.x, isectL.y);
			} else if (!p2.outR) { // p1 out and p2 in					p2~~~~~\ p1
				const isectR = lineIntersectSegment(p1, p2, rightEdge);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(p2.x, p2.y);
			} // else both out, on same side							~~~~\ p2 p1
		} else {
			if (p2.outR) { // p1 in and p2 out							p1~~~~~\ p2
				const isectR = lineIntersectSegment(p1, p2, rightEdge);
				context.lineTo(isectR.x, isectR.y);
			} else if (p2.outL) { // p1 in and p2 out					p2 \~~~~~p1
				const isectL = lineIntersectSegment(p1, p2, leftEdge);
				context.lineTo(isectL.x, isectL.y);
			} else { // both in											p1~~~~~~~p2
				context.lineTo(p2.x, p2.y);
			}
		}
		p1 = p2;
	}
	context.fill("evenodd");
	context.closePath();
}

/**
 * 
 * @typedef Tile
 * TODO define the type
 */

/**
 * TODO move context parameter to .draw function
 * 
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides the 2D rendering
 * 	context for the drawing surface of a <canvas> element
 * @param {string | CanvasGradient | CanvasPattern } baseFillStyle - A property of the Canvas 2D API
 * 	which specifies the color, gradient, or pattern to use when drawing the created tile's background
 * @param {...VertexArrayPolygon} polygons 
 * @returns {Tile}
 */
function createTile(context, baseFillStyle, ...polygons) {
	polygons.unshift({ fillStyle: baseFillStyle, verts: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0] });
	const neighbors = new Array(4).fill({ isEmpty: true, color: "white" });
	const relations = new Array(4).fill({ toString: () => "no relation" });
	return {
		// draw: (tlx: number, tly: number, left: Line, right: Line, s: number) => undefined
		draw: function(tlx, tly, left, right, sideLength, orient) {
			let updater = getUpdater({ x: tlx, y: tly }, sideLength, orient);
			polygons.forEach(p => drawPolygon(p, left, right, updater, context));
		},
		// setPolygons: (plg: [Polygon]) => Tile
		setPolygons: function(...plg) {
			polygons = plg;
			return this;
		},
		isEmpty: false,
		nei: neighbors,
		rel: relations,
		linkTo: function(target, ori, direct, bothWays) {
			let i = direct.index();
			neighbors[i] = target;
			relations[i] = ori;
			if (bothWays) {
				let dir = direct.opposite().transferTo(ori);
				if (ori.verticalX && ori.negativeH != ori.negativeV) {
					ori = square(ori.negativeV, ori.negativeH, ori.verticalX);
				}
				target.linkTo(this, ori, dir, false);
			}
		},
		toString: () => baseFillStyle.toString()
	}
}

function startWalk(tile, orient) {
	return {
		canContinue: () => !tile.isEmpty,
		to: function(direct) {
			let i = direct.transferTo(orient).index();
			orient = takeStep(orient, tile.rel[i]);
			tile = tile.nei[i];
			return this;
		},
		jumpTo: function(t, o) {
			tile = t;
			orient = o;
			return this;
		},
		currTile: () => tile,
		currOri: () => orient
	}
}

function takeStep(ori, rel) {
	return (ori.verticalX && rel.negativeH != rel.negativeV)
		? square(ori.negativeH == rel.negativeH, ori.negativeV == rel.negativeV, ori.verticalX != rel.verticalX)
		: square(ori.negativeH != rel.negativeH, ori.negativeV != rel.negativeV, ori.verticalX != rel.verticalX);
}

/* use 'Cmd'+'/' here to toggle testing

(function main() {
	console.log(main);
	test_transferTo();
	let abc = ["A", "B", "C"].map(x => createTile(null, x));
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
	let walk = startWalk(abc[0], getOri(0));
	let seq = [1, 2, 0, 3];
	for (let i = 0; i < 6; ++i) {
		walk.to(getDir(seq[i % 4]));
	}
	console.assert(walk.currTile().toString() + walk.currOri().toString() == "A3",
		"Start at A in ori[0] and return to A in ori[3] after moving left, down, right, up, left, down");
}

// */
