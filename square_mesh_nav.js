let debugMode = 1;

/**
 * A point on the xy-plane. Defined like: "const p = { x: 24, y: 25 };". The
 * optional outL and outR properties are flags used in the drawPolygon function.
 * @typedef Point
 * @property {number} x - This point's x-coordinate.
 * @property {number} y - This point's y-coordinate.
 * @property {boolean} [outL] - True if this point is "out to the left".
 * @property {boolean} [outR] - True if this point is "out to the right".
 */

/**
 * A line defined by a pair of two-dimensional points. The equation of the line
 * is: "y = (x - a.x) * (b.y - a.y) / (b.x - a.x) + a.y".
 * @typedef TwoPointLine
 * @property {Point} a - The first unique point on this line.
 * @property {Point} b - The second unique point on this line.
 */

/**
 * Determines if the given point's x-coordinate is greater than or less than the
 * x-value of the given line at the same y-value. The original equation contains
 * division by (b.y - a.y), so multiply everything by the square of that
 * denominator to remove division from the equation. Instead of multiplying by
 * the square (n * n), (n * Math.sign(n)) could also be used.
 * @param {Point} p - The point to be compared with a given line.
 * @param {TwoPointLine} - The line to be compared with a given point.
 * @returns {number} A number greater than zero if the point is to the right of
 * the line (more specifically, further in the direction of the positive
 * x-axis). Otherwise, a negative number means the point is to the left, and a
 * return value of zero means the point is on the line.
 */
function comparePointLine(p, { a, b }) {
	const denom = b.y - a.y;
	return (denom * (p.x - a.x) - (p.y - a.y) * (b.x - a.x)) * denom;
}

/**
 * Finds the intersection point of two lines. One line is given, and the other
 * is the extension of the line segment between two given points.
 * @param {Point} p - The first of the two points which define the first line.
 * @param {Point} q - The second of the two points which define the first line.
 * @param {TwoPointLine} - The second line, given in two-point form.
 * @returns {Point} The 2D point of intersection.
 */
function lineIntersectSegment(p, q, { a, b }) {
	const n1 = p.x * q.y - p.y * q.x;
	const n2 = a.x * b.y - a.y * b.x;
	const n3 = (p.x - q.x) * (a.y - b.y) - (p.y - q.y) * (a.x - b.x);
	return {
		x: (n1 * (a.x - b.x) - (p.x - q.x) * n2) / n3,
		y: (n1 * (a.y - b.y) - (p.y - q.y) * n2) / n3
	};
}

/**
 * An object consisting of three booleans, used to represent one of the eight
 * symmetries of something similar a square. For example, as long as one axis is
 * horizontal while the other is vertical, the xy-plane can be oriented in eight
 * different ways. A default orientation is three false booleans.
 * @typedef SquareSymmetry
 * @property {boolean} negativeH - True if the horizontal axis is flipped.
 * @property {boolean} negativeV - True if the vertical axis is flipped.
 * @property {boolean} verticalX - True if the x-axis is vertical.
 * @property {() => string} toString - A function which returns a string
 * containing a single digit in the range [0, 7]. 
 */

/**
 * @param {boolean} negH - True if the horizontal axis should be flipped.
 * @param {boolean} negV - True if the vertical axis should be flipped.
 * @param {boolean} verX - True if the x-axis should be vertical.
 * @returns {SquareSymmetry} A SquareSymmetry object constructed from the three
 * given booleans.
 */
function square(negH, negV, verX) {
	return {
		negativeH: negH,
		negativeV: negV,
		verticalX: verX,
		toString: () => (negH + negV * 2 + verX * 4).toString()
	};
}

/**
 * @param {number} i - A non-negative integer.
 * @returns {SquareSymmetry} A SquareSymmetry object that corresponds to the
 * given integer. This correspondence matches that of the SquareSymmetry
 * toString method.
 */
function getOri(i) {
	return square(i % 2 > 0, i % 4 > 1, i % 8 > 3);
}

