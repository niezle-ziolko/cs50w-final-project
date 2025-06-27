import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Mutation($credentials: LoginCredentials!) {
    loginUser(credentials: $credentials) {
      data
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Mutation($credentials: RegisterInput!) {
    registerUser(credentials: $credentials) {
      data
    }
  }
`;

export const UPDATE_MUTATION = gql`
  mutation Mutation($credentials: UpdateUserInput!) {
    updateUser(credentials: $credentials) {
      data
    }
  }
`;

export const LIKE_MUTATION = gql`
  mutation Mutation($bookId: ID!, $userId: ID!) {
    addLike(bookId: $bookId, userId: $userId) {
      data
    }
  }
`;

export const UNLIKE_MUTATION = gql`
  mutation Mutation($bookId: ID!, $userId: ID!) {
    removeLike(bookId: $bookId, userId: $userId) {
      data
    }
  }
`;