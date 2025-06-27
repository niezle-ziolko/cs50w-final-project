"use client";
import { useEffect, useState, useCallback } from "react";

import { BOOK_QUERY, BOOKS_QUERY } from "client/query";
import { apolloClient } from "client/client";
import { useAuth } from "context/auth-context";
import { useAudio } from "context/audio-context";

import Loader from "../loader";
import SearchBar from "../forms/search";
import InfoButton from "../buttons/info-button";
import LikeButton from "../buttons/like-button";

export default function ClientPanel({ title }) {
  // Access user information from the authentication context
  const { user } = useAuth();
  // Functions to update the current book in the audio context
  const { setBookFile, setBookPicture, setBookTitle, setBookId, setBookAuthor, setBookDescription, bookId } = useAudio();

  // States to store the books, filtered books, loading status, and search query
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const client = apolloClient(token);

      let booksData = [];

      if (title === "Library") {
        const { data } = await client.query({
          query: BOOKS_QUERY
        });

        booksData = data.books;
      } else {
      // My Books / Liked Books
        let ids = [];
        if (title === "My books" && user?.created) {
          ids = user.created.split(",").map(id => id.trim());
        } else if (title === "Liked books" && user?.liked) {
          ids = user.liked.split(",").map(id => id.trim());
        };

        if (ids.length) {
          const results = await Promise.all(
            ids.map(async (id) => {
              const { data } = await client.query({
                query: BOOK_QUERY,
                variables: { id }
              });

              return data.books?.[0]; // `books(id)` also returns an array
            })
          );

          booksData = results.filter(Boolean);
        };
      };

      const formattedBooks = booksData.filter(book => book?.picture).map(book => ({ ...book, file: book?.file || null }));

      setBooks(formattedBooks);
      setFilteredBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    };
  }, [user, title]);


  // UseEffect hook to fetch books when the component mounts or when dependencies change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // UseEffect hook to filter books based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books); // If search query is empty, show all books
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBooks(
        books.filter(book =>
          book.title.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query)
        )
      );
    };
  }, [searchQuery, books]);

  return (
    <div className="u19 w-full p-7 order-2 md:roder-1">
      <div className={`${title === "My books" ? "flex justify-between" : "grid"} md:flex items-center md:justify-between`}>
        <h1>{title}</h1>
        {/* Show search bar only for "Library" view */}
        {title === "Library" && (
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {/* Show info button only for "My books" view */}
        {title === "My books" && (
          <InfoButton />
        )}
      </div>
      <table>
        <tbody className="flex flex-wrap gap-3">
          {/* Show loader while fetching data */}
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <tr className="u20" key={index}>
                <td>
                  <Loader />
                </td>
              </tr>
            ))
          ) : (
            // If books are available, map through filtered books and display them
            filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <tr className="u20" key={book.id} onClick={() => {
                  // If the user is in the "Library" view and the book has a file, set it for playback
                  if (title === "Library" && book.file) {
                    setBookFile(book.file);
                    setBookId(book.id);
                    setBookTitle(book.title);
                    setBookPicture(book.picture);
                    setBookAuthor(book.author);
                    setBookDescription(book.description);
                  }
                }}>
                  <td>
                    {/* Display book picture */}
                    <img className="w-full md:w-50 h-full md:h-71" src={book.picture} alt={book.title} width="200" height="280" />
                    
                    {/* Display play icon or like button based on the title */}
                    {title === "Library" || title === "Liked books" ? (
                      <div className="u1 u26">
                        <div className="w-15 h-15 p-5 bg-b-100 rounded-full">
                          {title === "Library" ? (
                            // Show "Playing" if the current book is the one being played
                            bookId === book.id ? (
                              <i className="fa-solid fa-music text-white text-xl" id="icon" />
                            ) : (
                              <i className="fa-solid fa-play text-white text-xl" id="icon" />
                            )
                          ) : (
                            // Show like button for liked books
                            <LikeButton externalBookId={book.id} />
                          )}
                        </div>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            ):(
              // If no books are found, show an error message
              <tr>
                <td>
                  <p>Ups... Book not found.</p>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};