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

/**
 * 
 * @param {number} order 
 * @param {VertexArray} borderVerts 
 * @returns {VertexArrayPolygon[][]}
 */
function boardSymbols(order, borderVerts) {
	const plainCell = cellSymbols(order, vertexArrays.square);
	return [
		plainCell.map(toPolygon("white")),
		plainCell.map(toPolygon("lightsteelblue")),
		cellSymbols(order, borderVerts).map(toPolygon("coral"))
	];
}

/**
 * @callback SymbolSetConstructor
 * @param {number} order
 * @param {VertexArray[]} glyphSet
 * @param {...FillStyle} styles
 * @returns {SymbolSet}
 */

/**
 * 
 * @param {...number} orders 
 * @returns {SymbolSetConstructor}
 */
function buildSetsWithOrder(...orders) {
	const borderWidth = 1.03 / cellMargin;
	const borderVerts = vertexArrays.square.map(function (coordinate) {
		return coordinate > 0 ? borderWidth + 1 : -borderWidth;
	});
	const sharedSymbols = [];
	orders.forEach(ord => sharedSymbols[ord] = boardSymbols(ord, borderVerts));
	return function (order, glyphSet, ...styles) {
		for (let i = styles.length; i < glyphSet.length; ++i) {
			styles.push(styles[styles.length - 1]);
		}
		return {
			whiteCell: sharedSymbols[order][0],
			blueCell: sharedSymbols[order][1],
			cellBorder: sharedSymbols[order][2],
			cellGlyph: glyphSet.map(function (glyph, i) {
				return cellSymbols(order, glyph).map(toPolygon(styles[i]));
			})
		};
	};
}

const symbolSets = (function () {
	const buildSet = buildSetsWithOrder(1, 3);
	return {
		heartSet: buildSet(1, [vertexArrays.snake], "black"),
		nineDigits: buildSet(3, vertexArrays.quantico.slice(1), "black")
	};
})();
