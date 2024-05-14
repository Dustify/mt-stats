import express from "express";
import path from "path";
import http from "http";

const app = express();

app.use(express.static(path.join(__dirname, "..", "..", "public")));

const server = http.createServer(app);
server.listen(3000);