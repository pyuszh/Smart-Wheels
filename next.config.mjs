/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
    // ✅ Keep existing settings and add the body size limit here
    serverActions: {
      bodySizeLimit: "20mb", 
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "havspjrygyyjwplzysbj.supabase.co",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' https://cffb2114-e0c1-4d92-9134-595c62a2864a.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;