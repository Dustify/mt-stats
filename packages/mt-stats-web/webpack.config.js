import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

export default {
  entry: './dist/client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(dirname, 'public'),
  },
};
