import express from "express";
import { config } from "dotenv";
import { Server } from "socket.io";
import db_connection from "./DB/connection.js";
import { gracefulShutdown } from "node-schedule";
import { cronJobOne } from "./src/Modules/Coupons/crons.utils.js";
import { estbalishSocketConnection } from "./src/Utils/socket.io.utils.js";
import { routerHandler } from "./router-handler.js";

export const main = async () => {
  config();
  const app = express();
  const port = process.env.PORT || 5000;

  routerHandler(app);
  db_connection();

  gracefulShutdown();
  cronJobOne();

  app.get("/", (req, res) => res.send("Hello World!"));
  const server = app.listen(port, () =>
    console.log(`Coomerceapp listening on port ${port}!`)
  );

  const io = estbalishSocketConnection(server);

  io.on("connection", (socket) => {
    console.log("User Connected: ", socket.id);
  });
};
