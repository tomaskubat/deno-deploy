import { TagList } from "./tag.ts"

export type RepositoryName = string;

export type RepositoryList = Array<RepositoryName>;

export interface RepositoryTags {
  repository: RepositoryName,
  tags: TagList
}