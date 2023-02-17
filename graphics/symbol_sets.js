const cellMargin = 15;
const blotColors = ["#DF6873", "#CB904D", "#539B94", "#3982BB", "#745EB3"];

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
 * @param {FillStyle} style
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
	return function (order, glyphSet, style) {
		glyphSet = [...glyphSet];
		const blotCount = (order * order) - glyphSet.length;
		const styles = new Array(glyphSet.length).fill(style);
		for (let i = 0; i < blotCount; ++i) {
			glyphSet.push(vertexArrays.blot)
			styles.push(blotColors[i % 5])
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

/**
 * @param {VertexArray} vertices 
 * @param {number} rotate - Number of 90 degree rotations.
 * @param {boolean} [reflect] 
 * @returns {VertexArray[]}
 */
function transformVertexArray(vertices, rotate, reflect = false) {
	let transforms = [vertices];
	if (rotate == 1) {
		const ninety = [];
		for (let i = 0; i < vertices.length; i += 2) {
			ninety.push(1 - vertices[i + 1]);
			ninety.push(vertices[i]);
		}
		transforms.push(ninety);
	}
	if (rotate > 0) {
		transforms = transforms.map(function (array) {
			const oneEighty = [];
			for (let i = 0; i < array.length; i += 2) {
				oneEighty.push(1 - array[i]);
				oneEighty.push(1 - array[i + 1]);
			}
			return oneEighty;
		}).concat(transforms);
	}
	if (reflect) {
		transforms = transforms.map(function (array) {
			const mirror = [];
			for (let i = 0; i < array.length; i += 2) {
				mirror.push(1 - array[i]);
				mirror.push(array[i + 1]);
			}
			return mirror;
		}).concat(transforms);
	}
	return transforms;
}

const symbolSets = (function () {
	// const buildSet = buildSetsWithOrder(1, 3);
	const buildSet = buildSetsWithOrder(1, 3, 9);
	const fourThrees = transformVertexArray(vertexArrays.quantico[3], 1);
	const eightEffs = transformVertexArray(vertexArrays.quantico[0], 1, true);
	return {
		heartSet: buildSet(1, [vertexArrays.snake], "black"),
		nineDigits: buildSet(3, vertexArrays.quantico.slice(1), "black"),
		threeSet: buildSet(3, fourThrees, "black"),
		// right, down, left (3), up, black, red, green, blue, purple
		effSet: buildSet(3, eightEffs, "black"),
		setTest: buildSet(9, vertexArrays.quantico.slice(1).concat(fourThrees), "black")
	};
})();
