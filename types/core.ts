import { Context as OakContext } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { AuthRepository } from "./auth-repository.ts";

/**
 * Custom appilication context
 */
export class MiddlewareContext extends OakContext {
  authRepository?: AuthRepository;
}
