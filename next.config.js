const withPayload = require('./withPayload')
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = withPayload({
  reactStrictMode: true,
  experimental: {
    outputFileTracingIgnores: ['**swc/core**'], // See https://github.com/vercel/next.js/issues/42641#issuecomment-1320713368
  },
  images: {
    domains: [
      'localhost',
      'https://nextjs-vercel.payloadcms.com',
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_S3_ENDPOINT
    ],
  },
}, {
  configPath: path.resolve(__dirname, './payload/payload.config.ts'),
})

module.exports = nextConfig