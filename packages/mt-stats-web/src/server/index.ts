import express from "express";
import path from "path";
import http from "http";

import { fileURLToPath } from 'url';
import { apiRouter } from "./route/api.js";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(dirname, "..", "..", "public")));

app.use("/api", apiRouter);

const server = http.createServer(app);
server.listen(3000);