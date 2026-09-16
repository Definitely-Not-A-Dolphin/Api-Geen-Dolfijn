import { WebSource } from "@kuusi/kuusi";
import { Repository } from "#/src/types.ts";

const route = new WebSource({
  async GET(req) {
    const params = new URL(req.url).searchParams;
    const repoID = params.get("repoID");
    if (!repoID) {
      return new Response(null, {
        status: 400,
        statusText: "Please supply a repository ID.",
      });
    }

    const db = await Deno.openKv("kv.sqlite3");
    const getGithubData = await db.get(["githubData", repoID]);

    if (!getGithubData.versionstamp) {
      return new Response(null, {
        status: 500,
        statusText: "No data found for given repoID.",
      });
    }

    db.close();

    const returnData = getGithubData.value as Repository;

    console.log(
      `\x1b[102m > \x1b[0m Returned Data: ${returnData.fullName}`,
      returnData,
    );

    return new Response(JSON.stringify(returnData), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
});

export default route;