/**
 * An object consisting of two booleans and some helper methods, used to
 * represent one of the four cardinal directions.
 * @typedef Cardinal
 * @property {boolean} isNegative - True if this cardinal points in a negative
 * direction, and false otherwise. On a computer screen, the negative directions
 * are usually left and up.
 * @property {boolean} isVertical - True if this cardinal is vertical.
 * @property {() => number} index - A function that returns this cardinal as a
 * number. This number can be written in binary, where the two bits are the
 * values of isNegative and isVertical.
 * @property {() => Cardinal} opposite - A function that returns a new cardinal,
 * pointing opposite to this one. The isNegative boolean is flipped.
 * @property {(s: SquareSymmetry) => Cardinal} transferTo - If this cardinal is
 * etched into the symmetry object, what direction is it pointing in when the
 * square is in its default position? This function returns that cardinal.
 * @property {() => string} toString - A two character pictorial representation
 * of this cardinal direction. The possible outputs are "->", "<-", "\/", "/\".
 */

/**
 * @param {boolean} negC - True if the cardinal points in a negative direction.
 * @param {boolean} verC - True if the cardinal is vertical.
 * @returns {Cardinal} A cardinal direction constructed from two booleans.
 */
function cardinal(negC, verC) {
	return {
		isNegative: negC,
		isVertical: verC,
		index: () => negC + verC * 2,
		opposite: () => cardinal(!negC, verC),
		transferTo: s => cardinal(
			negC != (verC ? s.negativeV : s.negativeH),
			verC != s.verticalX
		),
		toString: () => verC ? negC ? "/\\" : "\\/" : negC ? "<-" : "->"
	};
}

/**
 * @param {number} i - A non-negative integer.
 * @returns {Cardinal} A cardinal direction corresponding to the given integer.
 */
function getDir(i) {
	return cardinal(i % 2 > 0, i % 4 > 1);
}

/**
 * Any function which takes two coordinates, both in the range between 0 and 1
 * (inclusive), and returns a point on the xy-plane.
 * @callback PointUpdater
 * @param {number} xCoord - A floating-point number between 0 and 1 which is the
 * x-coordinate of the input point.
 * @param {number} yCoord - A floating-point number between 0 and 1 which is the
 * y-coordinate of the input point.
 * @returns {Point} A new point, an updated version of the input.
 */

/**
 * The return value of this function, the updater function, takes as input a
 * point in the unit square. The parameters of this function determine how any
 * point in the input space will be transformed (scaled, translated, rotated, or
 * reflected) into a new point in the output space. The output space is a square
 * defined by the given side length and top left point.
 * @param {number} tlx - The x-coordinate of the output square's top left point.
 * @param {number} tly - The y-coordinate of the output square's top left point.
 * @param {number} sideLength - The side length of the output square.
 * @param {SquareSymmetry} orient - One of eight different ways to rotate and
 * reflect the input.
 * @returns {PointUpdater} A function which takes a point in the input square
 * and returns its corresponding point in the output square.
 */
function getUpdater(tlx, tly, sideLength, orient) {
	const updateX = orient.negativeH ? (n => 1 - n) : (n => n);
	const updateY = orient.negativeV ? (n => 1 - n) : (n => n);
	if (orient.verticalX) {
		return function updater(xCoord, yCoord) {
			return {
				x: sideLength * updateX(yCoord) + tlx,
				y: sideLength * updateY(xCoord) + tly,
				outL: false, outR: false
			};
		};
	}
	return function updater(xCoord, yCoord) {
		return {
			x: sideLength * updateX(xCoord) + tlx,
			y: sideLength * updateY(yCoord) + tly,
			outL: false, outR: false
		};
	};
}

/**
 * A property of the Canvas 2D API which specifies the color, gradient, or
 * pattern to use when drawing.
 * @typedef {string | CanvasGradient | CanvasPattern} FillStyle
 */

/**
 * An array with an even number of elements (at least four) which represent 2D
 * point coordinates. e.g. [x0, y0, x1, y1, x2, y2...]
 * @typedef {number[]} VertexArray
 */

/**
 * Defines a polygon by its appearance and an ordered list of its vertices.
 * @typedef VertexArrayPolygon
 * @property {FillStyle} fillStyle - The fill style of this polygon.
 * @property {VertexArray} verts - The vertices that make up this polygon.
 */

