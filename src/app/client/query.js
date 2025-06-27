import { gql } from "@apollo/client";

export const BOOK_QUERY = gql`
  query($id: ID) {
    books(id: $id) {
      id
      title
      description
      author
      picture
      file
      date
      ai
    }
  }
`;

export const BOOKS_QUERY = gql`
  query {
    books {
      id
      title
      description
      author
      picture
      file
      date
      ai
    }
  }
`;