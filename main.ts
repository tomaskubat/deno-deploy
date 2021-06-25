import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { router } from "./router.ts"
import { MiddlewareContext } from "./types.ts"

const existsSync = (filePath: string): boolean => {
  try {
    Deno.lstatSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

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
