import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";

const tags_library = [
  "8.0.0-fpm-alpine",
  "8.0.1-fpm-alpine",
  "8.0.2-fpm-alpine",
  "8.0.3-fpm-alpine",
  "8.0.4-fpm-alpine",
  "8.0.5-fpm-alpine",
  "8.0.6-fpm-alpine",
];
const tags_own = [
  "8.0.0-fpm-alpine",
  "8.0.1-fpm-alpine",
  "8.0.2-fpm-alpine",
];
const regexp = new RegExp("^8.0.(\\d+)-fpm-alpine$");
const filtered_library = tags_library.filter(tag => regexp.test(tag));
const filtered_own = tags_own.filter(tag => regexp.test(tag));
const distinction = filtered_library.filter(value => !filtered_own.includes(value));

// ************************************************************************* //

const app = new Application();

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
      "localhost"}:${port}`,
  );
});

// Logger
app.use(async (ctx, next) => {
  console.log(`Logger - a`);
  await next();
  console.log(`Logger - b`);
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`Logger - c: ${ctx.request.method} ${ctx.request.url} - ${rt}\n`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log("Timing - a");
  await next();
  console.log("Timing - b");
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  console.log(`Timing`);
});

// Hello World!
app.use(async (ctx, next) => {
  console.log(`Response - a`);
  await next();
  console.log(`Response - b`);
  ctx.response.body = distinction;
  console.log(`Response -c`);
});

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8000 });

// ************************************************************************* //

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
