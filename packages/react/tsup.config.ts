import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@carnil/core', 'react', 'react-dom', 'clsx', 'tailwind-merge'],
  treeshake: true,
  minify: false,
  output: {
    exports: 'named',
  },
});
