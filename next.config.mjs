import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import { loadEnv } from './src/lib/env.js';

loadEnv();
setupDevPlatform().catch(console.error);

/** @type {import('next').NextConfig} */
const nextConfig = {
  
};

export default nextConfig;