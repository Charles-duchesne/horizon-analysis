/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-markdown'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
