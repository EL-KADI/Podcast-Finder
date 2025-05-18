/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'is1-ssl.mzstatic.com', 
      'is2-ssl.mzstatic.com', 
      'is3-ssl.mzstatic.com', 
      'is4-ssl.mzstatic.com', 
      'is5-ssl.mzstatic.com',
      'megaphone.imgix.net',
      'ssl-static.libsyn.com',
      'd3t3ozftmdmh3i.cloudfront.net',
      'pbcdn1.podbean.com',
      'feeds.buzzsprout.com',
      'content.production.cdn.art19.com',
      'image.simplecastcdn.com',
      'assets.pippa.io',
      'media.wnyc.org',
      'f.prxu.org',
      'cdn.simplecast.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
