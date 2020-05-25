
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    mode: "development", // "production" | "development" | "none"  // Chosen mode tells webpack to use its built-in optimizations accordingly.
    entry: './example/index.js', 
    output: {
      path: path.resolve(__dirname, "dist"), // string
    },
   
    module: {
        rules: [
            {
              test: /\.js$/,
              exclude: /(node_modules)/,
              use: {
                loader: 'babel-loader',
              }
            }
          ]
      },
 
    plugins: [
     new HtmlWebpackPlugin()
      ],
      devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9999,
        historyApiFallback: true
      }

}


