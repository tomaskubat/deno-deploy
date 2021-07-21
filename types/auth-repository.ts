import { RepositoryName } from "./repository.ts";

/**
 * Authenticated libraries over JWT access token payload
 */
export type AuthRepository = {
  repository: Array<RepositoryName>;
};
