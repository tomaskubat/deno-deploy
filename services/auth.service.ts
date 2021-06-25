import { createHash } from "https://deno.land/std@0.99.0/hash/mod.ts";
import {
  RepositoryList,
  RegistryToken,
  RegistryTokenHash,
  RegistryTokenResponse
} from "../types.ts"

const tokenKeys: Record<RegistryTokenHash, RegistryToken> = {};

export async function createToken(repoList: RepositoryList): Promise<RegistryToken> {
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

    const tokenResponse: RegistryTokenResponse = await oauthResponse.json();

    tokenKeys[tokenHash] = {
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
      expiresDate: new Date(now.getTime() + (tokenResponse.expires_in * 1000) - 5),
      repositoryList: repoList,
    }
  }

  return tokenKeys[tokenHash];
}