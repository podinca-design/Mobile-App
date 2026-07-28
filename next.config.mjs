/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/business-continuity-mock",
        destination: "/business-continuity",
        permanent: true
      },
      {
        source: "/learning-hub-blog/long-term-care-single-divorced-widowed-planning",
        destination: "/learning-hub-blog/long-term-care-planning",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