/**
 * Draws a given polygon at a given canvas location. The updater function is
 * used to move the polygon vertices around, and the two given lines define the
 * area the polygon can be drawn into.
 * @param {VertexArrayPolygon} plg - A template of the polygon to be drawn.
 * @param {TwoPointLine} edgeL - Cut off the parts of the updated polygon that
 * are to the left of this line.
 * @param {TwoPointLine} edgeR - Cut off the parts of the updated polygon that
 * are to the right of this line.
 * @param {PointUpdater} updater - A function to transform the template
 * polygon's generic vertices into specific points on the canvas.
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides
 * the 2D rendering context for the drawing surface of a canvas element.
 */
function drawPolygon(plg, edgeL, edgeR, updater, context) {
	context.fillStyle = plg.fillStyle;
	context.beginPath();
	let p1 = updater(plg.verts[0], plg.verts[1]);
	if (comparePointLine(p1, edgeL) < 0) {
		p1.outL = true;
		const nextPoint = updater(plg.verts[2], plg.verts[3]);
		const isectL = lineIntersectSegment(p1, nextPoint, edgeL);
		context.moveTo(isectL.x, isectL.y);
	} else if (comparePointLine(p1, edgeR) > 0) {
		p1.outR = true;
		const nextPoint = updater(plg.verts[2], plg.verts[3]);
		const isectR = lineIntersectSegment(p1, nextPoint, edgeR);
		context.moveTo(isectR.x, isectR.y);
	} else {
		context.moveTo(p1.x, p1.y);
	}
	for (let i = 2; i < plg.verts.length; i += 2) {
		const p2 = updater(plg.verts[i], plg.verts[i + 1]);
		if (comparePointLine(p2, edgeL) < 0) {
			p2.outL = true;
		} else {
			p2.outR = comparePointLine(p2, edgeR) > 0;
		}
		if (p1.outL) {
			if (p2.outR) {
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(isectR.x, isectR.y);
			} else if (!p2.outL) {
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				context.lineTo(isectL.x, isectL.y);
				context.lineTo(p2.x, p2.y);
			}
		} else if (p1.outR) {
			if (p2.outL) {
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(isectL.x, isectL.y);
			} else if (!p2.outR) {
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
				context.lineTo(p2.x, p2.y);
			}
		} else {
			if (p2.outR) {
				const isectR = lineIntersectSegment(p1, p2, edgeR);
				context.lineTo(isectR.x, isectR.y);
			} else if (p2.outL) {
				const isectL = lineIntersectSegment(p1, p2, edgeL);
				context.lineTo(isectL.x, isectL.y);
			} else {
				context.lineTo(p2.x, p2.y);
			}
		}
		p1 = p2;
	}
	context.fill("evenodd");
	// /* Makes it easier to see the borders between polygons
	if (debugMode) {
		context.stroke();
	} // */
	context.closePath();
}

/**
 * @callback TileLinker
 * @param {Tile} target - The tile that this tile should be linked to.
 * @param {Cardinal} dir - If this tile is in default orientation, then this
 * cardinal is the direction to walk in to get to the target tile.
 * @param {SquareSymmetry} ori - If this tile is in default orientation, then
 * this parameter is the SquareSymmetry object representing how the target tile
 * should be oriented in relation to this tile.
 * @param {boolean} [andBack] - Defaults to true, and determines whether or not
 * to link the target back to this tile. If true, another TileLinker will be
 * called to make the link go both ways. The andBack value of the second
 * function call will be false.
 * @returns {Tile} - The tile from which this function was called upon.
 */

/**
 * @callback TileDrawer
 * @param {PointUpdater} updater - A function passed along to drawPolygon each
 * time a polygon that is part of this tile needs to be drawn.
 * @param {TwoPointLine} edgeL - Cut off tile parts that are left of this line.
 * @param {TwoPointLine} edgeR - Cut off tile parts that are right of this line.
 * @param {CanvasRenderingContext2D} ctx - Part of the Canvas API, provides the
 * 2D rendering context for the drawing surface of a canvas element.
 */

/**
 * Tiles are the building blocks of a walkable space. Kind of like the nodes of
 * a graph. A tile has a cosmetic appearance and connections to other tiles.
 * @typedef Tile
 * @property {() => boolean} isEmpty - A function that reports whether or not
 * this tile is complete. A tile's neighbors are initially empty.
 * @property {TileLinker} linkTo - Connects this tile to its new neighbor, and
 * then returns this tile. The link can be directed or undirected.
 * @property {TileDrawer} draw - Draws this tile, making use of edges which
 * control how much of the tile is drawn.
 * @property {(fs: FillStyle) => Tile} insertBase - Inserts a background
 * polygon, which is simply a square the size of the tile, to the front of the
 * polygons array. Returns this tile.
 * @property {Tile[]} nei - The four tiles adjacent to this one.
 * @property {SquareSymmetry[]} rel - The orientations of the neighbor tiles
 * relative to this tile in its default orientation.
 * @property {number} id - An identification number for this tile.
 * @property {() => string} toString - Returns the name that was given to this
 * tile when it was created.
 */

