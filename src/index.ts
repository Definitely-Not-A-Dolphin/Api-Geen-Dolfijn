import { getKuusiRoutes, kuusi } from "@kuusi/kuusi";
import "./cron.ts";

const routes = await getKuusiRoutes();

Deno.serve({ port: 1296 }, async function (req) {
  console.log(req);
  return await kuusi(req, routes);
});
