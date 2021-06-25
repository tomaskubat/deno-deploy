import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { existsSync } from "https://deno.land/std@0.99.0/fs/mod.ts";
import { router } from "./router.ts"
import { MiddlewareContext } from "./types.ts"

if (existsSync('.env')) {
  console.log('.env existuje');
  config({ export: true });
} else {
  console.log('.env neexistuje');
}

const app = new Application<MiddlewareContext>();
app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8080 });
