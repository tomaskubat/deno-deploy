import { helpers } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { MiddlewareContext } from "../types.ts"
import { createToken as authCreateToken } from "../services/auth.service.ts"
import { 
  getTags as repositoryGetTags, 
  tagDistinction as repositoryTagDistinction
} from "../services/repository.service.ts"

type ListParams = {
  repository: string,
  filter?: string | undefined
  against?: string | undefined
}

const list = [
  async (context: MiddlewareContext) => {
    const params = helpers.getQuery(context, { mergeParams: true }) as ListParams;
    const { repository, filter } = params;

    console.log('List route');

    const registryToken = await authCreateToken([repository]);
    const tags = await repositoryGetTags(registryToken, repository, filter);

    context.response.body = tags;
  }
];

const missing = [
  async (context: MiddlewareContext) => {
    const params = helpers.getQuery(context, { mergeParams: true }) as ListParams;
    const { repository, filter, against } = params;

    console.log('Missing route');

    if (against === undefined) {
      context.response.status = 400;
      context.response.body = {
        error: "Missing required query param 'against'"
      };
      return;
    }

    const token = await authCreateToken([repository, against]);
    const tagsBase = await repositoryGetTags(token, repository, filter);
    const tagsAgains = await repositoryGetTags(token, against, filter);
    const distinction = repositoryTagDistinction(tagsBase, tagsAgains);
    context.response.body = distinction;
  }
];

export { list, missing };