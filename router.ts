import { Router, helpers } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import * as hp from  "./controllers/hp.controller.ts";
import * as tag from  "./controllers/tag.controller.ts";
import * as webhook from  "./controllers/webhook.controller.ts";

const router = new Router();

router
  .get("/", ...hp.hp)

  .get("/tag/:repository([a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+)/list", ...tag.list)
  .get("/tag/:repository([a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+)/missing", ...tag.missing)
  
  .post("/webhook/", ...webhook.proxy);

export { router };