import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        {
          type: "component",
          resolve: (name) => {
            if (name.startsWith("Sw")) {
              let dirName = name.replace("Sw", "");
              return {
                name: dirName,
                from: `@swhy/swhy-ui/es`,
                sideEffects: `@swhy/swhy-ui/es/${dirName}/style`,
              };
            }
          },
        },
      ],
    }),
  ],
  server: {
    host: true,
  },
});
