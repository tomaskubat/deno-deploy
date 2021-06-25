import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { router } from "./router.ts"
import { MiddlewareContext } from "./types.ts"

const app = new Application<MiddlewareContext>();
app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8080 });