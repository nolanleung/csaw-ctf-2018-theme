const webpack = require('webpack')
const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = 'development'

module.exports = {
  entry: './components/chalboard.js',
  output: {
    filename: 'chalboard.[hash].js',
    path: path.resolve(__dirname, '../../static/csaw2018/js'),
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader',
      },
      {
        test: /.scss/,
        loader: 'style-loader!css-loader!sass-loader',
      },
    ],
  },
  plugins: [
    function() {
      this.plugin('done', stats => {
        const files = fs.readdirSync('../../static/csaw2018/js').filter(file => {
          if (file !== 'chalboard.' + stats.hash + '.js') {
            return /chalboard.(.*).js/.test(file)
          } else {
            return false
          }
        })

        for (const file of files) {
          fs.unlinkSync('../../static/csaw2018/js/' + file)
        }

        const template = fs
          .readFileSync('../../templates/csaw2018/chals-base.html')
          .toString('utf8')
          .replace('__CHALBOARD_SCRIPT__', 'chalboard.' + stats.hash + '.js')
        fs.writeFileSync('../../templates/csaw2018/chals.html', template)
      })
    }
  ],
}
