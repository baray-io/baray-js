import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [dts({ include: ["lib"], exclude: ["src"] })],
	build: {
		lib: {
			entry: "./lib/index.ts",
			name: "Baray",
			fileName: "baray",
		},
	},
});
