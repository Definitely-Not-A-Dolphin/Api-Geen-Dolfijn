import { HackaTimeToday } from "#src/types.ts";
import { WebSource } from "@kuusi/kuusi";

const HACKATIME_ID = Deno.env.get("HACKATIME_ID")!;

const route = new WebSource({
  async GET() {
    const hackatimeResponse = await fetch(
      `https://hackatime.hackclub.com/api/hackatime/v1/users/${HACKATIME_ID}/statusbar/today`,
      {
        method: "GET",
        headers: {
          Authorization: Deno.env.get("HACKATIME_AUTH")!,
        },
      },
    );

    const hackatimeData = await hackatimeResponse.json() as HackaTimeToday;
    const parsedHackatimeData = hackatimeData.data.grand_total;

    if (parsedHackatimeData.text === "Start coding!") {
      parsedHackatimeData.text = "0s";
    }

    return new Response(JSON.stringify(parsedHackatimeData), {
      status: 200,
    });
  },
});

export default route;
