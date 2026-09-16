import { WebSource } from "@kuusi/kuusi";

const route = new WebSource({
  GET: () => {
    return new Response(
      JSON.stringify({
        message: "Tervetuloa Kuusella!",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      },
    );
  },
});

export default route;
