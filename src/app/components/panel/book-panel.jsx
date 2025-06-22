"use client";
import { useAudio } from "context/audio-context";

export default function BookPanel() {
  const { bookTitle, bookAuthor, bookDescription, bookFile } = useAudio();

  const chapters = bookFile ? bookFile.split(",").map((url, index) => ({
    number: index + 1,
    url: url.trim()
  })) : [];

  return (
    <div className="u19 w-full p-7 order-2 md:roder-1">
      <h1>{bookTitle}</h1>
      <hr />
      <h2>Author: {bookAuthor}</h2>
      <p>{bookDescription}</p>
      <h2>Chapters:</h2>
      <div className="h-25 grid overflow-y-auto overflow-x-hidden">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <li key={chapter.number}>
              Chapter {chapter.number}
            </li>
          ))
        ) : (
          <li>No chapters available.</li>
        )}
      </div>
    </div>
  );
};