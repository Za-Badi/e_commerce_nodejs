import { Server } from "socket.io";


let io = null;
// estbalish connection
export const estbalishSocketConnection = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      //   methods: ["GET", "POST"],
    },
  });
  return io;
};

// return io parameter
export const getSocket   = () => {
  return io;
}