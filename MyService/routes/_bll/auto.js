var exports = module.exports;
function getRequire(name) {
	return require('../_dal/' + name + '_auto');
}
exports.save = function (name, params, conn) {
	return getRequire(name).save(params, conn).then(function (t) {
		return t[0][0].id;
	});
};

exports.del = function (name, params, conn) {
	return getRequire(name).del(params, conn);
};

exports.detailQuery = function (name, params, conn) {
	return getRequire(name).detailQuery(params, conn).then(function (t) {
		return t[0][0];
	});
};

exports.query = function (name, params, conn) {
	return getRequire(name).query(params, conn).then(function (t) {
		return {
			list: t[0],
			count: t[1][0].count,
		};
	});
};

