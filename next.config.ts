import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // evita doble montaje en dev y reduce peticiones abortadas
};

export default nextConfig;
