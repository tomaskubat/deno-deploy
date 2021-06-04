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

try {
  const token = await createToken();
  const tags = await getTags(token);
  console.log(tags.tags);

} catch (error) {
  console.error('Chyba, koncim: ' + error);
  Deno.exit(1);
}
