const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const path = require('path');
const mockModulePath = path.resolve(__dirname, './mocks/emptyModule.js');
const mockCloudStoragePath = path.resolve(__dirname, './mocks/cloudStorage.js');
const customCSSMockPath = path.resolve(__dirname, './mocks/custom.css'); 

const withPayload = async (config, paths) => {
  const { configPath, cssPath, payloadPath } = paths;

  return {
    ...config,
    experimental: {
      ...config.experimental,
      appDir: true,
    },
    webpack: (webpackConfig, webpackOptions) => {
      const incomingWebpackConfig = typeof config.webpack === 'function' ? config.webpack(webpackConfig, webpackOptions) : webpackConfig;

      incomingWebpackConfig.module.rules.push({
        oneOf: [
          {
            test: /\.(?:ico|gif|png|jpg|jpeg|woff(2)?|eot|ttf|otf|svg)$/i,
            type: 'asset/resource',
          },
        ],
      })

      incomingWebpackConfig.module.rules.push({
        test: /\.(?:ico|gif|png|jpg|jpeg|woff(2)?|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
      })

      let newWebpackConfig = {
        ...incomingWebpackConfig,
        plugins: [
          ...incomingWebpackConfig.plugins || [],
          new FilterWarningsPlugin({
            exclude: [/Critical dependency/, /require.extensions/]
          })
        ],
        resolve: {
          ...incomingWebpackConfig.resolve,
          alias: {
            ...incomingWebpackConfig.resolve.alias,
            '@payloadcms/next-payload/getPayload': payloadPath || path.resolve(process.cwd(), './payload.ts'),
            'payload-config': configPath,
            payload$: mockModulePath,
            'payload-user-css': cssPath || customCSSMockPath,
          }
        }
      }


      newWebpackConfig.resolve.alias['@payloadcms/plugin-cloud-storage/s3'] = mockCloudStoragePath
      newWebpackConfig.resolve.alias['@payloadcms/plugin-cloud-storage'] = mockCloudStoragePath

      return newWebpackConfig;
    },
    transpilePackages: [
      ...config.transpilePackages || [],
      '@payloadcms/next-payload',
      // 'payload',
      // 'mongoose'
    ]
  }
}

module.exports = withPayload