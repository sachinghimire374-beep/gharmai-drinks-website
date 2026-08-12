// Passenger (cPanel "Setup Node.js App") entry point.
// Runs Next.js in-process via its programmatic API instead of shelling out
// to the `next` CLI, so Passenger only has to spawn a single Node process.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3470;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
