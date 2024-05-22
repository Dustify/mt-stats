import { Router } from "express";
import { IStorageService, PostgresStorageService } from "mt-stats-lib";

export const apiRouter = Router();

const storageService: IStorageService = new PostgresStorageService();
storageService.Connect();

apiRouter.get("/gateways", async (req, res) => {
    res.send(await storageService.GetGateways());
});

apiRouter.get("/signal/:gatewayId", async (req, res) => {
    res.send(await storageService.GetSignal(req.params.gatewayId));
});
