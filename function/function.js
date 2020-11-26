const deepClone = (obj) => {
	if (obj === null || typeof obj !== 'object') return obj;
	var cpObj = obj instanceof Array ? [] : {};
	for (var key in obj) cpObj[key] = deepClone(obj[key]);
	return cpObj;
}
exports.deepClone = deepClone