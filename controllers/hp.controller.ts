import { MiddlewareContext } from "./../types.ts"
import { router } from "./../router.ts"

const hp = [
  (context: MiddlewareContext) => {
    const endpoints: Array<string> = [];

    router.forEach(route => {
      const methodWithPath = route.methods.map(method => method.concat(' ', route.path));
      endpoints.push(...methodWithPath);
    });

    context.response.body = {
      "endpoints": endpoints
    }
  }
];

export { hp };