"use client";
import { useEffect, useState, useCallback } from "react";
import { useAudio } from "context/audio-context";
import { useAuth } from "context/auth-context";

import Loader from "../loader";
import Playing from "../playing";
import SearchBar from "../forms/search";
import InfoButton from "../buttons/info-button";
import LikeButton from "../buttons/like-button";

import "styles/css/components/panel.css";

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

  // Fetch books based on the user"s status and the current view title ("Library", "My books", "Liked books")
  const fetchBooks = useCallback(async () => {
    if (!user) return; // Exit early if there is no user

    setLoading(true); // Set loading state while fetching data

    try {
      let responses = [];
      const headers = { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_BOOK_AUTH}` };

      // Fetch different data based on the "title" (Library, My books, or Liked books)
      if (title === "Library") {
        const response = await fetch("/api/data/book", { headers });
        responses = await response.json();
      } else {
        let ids = [];
        if (title === "My books" && user?.created) {
          // If the user is viewing their created books, get book IDs from the "created" field
          ids = user.created.split(", ").map(id => id.trim());
        } else if (title === "Liked books" && user?.liked) {
          // If the user is viewing liked books, get book IDs from the "liked" field
          ids = user.liked.split(", ").map(id => id.trim());
        };

        // Fetch the books by their IDs if there are any
        if (ids.length) {
          responses = await Promise.all(
            ids.map(id =>
              fetch(`/api/data/book?id=${id}`, { headers }).then(res => res.json())
            )
          );
        };
      };

      // Filter and format the books (only including those with pictures and optionally a file)
      const formattedBooks = responses
        .filter(book => book?.picture)
        .map(book => ({
          ...book,
          file: book?.file || null
        }));

      setBooks(formattedBooks); // Set the fetched books
      setFilteredBooks(formattedBooks); // Set the filtered books for search functionality
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false); // Set loading state to false once fetching is complete
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
    <div className="panel">
      <div className="heading">
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
        <tbody>
          {/* Show loader while fetching data */}
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <tr key={index}>
                <td>
                  <Loader />
                </td>
              </tr>
            ))
          ) : (
            // If books are available, map through filtered books and display them
            filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <tr key={book.id} onClick={() => {
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
                    <img src={book.picture} alt={book.title} width="205" height="290" />
                    {/* Display play icon or like button based on the title */}
                    {title === "Library" || title === "Liked books" ? (
                      <div className="background-icon">
                        {title === "Library" ? (
                          // Show "Playing" if the current book is the one being played
                          bookId === book.id ? (
                            <Playing />
                          ) : (
                            <i className="fa-solid fa-play" id="icon" />
                          )
                        ) : (
                          // Show like button for liked books
                          <LikeButton externalBookId={book.id} />
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            ):(
              // If no books are found, show an error message
              <tr>
                <td colSpan="1" className="none">
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