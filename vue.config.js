const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.BASE_URL,
  devServer: {
    port: 80, // 替换为你希望使用的端口
    proxy: {
      '/aaa': {
        target: 'http://47.104.217.174:8080', // 目标服务器地址
        changeOrigin: true, // 是否改变源
        pathRewrite: {
          '^/aaa': '' // 重写路径
        }
      }
    }
  }
})

module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    ],
  },
}