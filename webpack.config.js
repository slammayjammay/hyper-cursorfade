module.exports = {
	mode: 'production',
	entry: `${__dirname}/src/index.js`,
	output: {
		path: `${__dirname}/lib`,
		filename: 'built.js',
		libraryTarget: 'commonjs'
	},
	target: 'node'
};
