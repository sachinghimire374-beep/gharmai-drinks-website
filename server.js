// Passenger (cPanel "Setup Node.js App") entry point.
// Next.js has no importable server module for `next start`, so this shells
// out to it and forwards the PORT Passenger assigns.
process.env.PORT = process.env.PORT || 3470;
require("child_process").execSync(
  `node_modules/.bin/next start -p ${process.env.PORT}`,
  { stdio: "inherit", env: process.env }
);
