import path from 'path';
const nextConfig = {
    reactCompiler: true,
    transpilePackages: ['@gp/shadcn'],
    turbopack: {
        root: path.join(__dirname, '..', '..'),
    },
};
export default nextConfig;
