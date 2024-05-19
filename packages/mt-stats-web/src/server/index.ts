import express from "express";
import path from "path";
import http from "http";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(dirname, "..", "..", "public")));

const server = http.createServer(app);
server.listen(3000);