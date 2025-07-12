import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { loadEnv } from './src/lib/env.js';

loadEnv();
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-99725015ac6548d2b4f311643799fa78.r2.dev"
            }
        ]
    }
};

export default nextConfig;