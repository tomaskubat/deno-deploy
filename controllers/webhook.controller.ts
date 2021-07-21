import { required, isString, validateObject } from "https://deno.land/x/validasaur@v0.15.0/src/rules.ts";
import { sendSlackMessage } from "https://raw.githubusercontent.com/sandbox-space/deno-helpers/main/mod.ts";
import { MiddlewareContext, DockerHubWebhook } from "./../types.ts"
import { requestValidator } from "../middlewares/request-validator.middleware.ts";

/** 
 * request body schema 
 * for user create/update 
 * */
const validatorProxySchema = {
  repository: validateObject(true, {
    name: [required, isString],
    namespace: [required, isString],
    repo_name: [required, isString],
  }),
  callback_url: [required, isString],
};

const proxy = [
  requestValidator({ bodyRules: validatorProxySchema }),
  async (context: MiddlewareContext) => {
    const requestBody = await context.request.body().value as DockerHubWebhook;

    const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL') as string;
    console.log(SLACK_WEBHOOK_URL);
    console.log(Deno.env.toObject());

    const slackMessage = `Builded new image *${requestBody.repository.repo_name}*`;
    sendSlackMessage(SLACK_WEBHOOK_URL, slackMessage);

    const slackDebug = `\`\`\`${JSON.stringify(requestBody, null, 2)}\`\`\``;
    sendSlackMessage(SLACK_WEBHOOK_URL, slackDebug);

    context.response.body = "ok";
  }
];

export { proxy };