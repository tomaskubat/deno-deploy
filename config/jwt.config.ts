import { Header } from "https://deno.land/x/djwt@v2.2/mod.ts"

export const JwtHeader: Header = {
  alg: "HS512",
  typ: "JWT"
};