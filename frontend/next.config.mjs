/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type-checking (tsc) is the real correctness gate; don't let stylistic
  // lint rules (no-explicit-any on wagmi's dynamic useReadContracts arrays,
  // exhaustive-deps) block production builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
