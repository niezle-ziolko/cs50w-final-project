DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  picture TEXT NOT NULL,
  file TEXT,
  date TEXT,
  liked TEXT
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  photo TEXT NOT NULL,
  created TEXT,
  currently TEXT,
  liked TEXT
);

INSERT INTO books (
  id,
  title,
  description,
  author,
  picture,
  file,
  date
) VALUES (
  'e65255e5-f382-4a32-ba44-9add9e0a9cd9',
  'The Torrents of Spring',
  'The Torrents of Spring was Hemingway''s second novel to be published. It would not be wrong to say that it is unique among the author''s work as it is a clear parody of Sherwood Anderson''s Dark Laughter and full of absurdist humor. Were Hemingway''s name not attached to it, one might wonder who actually wrote the novel. The work is a product of its time and the reader is cautioned that there are uncomfortable portrayals of both a Black man and Native Americans. In truth, no one is treated in a sensitive way.',
  'Kevin',
  'https://cdn.niezleziolko.app/final-project/book-picture/e65255e5-f382-4a32-ba44-9add9e0a9cd9.webp',
  'https://cdn.niezleziolko.app/final-project/book-file/e65255e5-f382-4a32-ba44-9add9e0a9cd9-1.mp3,https://cdn.niezleziolko.app/final-project/book-file/e65255e5-f382-4a32-ba44-9add9e0a9cd9-2.mp3,https://cdn.niezleziolko.app/final-project/book-file/e65255e5-f382-4a32-ba44-9add9e0a9cd9-3.mp3,https://cdn.niezleziolko.app/final-project/book-file/e65255e5-f382-4a32-ba44-9add9e0a9cd9-4.mp3',
  '2025-03-04T11:42:08.204Z'
);

INSERT INTO users (
  id,
  username,
  email,
  password,
  photo,
  liked
) VALUES (
  'e0b179c0-4e27-4a50-baf0-6eb5f78894aa',
  'John',
  'john@doe.com',
  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  'https://cdn.niezleziolko.app/final-project/profile-photo/default-profile-picture.webp',
  'e65255e5-f382-4a32-ba44-9add9e0a9cd9'
);