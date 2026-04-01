import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Local standalone dev helper only.
// Playground preview/deploy uses the custom in-memory Next runtime instead,
// so generated app code should not import OpenNext runtime APIs like
// @opennextjs/cloudflare or getRequestContext() for normal product features.
if (process.env.NODE_ENV !== 'production') {
	initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
};

export default nextConfig;
