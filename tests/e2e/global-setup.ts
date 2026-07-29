import { createServer } from "node:http";

import next from "next";

const hostname = "127.0.0.1";
const port = 3100;

export default async function globalSetup() {
  const app = next({
    dev: false,
    dir: process.cwd(),
    hostname,
    port
  });

  await app.prepare();

  const server = createServer(app.getRequestHandler());
  server.on("upgrade", app.getUpgradeHandler());

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, hostname, resolve);
  });

  return async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
      server.closeAllConnections();
    });

    await app.close();
  };
}
