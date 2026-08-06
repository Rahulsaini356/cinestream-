/* eslint-disable @typescript-eslint/no-require-imports */
// run-server.js
// Custom standalone server wrapper for CineStream production deployment.
// This resolves Render 502 Bad Gateway and Next.js standalone env loading issues.

const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env files (like next start does)
loadEnvConfig(process.cwd());

// On Render, the HOSTNAME environment variable is set to the internal hostname (e.g. srv-xxx).
// This causes Next.js standalone server to bind only to that host interface instead of 0.0.0.0,
// which prevents Render's reverse proxy (Nginx) from communicating with the container, leading to HTTP 502.
// Overriding process.env.HOSTNAME to '0.0.0.0' forces binding to all network interfaces.
process.env.HOSTNAME = '0.0.0.0';

console.log('Starting CineStream standalone production server...');
console.log(`Binds to HOSTNAME: ${process.env.HOSTNAME}, PORT: ${process.env.PORT || 3000}`);

// Run the Next.js standalone server
require('./.next/standalone/server.js');
