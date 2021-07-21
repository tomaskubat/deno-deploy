import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { fsExistsSync } from "https://raw.githubusercontent.com/sandbox-space/deno-helpers/main/mod.ts";
import { router } from "./router.ts"
import { MiddlewareContext } from "./types.ts"
import { JWTAuthMiddleware } from "./middlewares/jwt-auth.middleware.ts"

if (fsExistsSync('.env')) {
  config({ export: true });
}

const app = new Application<MiddlewareContext>();

const JWT_SECRET = Deno.env.get('JWT_SECRET') as string;
app.use(JWTAuthMiddleware(JWT_SECRET));

app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
// addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
await app.listen({ port: 8080 });
