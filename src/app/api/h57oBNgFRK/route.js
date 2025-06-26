import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { startServerAndCreateCloudflareWorkersHandler } from "@as-integrations/cloudflare-workers";

import { typeDefs } from "utils/schema";
import { resolvers } from "utils/resolvers";

// Creating the GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Creating the Apollo Server instance
const server = new ApolloServer({
  schema
});

// Creating the handler for the Cloudflare Workers environment
const handler = startServerAndCreateCloudflareWorkersHandler(server, {
  context: async ({ request }) => {
    const { env } = await getCloudflareContext({ async: true });

    const auth = request.headers.get("authorization");
    const ip = request.headers.get("x-forwarded-for")?.split(/\s*,\s*/) || [""];

    return {
      db: env.D1,
      auth,
      ip,
      env: env
    };
  }
});

// Export handler for GET and POST methods
export const GET = handler;
export const POST = handler;