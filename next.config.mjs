/** @type {import('next').NextConfig} */
const nextConfig = {
  // The hero is driven by an imperative GSAP/Pixi script that mutates the DOM.
  // Strict Mode's dev-only double mount would run it twice, so keep it off.
  reactStrictMode: false,
};
export default nextConfig;
