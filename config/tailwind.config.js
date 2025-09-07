import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  content: [
    resolve(__dirname, "../src/**/*.{js,ts,jsx,tsx}"),
    resolve(__dirname, "../index.html")
  ],
  theme: { 
    extend: {} 
  },
  plugins: [],
};