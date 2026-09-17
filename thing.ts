new Deno.Command("kill", { args: [String(Deno.pid)] }).spawn();
