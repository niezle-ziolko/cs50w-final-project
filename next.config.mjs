import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { loadEnv } from './src/lib/env.js';

loadEnv();
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;