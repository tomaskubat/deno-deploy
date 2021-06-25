import { RepositoryList, RepositoryName } from "./repository.ts"
import { TagList } from "./tag.ts"

/** Registry oauth */

export interface RegistryTokenResponse {
  access_token: string,
  expires_in: number,
}

export interface RegistryToken extends RegistryTokenResponse {
  expiresDate: Date,
  repositoryList: RepositoryList,
};

export type RegistryTokenHash = string;

/** Registry rest-api */

export interface RegistryTagListResponse {
  name: RepositoryName,
  tags: TagList
}