/**
 * The tile constructing function.
 * @param {VertexArrayPolygon} polygons - The polygons that make up the visual
 * content of the constructed tile.
 * @param {string} [name] - A name can be provided, otherwise the constructed
 * tile's default name is "tile_string".
 * @param {number} [id] - An optional identification number, defaults to -1.
 * @returns {Tile} The constructed tile object, with no connections.
 */
function createTile(polygons, name = "tile_string", id = -1) {
	const neighbors = new Array(4).fill({ isEmpty: () => true });
	const relations = new Array(4).fill(null);
	return {
		isEmpty: () => false,
		linkTo: function (target, dir, ori, andBack = true) {
			const i = dir.index();
			neighbors[i] = target;
			relations[i] = ori;
			if (andBack) {
				const back = dir.opposite().transferTo(ori);
				if (ori.verticalX && ori.negativeH != ori.negativeV) {
					ori = square(ori.negativeV, ori.negativeH, ori.verticalX);
				}
				target.linkTo(this, back, ori, false);
			}
			return this;
		},
		draw: function (updater, edgeL, edgeR, ctx) {
			polygons.forEach(function (p) {
				if (p != null) {
					drawPolygon(p, edgeL, edgeR, updater, ctx);
				}
			});
		},
		insertBase: function (fs) {
			polygons.unshift({ fillStyle: fs, verts: vertexArrays.square });
			return this;
		},
		nei: neighbors,
		rel: relations,
		id: id,
		toString: () => name
	};
}

/**
 * Finds the current orientation of a destination, given the current orientation
 * of the start location and the relative orientation of the destination.
 * @param {SquareSymmetry} ori - The current orientation of the start location.
 * @param {SquareSymmetry} rel - The orientation of the destination relative to
 * the start location in its default orientation.
 * @returns {SquareSymmetry} - The current orientation of the destination.
 */
function takeStep(ori, rel) {
	if (ori.verticalX && rel.negativeH != rel.negativeV) {
		return square(
			ori.negativeH == rel.negativeH,
			ori.negativeV == rel.negativeV,
			ori.verticalX != rel.verticalX
		);
	}
	return square(
		ori.negativeH != rel.negativeH,
		ori.negativeV != rel.negativeV,
		ori.verticalX != rel.verticalX
	);
}

/**
 * An object to control walking along the connections between tiles. Stores the
 * tile that the walker is currently on, as well as the orientation of that tile
 * from the view of the walker.
 * @typedef Walk
 * @property {() => boolean} canContinue - A function that returns false if the
 * current tile is empty, and true otherwise.
 * @property {(direct: Cardinal) => boolean} attempt - Tries to move in the
 * given direction, from the current tile to one of it's neighbors. If the
 * current tile's relation to the destination tile is not defined, then this
 * walk does not change and this function returns false. Otherwise, the walk is
 * updated and the function returns true.
 * @property {(direct: Cardinal) => Walk} to - Moves in the given direction from
 * the current tile to one of it's neighbors. The correct neighbor is determined
 * by the current orientation as well as the given direction. Returns this walk.
 * @property {(t: Tile, o: SquareSymmetry) => Walk} from - Sets the current tile
 * and orientation to the given values, and returns this walk.
 * @property {() => Tile} currTile - A getter function for the current tile.
 * @property {() => SquareSymmetry} currOri - A getter function for the current
 * orientation.
 */

/**
 * Creates a walk object from the two given parameters. These values can be set
 * by the walk's "from" function, so they are optional.
 * @param {Tile} [tile] - The start tile of the walk.
 * @param {SquareSymmetry} [orient] - The initial orientation of the walk.
 * @returns {Walk} The constructed walk object.
 */
