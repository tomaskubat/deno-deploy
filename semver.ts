import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.1.7/mod.ts";

serve({
  "/": createResponse,
});

async function createResponse(request: Request): Promise<Response> {
  return json({
      name: "tomaskubat/php", 
      tags: [
        '8.0-dev-fmp-alpine',
        '8.0-prod-fmp-alpine',
      ]
    });

  // try {
  //   const token = await createToken();
  //   const tags = await getTags(token);
  //   console.log(tags.tags);
  //   return json(tags);
  // } catch (error) {
  //   console.error('Chyba, koncim: ' + error);
  //   Deno.exit(1);
  // }
}

type token = {
  access_token: string,
  expires_in: number
}

type tags = {
  name: string,
  tags: Array<string>
}

async function createToken(): Promise<token> {
  const response = await fetch("https://auth.docker.io/token?service=registry.docker.io&scope=repository:tomaskubat/php:pull", {
    method: "GET",
  });

  const token: token = await response.json();
  return token;
}

async function getTags(token: token): Promise<tags> {
  // return {
  //   name: "tomaskubat/php", 
  //   tags: [
  //     '8.0-dev-fmp-alpine',
  //     '8.0-prod-fmp-alpine',
  //   ]
  // }
  const response = await fetch("https://registry-1.docker.io/v2/tomaskubat/php/tags/list", {
    method: "GET",
    headers: {
      authorization: `Bearer ${token.access_token}`,
      "content-type": "application/json",
    },
  });

  const tags: tags = await response.json();
  return tags;
}
