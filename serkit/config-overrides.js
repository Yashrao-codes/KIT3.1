module.exports = function override(config, env) {
  if (env === 'production') {
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      exclude: /node_modules/,
    });
  }
  return config;
}
