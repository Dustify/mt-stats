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

apiRouter.get("/util/:gatewayId", async (req, res) => {
    res.send(await storageService.GetUtil(req.params.gatewayId));
});

apiRouter.get("/packets/:gatewayId", async (req, res) => {
    res.send(await storageService.GetPackets(req.params.gatewayId));
});

apiRouter.get("/nodes/:gatewayId", async (req, res) => {
    res.send(await storageService.GetNodes(req.params.gatewayId));
});

apiRouter.get("/voltage/:gatewayId/:nodeId", async (req, res) => {
    const params = req.params;

    res.send(await storageService.GetVoltage(params.gatewayId, parseInt(params.nodeId)));
});

apiRouter.get("/senders/:gatewayId", async (req, res) => {
    res.send(await storageService.GetSenders(req.params.gatewayId));
});