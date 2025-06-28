export const typeDefs = `  
  type Book {
    id: ID!
    title: String!
    description: String!
    author: String!
    picture: String!
    file: String!
    date: String!
    ai: Boolean!
  }

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
    books(id: ID): [Book!]!
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
    email: String
    password: String
    photo: String
  }

  input CreateBookInput {
    title: String!
    description: String!
    username: String!
    imageBase64: String
    audioFilesBase64: [String!]
  }

  type TokenResponse {
    data: String!
  }

  type Mutation {
    loginUser(credentials: LoginCredentials!): TokenResponse!
    registerUser(credentials: RegisterInput!): TokenResponse!
    updateUser(credentials: UpdateUserInput!): TokenResponse!
    addLike(bookId: ID!, userId: ID!): TokenResponse!
    removeLike(bookId: ID!, userId: ID!): TokenResponse!
    createBook(input: CreateBookInput!): TokenResponse!
  }
`;