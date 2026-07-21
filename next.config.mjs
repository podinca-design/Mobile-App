/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/learning-hub-blog/long-term-care-single-divorced-widowed-planning",
        destination: "/learning-hub-blog/long-term-care-planning",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
