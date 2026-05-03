module.exports = async (req, res) => {
	const mod = await import('../backend/api/index.js');
	return mod.default(req, res);
};
