import { Context as OakContext } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { AuthUser } from "./auth.ts";

/**
 * Custom appilication context
 */
export class MiddlewareContext extends OakContext {
  user?: AuthUser;
}
