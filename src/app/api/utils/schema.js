export const typeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    photo: String
    created: String
    currently: String
    liked: String
    expiresDate: String
  }

  type AuthPayload {
    user: User
  }

  type Query {
    me(credentials: LoginCredentials!): User
  }

  input LoginCredentials {
    username: String!
    password: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input UpdateUserInput {
    username: String!
    email: String
    password: String
    photo: String
  }

  type TokenResponse {
    data: String!
  }

  type Mutation {
    registerUser(credentials: RegisterInput!): TokenResponse!
    updateUser(credentials: UpdateUserInput!): TokenResponse
    loginUser(credentials: LoginCredentials!): TokenResponse!
  }
`;