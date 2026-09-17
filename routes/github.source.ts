import { Repository } from "#src/types.ts";
import { WebSource } from "@kuusi/kuusi";

const route = new WebSource({
  async GET(req) {
    const params = new URL(req.url).searchParams;
    const repoIDs = params.get("repoIDs")?.split(",");
    if (!repoIDs) {
      return new Response(null, {
        status: 400,
        statusText: "Please supply a repository ID.",
      });
    }

    const returnData: Record<string, Repository | null> = {};
    const db = await Deno.openKv("kv.sqlite3");
    const keys = repoIDs.map((repoID) => ["githubData", repoID]);

    const getGithubData = await db.getMany<Repository[]>(keys);

    for (const githubData of getGithubData) {
      const key = githubData.key[1] as string;
      returnData[key] = githubData.value;

      console.log(
        `\x1b[102m > \x1b[0m Returned Data: ${key}`,
        returnData,
      );
    }

    db.close();

    return new Response(JSON.stringify(returnData), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
});

export default route;
