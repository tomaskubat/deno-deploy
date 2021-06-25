import {
  required,
  isString,
  validateObject,
} from "https://deno.land/x/validasaur@v0.15.0/src/rules.ts";
import {
  MiddlewareContext,
  DockerHubWebhook,
} from "./../types.ts"
import { requestValidator } from "../middlewares/request-validator.middleware.ts";
import { config } from "../config/config.ts";

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

    const { SLACK_WEBHOOK_URL } = config;
    console.log(SLACK_WEBHOOK_URL);

    const payloadMessage = {
      text: `Builded new image *${requestBody.repository.repo_name}*`,
      mrkdwn: true,
    };

    fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadMessage)
    });

    const payloadDebug = {
      text: `\`\`\`${JSON.stringify(requestBody, null, 2)}\`\`\``,
    };

    fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadDebug)
    });

    context.response.body = "ok";
  }
];

export { proxy };