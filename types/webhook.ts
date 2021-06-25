export type DockerHubWebhook = {
  repository: {
    name: string,
    namespace: string,
    repo_name: string,
  },
  callback_url: string,
};
