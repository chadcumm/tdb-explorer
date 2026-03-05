/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "tdb-explorer",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          ...(!process.env.CI && { profile: "admin" }),
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const sharedPoolId = "us-east-1_aDNcmvxfv";
    // TODO: Replace with actual Client ID after deploying cernertools repo
    const tdbExplorerClientId = "PLACEHOLDER_UNTIL_DEPLOY";

    new sst.aws.StaticSite("TdbExplorerSite", {
      build: {
        command: "npm run build",
        output: "dist/tdb-explorer",
      },
      domain: "tdb-explorer.cernertools.com",
      environment: {
        NG_APP_USER_POOL_ID: sharedPoolId,
        NG_APP_CLIENT_ID: tdbExplorerClientId,
        NG_APP_REGION: "us-east-1",
      },
    });
  },
});
