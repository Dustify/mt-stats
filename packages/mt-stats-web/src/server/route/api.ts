import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/gateways", (req, res) => {
    res.send("shit");
});

