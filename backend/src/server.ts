import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import axios from "axios";
import agenda from "./controllers/agenda";

import express, { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import "express-async-errors";

import apiRouter from "./routes/api";
import logger from "jet-logger";
import { CustomError } from "@shared/errors";

// **** Variables **** //

const app = express();

// **** Set basic express settings ****# //

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === "production") {
    app.use(helmet());
}

(async function () {
    // IIFE to give access to async/await
    await agenda.start();
    // agenda.now("test me");
})();

// **** Add API Routes ****# //

// Add api router
app.use("/api", apiRouter);

// Error handling
app.use(
    (err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
        logger.err(err, true);
        const status =
            err instanceof CustomError
                ? err.HttpStatus
                : StatusCodes.BAD_REQUEST;
        return res.status(status).json({
            error: err.message
        });
    }
);

// **** Export default **** //

export default app;