function startWalk(tile, orient) {
	return {
		canContinue: () => !tile.isEmpty(),
		attempt: function (direct) {
			const i = direct.transferTo(orient).index();
			if (tile.rel[i] != null) {
				orient = takeStep(orient, tile.rel[i]);
				tile = tile.nei[i];
				return true;
			}
			return false;
		},
		to: function (direct) {
			const i = direct.transferTo(orient).index();
			if (tile.rel[i] != null) {
				orient = takeStep(orient, tile.rel[i]);
			}
			tile = tile.nei[i];
			return this;
		},
		from: function (t, o) {
			tile = t;
			orient = o;
			return this;
		},
		currTile: () => tile,
		currOri: () => orient
	};
}

/**
 * Compares the steepness of the slopes of two lines. The statement
 * "compareSlope(f, g) > 0" is true if and only if f is steeper than g. 
 * @param {TwoPointLine} - The first of two lines.
 * @param {TwoPointLine} - The second of two lines.
 * @returns {number} A number greater than zero if line1 is steeper than line2.
 * Returns zero if the two lines have the same slope (absolute value), and a
 * number less than zero if line2 is steeper than line1.
 */
function compareSlope({ a, b }, { a: c, b: d }) {
	const semiSlope2 = Math.abs((b.x - a.x) * (d.y - c.y));
	return Math.abs((d.x - c.x) * (b.y - a.y)) - semiSlope2;
}

/**
 * Draws the tiles in the portion of a walkable space that can be seen by a
 * single viewer in their current location. This is done by walking along
 * branches of tiles, and drawing the visible portion of each one.
 * @param {Tile} walk - A walk object that describes the tile the viewer starts
 * on. Before returning, the walk object is reset to its original state.
 * @param {Point} pTL - The coordinates of the starting tile's top left corner.
 * @param {Point} origin - The screen coordinates of the viewer's location,
 * where their eyesight originates from.
 * @param {number} len - The side length of a tile.
 * @param {number[]} limits - An array of four numbers, limiting the size of the
 * tile tree. The numbers determine the maximum number of steps that can be
 * taken in a single cardinal direction, and are ordered east, west, south,
 * north. The largest viewable area is a rectangle has a height of (limits[2] +
 * limits[3] + 1) tiles and a width of (limits[0] + limit[1] + 1) tiles. 
 * @param {CanvasRenderingContext2D} context - Part of the Canvas API, provides
 * the 2D rendering context for the drawing surface of a canvas element.
 */
