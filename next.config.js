/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'cdn.pixabay.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'www.gravatar.com',
    ],
  },
};

module.exports = nextConfig;
