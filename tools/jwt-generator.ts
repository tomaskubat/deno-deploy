import { dirname, fromFileUrl } from "https://deno.land/std@0.100.0/path/mod.ts";
import { create, verify, decode } from "https://deno.land/x/djwt@v2.2/mod.ts"
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { fsExistsSync } from "https://raw.githubusercontent.com/sandbox-space/deno-helpers/main/mod.ts";
import { JwtHeader } from "../config/jwt.config.ts" 

const scriptDir = fromFileUrl(dirname(import.meta.url));
const envFile = `${scriptDir}/../.env`;

if (fsExistsSync(envFile)) {
  config({ 
    path: envFile,
    export: true,
  });
}

const JWT_SECRET = Deno.env.get('JWT_SECRET') as string;

const payload = {
  repository: [
    "tomaskubat/php-prod",
    "library/php",
  ]
};

const token = await create(JwtHeader, payload, JWT_SECRET)

try {
  const payloadDecoded = await verify(token, JWT_SECRET, JwtHeader.alg);
  console.log("Payload:");
  console.log(payloadDecoded);
  console.log("Token:");
  console.log(`---> ${token} <---`);
} catch (error) {
  console.error(error.toString());
  Deno.exit(1);
}