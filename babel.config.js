export default {
  presets: [['@babel/preset-env', {
    targets: {
      node: '20'
    }
  }]],
  plugins: ['@babel/plugin-transform-runtime']
};