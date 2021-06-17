import { Application, Router, helpers } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { createHash } from "https://deno.land/std@0.99.0/hash/mod.ts";

const tags_library = [
  "8.0.0-apache",
  "8.0.1-apache",
  "8.0.2-apache",
  "8.0.3-apache",
  "8.0.4-apache",
  "8.0.5-apache",
  "8.0.6-apache",
  "8.0.0-fpm-alpine",
  "8.0.1-fpm-alpine",
  "8.0.2-fpm-alpine",
  "8.0.3-fpm-alpine",
  "8.0.4-fpm-alpine",
  "8.0.5-fpm-alpine",
  "8.0.6-fpm-alpine",
];
const tags_own = [
  "8.0.0-apache",
  "8.0.1-apache",
  "8.0.2-apache",
  "8.0.0-fpm-alpine",
  "8.0.1-fpm-alpine",
  "8.0.2-fpm-alpine",
];

// ************************************************************************* //

type listParams = {
  repo: string,
  filter?: string | undefined
  against?: string | undefined
}

const router = new Router();
router
  .get("/", (context) => {
    const endpoints: Array<string> = [];

    router.forEach(route => {
      const methodWithPath = route.methods.map(method => method.concat(' ', route.path));
      endpoints.push(...methodWithPath);
    });

    context.response.body = {
      "endpoints": endpoints
    }
  })
  .get("/tag/:repo([a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+)/list", async (context) => {
    const params = helpers.getQuery(context, {mergeParams: true}) as listParams;
    const {repo, filter} = params;

    console.log('List route');

    const token = await createToken([repo]);
    const tagsOwn = await getTags(token, repo, filter);
    
    context.response.body = tagsOwn;
  })
  .get("/tag/:repo([a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+)/missing", async (context) => {
    const params = helpers.getQuery(context, {mergeParams: true}) as listParams;
    const {repo, filter, against} = params;

    console.log('Missing route');

    if (against === undefined) {
      context.response.status = 400;
      context.response.body = {
        error: "Missing required query param 'against'"
      };
      return;
    }

    const token = await createToken([repo, against]);
    const tags = await getTags(token, repo, filter);
    const tagsComparison = await getTags(token, against, filter);
    const tagsDistinction = tagsComparison.tags.filter(value => !tags.tags.includes(value));
    context.response.body = tagsDistinction;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8000 });

// ************************************************************************* //

type tagName = string;
type tagList = Array<tagName>;

type repoName = string;
type repoList = Array<repoName>;
interface repoResponse {
  name: repoName,
  tags: tagList
}
interface repoTags {
  repository: repoName,
  tags: tagList
}

interface tokenResponse {
  access_token: string,
  expires_in: number,
}
interface token extends tokenResponse {
  expiresDate: Date,
  repoList: repoList,
};
type tokenHash = string;
const tokenKeys: Record<tokenHash, token> = {};

async function createToken(repoList: repoList): Promise<token> {
  const tokenHash = createHash("md5")
    .update(JSON.stringify(repoList))
    .toString();

  const now = new Date();

  // check if token is expired
  if (tokenKeys[tokenHash] !== undefined && tokenKeys[tokenHash].expiresDate < now) {
    console.log('Invalidating token');
    delete tokenKeys[tokenHash];
  }

  // obtain new token
  if (tokenKeys[tokenHash] === undefined) {
    console.log('Fetching new token');
    const scopes = repoList.map(repo => `scope=repository:${repo}:pull`)
    const oauthUrl = `https://auth.docker.io/token?service=registry.docker.io&${scopes.join('&')}`;
    console.log(oauthUrl);
    const oauthResponse = await fetch(oauthUrl, {
      method: "GET",
    });

    const tokenResponse: tokenResponse = await oauthResponse.json();

    tokenKeys[tokenHash] = {
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
      expiresDate: new Date(now.getTime() + (tokenResponse.expires_in * 1000) - 5),
      repoList: repoList,
    }
  }

  return tokenKeys[tokenHash]; 
}

async function getTags(token: token, repository: repoName, filter: string | undefined): Promise<repoTags> {
  const repositoryUrl = `https://registry-1.docker.io/v2/${repository}/tags/list`;
  console.log(repositoryUrl);
  const registryResponse = await fetch(repositoryUrl, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token.access_token}`,
      "content-type": "application/json",
    },
  });

  const repoResponse: repoResponse = await registryResponse.json();
  let filtered = repoResponse.tags;
  if (filter !== undefined) {
    const regexp = new RegExp(filter);
    filtered = repoResponse.tags.filter(tag => regexp.test(tag));
  }

  return {
    'repository': repository,
    'tags': filtered,
  } 
}
