import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts"
import { MiddlewareContext, AuthRepository } from "./../types.ts";
import { JwtHeader } from "../config/jwt.config.ts" 

/***
 * JWTAuth middleware
 * Decode authorization bearer token
 * and attach as an authRepository in application context
 */
const JWTAuthMiddleware = (secretJWT: string) => {
  return async (ctx: MiddlewareContext, next: () => Promise<void>) => {
    const authHeader = ctx.request.headers.get("Authorization");
    try {
      if (authHeader !== null) {
        const token = authHeader.replace(/^bearer/i, "").trim();
        const payload = await verify(token, secretJWT, JwtHeader.alg);
        ctx.authRepository = payload as AuthRepository;
      }
    } catch (error) {
      console.error(error.toString());
    }

    await next();
  };

}

export { JWTAuthMiddleware };
