import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.3.2/mod.ts";

// serve({
//   "/": () => new Response("hello world"),
//   "/blog/:slug": (request, { slug }) => {
//     const post = `Hello, you visited ${slug}!`;
//     return new Response(post);
//   },
//   404: () => new Response("not found")
// });

serve({
  "/": createResponse,
});

async function createResponse(request: Request, params: any): Promise<Response> {
  console.log(request);
  console.log(params);
  console.log('---');

  const { error, body } = await validateRequest(request, {
    GET: {
      params: []
    }
  });
  // validateRequest populates the error if the request doesn't meet
  // the schema we defined.
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  // return json({
  //   name: "tomaskubat/php",
  //   tags: [
  //     '8.0-dev-fmp-alpine',
  //     '8.0-prod-fmp-alpine',
  //   ]
  // }, { status: 200 });

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
