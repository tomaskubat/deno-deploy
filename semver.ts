import { json, serve, validateRequest } from "https://deno.land/x/sift@0.3.2/mod.ts";

const tags = [
  "8.0.0-fpm-alpine",
  "8.0.1-fpm-alpine",
  "8.0.2-fpm-alpine",
  "8.0.3-fpm-alpine",
];
const regexp = new RegExp("^8.0.(\\d+)-fpm-alpine$");

console.log(tags);
console.log(regexp);
const filtered = tags.filter(tag => regexp.test(tag));
console.log(filtered);

// serve({
//   "/tag/:vendor/:image/list": serveTagList,
// });

async function serveTagList(request: Request, pathParams: any): Promise<Response> {
  const { error, body } = await validateRequest(request, {
    GET: {
      params: []
    }
  });

  const { vendor, image } = pathParams;
  const filter = "^8.0.*-fpm-alpine$";

  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const tagList = {
    name: "tomaskubat/php",
    tags: [
      '8.0-dev-fmp-alpine',
      '8.0-prod-fmp-alpine',
    ]
  };

  return json(tagList, { status: 200 });

  try {
    const token = await createToken();
    const tags = await getTags(token);
    return json(tags, { status: 200 });
  } catch (error) {
    console.error('Chyba, koncim: ' + error);
    return json({ error: String(error) }, { status: 500 });
  }
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