function tileTree(walk, pTL, origin, len, limits, context) {
	const pBR = { x: pTL.x + len, y: pTL.y + len };
	const xTop = { a: pTL, b: { x: pTL.x + 1, y: pTL.y } };
	const xBot = { a: pBR, b: { x: pBR.x + 1, y: pBR.y } };
	const yLef = { a: pTL, b: { x: pTL.x, y: pTL.y + 1 } };
	const yRig = { a: pBR, b: { x: pBR.x, y: pBR.y + 1 } };
	const axes = [yLef, xTop, yLef, xBot, xTop, yRig, xBot, yRig];
	const startTile = walk.currTile();
	const startOri = walk.currOri();
	const directions = [0, 2, 0, 3, 2, 1, 3, 1].map(getDir);
	for (let i = 0; i < 4; ++i) {
		const cr = i & 1;
		const cb = i > 1;
		const crSign = cr ? -1 : 1;
		const cbSign = cb ? -1 : 1;
		const xLim = limits[cr * (2 + cb)];
		const yLim = limits[!cr * (1 + cb) + 1];
		walk.from(startTile, startOri);
		let nextX = pTL.x + len * cr;
		let nextY = pTL.y + len * cb;
		branch(nextX, nextY, axes[i], axes[i + 4], xLim, yLim);

		/**
		 * A recursive function that usually draws a single tile each time it is
		 * called. Draws tiles in one of four diagonal directions, starting at a
		 * base point and branching out. The area visible along a branch becomes
		 * more restricted by the two edges as the walk gets further from the
		 * origin. 
		 * @param {number} cx - The y-coordinate of this branch's base point.
		 * @param {number} cy - The y-coordinate of this branch's base point.
		 * @param {TwoPointLine} edgeL - The starting left boundary of the
		 * viewer's sight down this branch segment.
		 * @param {TwoPointLine} edgeR - The starting right boundary of the
		 * viewer's sight down this branch segment.
		 * @param {number} xRem - The number of times that the tile tree's walk
		 * can move in the current branch's x direction.
		 * @param {number} yRem - The number of times that the tile tree's walk
		 * can move in the current branch's y direction.
		 */
		function branch(cx, cy, edgeL, edgeR, xRem, yRem) {
			const tile = walk.currTile();
			const orient = walk.currOri();
			nextX = cx + len * crSign;
			nextY = cy + len * cbSign;
			const newEdge = { a: origin, b: { x: nextX, y: nextY } };
			if (i == 0 || yRem != yLim && (i < 3 || xRem != xLim)) {
				nextX = cx + len * cr * crSign;
				nextY = cy + len * cb * cbSign;
				const updater = getUpdater(nextX, nextY, len, orient);
				tile.draw(updater, edgeL, edgeR, context);
			}
			walk.to(directions[i]);
			if (xRem > 0 && walk.canContinue()) {
				let newLeft = newEdge;
				if (compareSlope(newEdge, edgeL) * crSign > 0) {
					newLeft = edgeL;
				}
				if (compareSlope(newLeft, edgeR) * crSign > 0) {
					nextX = cx + len * !cr * crSign;
					nextY = cy + len * cr * cbSign;
					branch(nextX, nextY, newLeft, edgeR, xRem - 1, yRem);
				}
			}
			walk.from(tile, orient).to(directions[i + 4]);
			if (yRem > 0 && walk.canContinue()) {
				if (compareSlope(newEdge, edgeR) * crSign > 0) {
					edgeR = newEdge;
				}
				if (compareSlope(edgeL, edgeR) * crSign > 0) {
					nextX = cx + len * cr * crSign;
					nextY = cy + len * !cr * cbSign;
					branch(nextX, nextY, edgeL, edgeR, xRem, yRem - 1);
				}
			}
		}
	}
	walk.from(startTile, startOri);
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
	console.assert(getDir(1).transferTo(getOri(0)).toString() == "<-",
		"\"<-\" transferred to ori[0] should be \"<-\"");
	console.assert(getDir(2).transferTo(getOri(4)).toString() == "->",
		"\"\\/\" transferred to ori[4] should be \"->\"");
	console.assert(getDir(0).transferTo(getOri(6)).toString() == "\\/",
		"\"->\" transferred to ori[6] should be \"\\/\"");
	console.assert(getDir(3).transferTo(getOri(2)).toString() == "\\/",
		"\"/\\\" transferred to ori[2] should be \"\\/\"");
}

function test_linkTo(abc) {
	abc[0].linkTo(abc[1], getDir(0), getOri(0), true);
	abc[0].linkTo(abc[1], getDir(2), getOri(6), true);
	abc[2].linkTo(abc[0], getDir(3), getOri(2), true);
	abc[1].linkTo(abc[2], getDir(3), getOri(0), true);
	abc[2].linkTo(abc[0], getDir(0), getOri(0), true);
	abc[1].linkTo(abc[1], getDir(2), getOri(2), false);
	abc[2].linkTo(abc[0], getDir(1), getOri(1), false);
	console.assert(abc[1].rel[1].toString() == "0",
		"B's \"<-\" relation should be ori[0]");
	console.assert(abc[1].rel[0].toString() == "5",
		"B's \"->\" relation should be ori[5]");
	console.assert(abc[0].rel[3].toString() == "2",
		"B's \"/\\\" relation should be ori[2]");
	console.assert(abc[0].nei.map(x => x.toString()).join() == "B,C,B,C",
		"A's neighbor array should be [B, C, B, C]");
	console.assert(abc[1].nei.map(x => x.toString()).join() == "A,A,B,C",
		"B's neighbor array should be [A, A, B, C]");
	console.assert(abc[2].nei.map(x => x.toString()).join() == "A,A,B,A",
		"C's neighbor array should be [A, A, B, A]");
}

function test_walkTo(abc) {
	const w = startWalk(abc[0], getOri(0));
	const seq = [1, 2, 0, 3];
	for (let i = 0; i < 6; ++i) {
		w.to(getDir(seq[i % 4]));
	}
	console.assert(w.currTile().toString() + w.currOri().toString() == "A3",
		"Move <-, \\/, ->, /\\, <-, \\/ from A in ori[0] and return in ori[3]");
}

// */
