import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Function to create a new Apollo Client instance with optional auth token
export const createApolloClient = (token) => {
  // Create an HTTP link to the GraphQL endpoint
  const httpLink = createHttpLink({
    uri: "/api/h57oBNgFRK" // GraphQL server endpoint
  });

  // Middleware to set the HTTP headers, including authorization if token is provided
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      "authorization": token ? `Bearer ${token}` : "",
      "content-type": "application/json"
    }
  }));

  // Return a new ApolloClient instance configured with the auth link and HTTP link concatenated,
  // an in-memory cache, and default fetch policies disabling cache for queries
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "no-cache" },
      query: { fetchPolicy: "no-cache" }
    }
  });
};