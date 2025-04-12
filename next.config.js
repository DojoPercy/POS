/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            }
        ]
    },
    images: {
        domains: ['res.cloudinary.com'],
      },
}

module.exports = nextConfig
