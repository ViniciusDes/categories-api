import express, { Request, Response } from "express";
import categoryRoute from "./categories.route";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Service is running" });
});

router.use("/categories", categoryRoute);

export { router };
