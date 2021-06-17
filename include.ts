import { Application, Router } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { UserInfo } from "./types.ts"
// ************************************************************************* //

const user: UserInfo = {
  roles: [
    'admin',
    'user',
  ]
}

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = user;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8000 });
