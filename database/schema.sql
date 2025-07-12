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
  liked TEXT,
  ai BOOLEAN NOT NULL DEFAULT FALSE
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
  date,
  ai
) VALUES (
  'b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef',
  'Silence Beyond The Wall',
  'Adam moves into an old townhouse in the center of town, seeking peace and quiet after a recent divorce. The apartment seems ideal - cheap, quiet and overlooking the park. But on the very first night, he hears something strange: a quiet knocking, a barely audible whisper, as if someone is talking just outside the wall. The problem is that the neighboring establishment has been standing empty for years, and the door to it is boarded up. As time passes, the noises become clearer, and Adam begins to get the feeling that something - or someone - is trying to make contact with him.  When he finds the old diary of the previous tenant, he discovers a terrifying truth: walls dont just have ears - they also have memories.',
  'John',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/images/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef.webp',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef-1.mp3, https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef-2.mp3, https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef-3.mp3, https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef-4.mp3, https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef-5.mp3',
  '2025-07-08T11:32:08.204Z',
  TRUE
);

INSERT INTO books (
  id,
  title,
  description,
  author,
  picture,
  file,
  date,
  ai
) VALUES (
  '9c952f2e-dc15-4db0-b9c0-0782817b8f58',
  'The Sixth Dead',
  'In a small, isolated town where everyone knows each other, life goes on quietly until someone notices a mysterious girl in a white dress walking among the fog. She always appears at night - quietly, without a word - and the next day one of the residents dies under tragic circumstances. No one knows her name, no one knows where she came from, but the old people say she is the sixth deceased, the last of the children who died in the orphanage fire many years ago. A young journalist, trying to unravel the mystery, uncovers dark secrets hidden for decades - and the fact that the list of victims has not yet closed. The clock is ticking, and the girl appears more and more often... closer and closer.',
  'John',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/images/books/9c952f2e-dc15-4db0-b9c0-0782817b8f58.webp',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/9c952f2e-dc15-4db0-b9c0-0782817b8f58-1.mp3,https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/9c952f2e-dc15-4db0-b9c0-0782817b8f58-2.mp3,https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/9c952f2e-dc15-4db0-b9c0-0782817b8f58-3.mp3',
  '2025-07-10T12:07:48.842Z',
  TRUE
);

INSERT INTO books (
  id,
  title,
  description,
  author,
  picture,
  file,
  date,
  ai
) VALUES (
  '2fd73c6c-8f19-4e19-bbec-bf9514f94fe3',
  'The Omega Code',
  '“The Omega Code” is a gripping science fiction thriller about the limits of human knowledge and the dangers of contact with an alien form of intelligence. When a mysterious signal arrives from the dead of space, the world of science is faced with the greatest discovery in history - a code that can affect the structure of reality. Dr. Eliana Navarro, a brilliant mathematician, is drawn into a deadly game where science mixes with mystery, and any decision can set in motion irreversible changes. Government agencies, secret organizations and ancient warnings weave a complex web of intrigue, at the center of which is the so-called “Seed” - the first form of consciousness resulting from the activation of a code. The book raises questions about the nature of reality, the limits of responsibility, and whether humanity is ready to understand what it should never have found.',
  'John',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/images/books/2fd73c6c-8f19-4e19-bbec-bf9514f94fe3.webp',
  'https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/2fd73c6c-8f19-4e19-bbec-bf9514f94fe3-1.mp3,https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/2fd73c6c-8f19-4e19-bbec-bf9514f94fe3-2.mp3,https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/2fd73c6c-8f19-4e19-bbec-bf9514f94fe3-3.mp3,https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/file/books/2fd73c6c-8f19-4e19-bbec-bf9514f94fe3-4.mp3',
  '2025-07-10T17:31:04.909Z',
  TRUE
);

INSERT INTO users (
  id,
  username,
  email,
  password,
  photo,
  created,
  liked
) VALUES (
  'e0b179c0-4e27-4a50-baf0-6eb5f78894aa',
  'John',
  'john@doe.com',
  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  'https://cdn.niezleziolko.app/final-project/profile-photo/default-profile-picture.webp',
  'b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef, 9c952f2e-dc15-4db0-b9c0-0782817b8f58, 2fd73c6c-8f19-4e19-bbec-bf9514f94fe3',
  'b3eaa070-8a6f-4c70-9a89-1c4e7a0e91ef'
);