/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/telegram',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/api/validate-user',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://web.telegram.org' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;