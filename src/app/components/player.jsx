"use client";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect } from "react";

import { useAudio } from "context/audio-context";

import Placeholder from "./placeholder";
import LikeButton from "./buttons/like-button";

export default function AudioPlayer({ title }) {
  // Access current book details from the audio context
  const { bookId, bookFile, bookPicture, bookTitle } = useAudio();
  
  // State for detecting if the component is client-side
  const [isClient, setIsClient] = useState(false);

  // State for current audio file and its chapters
  const [currentAudio, setCurrentAudio] = useState(null);

  const [currentChapterNumber, setCurrentChapterNumber] = useState(null);
  const [chapters, setChapters] = useState([]);

  // UseEffect hook to update client-side status and prepare chapters when bookFile changes
  useEffect(() => {
    setIsClient(true); // Set "isClient" to true when component is mounted (indicating it"s client-side)
    
    if (bookFile) {
      // Split the "bookFile" string into separate chapter URLs
      const chapterUrls = bookFile.split(",").map((url, index) => ({
        number: index + 1,
        url: url.trim()
      }));

      setChapters(chapterUrls); // Store chapter URLs in state

      // If there are chapters, set the first chapter as the current audio
      if (chapterUrls.length > 0) {
        setCurrentAudio(chapterUrls[0].url);
        setCurrentChapterNumber(chapterUrls[0].number);
      };
    };
  }, [bookFile]); // Dependency array ensures effect runs when "bookFile" changes

  // Function to handle chapter click: sets the current audio to the selected chapter URL
  const handleChapterClick = (url) => {
    setCurrentAudio(url);
    const chapter = chapters.find((c) => c.url === url);
    if (chapter) setCurrentChapterNumber(chapter.number);
  };

  return (
    <div className="u23 min-h-auto">
      <Script src="https://cdn.jsdelivr.net/npm/media-chrome@3/+esm" type="module" strategy="afterInteractive" />
      <div className="u1 w-full p-5 md:p-8 gap-4 flex-col top-0 left-0 right-0 bottom-0 border-2 border-primary rounded-sm">
        <h2 className="u21">Book player</h2>

        <Placeholder />

        {/* Display the book title with a link if it"s the client side */}
        {isClient && (
          <>
            {title ? (
              <Link href={`/auth/library/${bookId}`} className="text-xl font-bold my-2">{bookTitle}</Link>
            ) : (
              <p className="text-xl font-bold my-2">{bookTitle}</p>
            )}
            {/* Display current chapter number under the title */}
            {currentChapterNumber && (
              <p className="text-sm font-bold">Chapter {currentChapterNumber}</p>
            )}
          </>
        )}

        {/* Media controller for audio playback */}
        <media-controller className="w-full md:min-w-80 bg-transparent" audio>
          <audio slot="media" src={currentAudio} crossOrigin="true" controls />
          <media-control-bar className="grid">
            <div className="u1 gap-2">
              <media-time-display className="u28" /> {/* Displays current playback time */}
              <media-time-range className="u29 w-full" /> {/* Time range slider */}
              <media-duration-display className="u28" /> {/* Displays total duration of the audio */}
            </div>
            <div className="u1 gap-2">
              <LikeButton /> {/* Button for liking the current audio/book */}
              <media-seek-backward-button className="u30">
                <i slot="icon" className="fa-solid fa-arrow-rotate-left" /> {/* Icon for rewind */}
              </media-seek-backward-button>
              <media-play-button className="u30">
                <i slot="play" className="fa-solid fa-play" /> {/* Play button icon */}
                <i slot="pause" className="fa-solid fa-pause" /> {/* Pause button icon */}
              </media-play-button>
              <media-seek-forward-button className="u30">
                <i slot="icon" className="fa-solid fa-arrow-rotate-right" /> {/* Icon for fast forward */}
              </media-seek-forward-button>
              <media-mute-button className="text-xl hover:text-third text-primary bg-transparent">
                <i slot="high" className="fa-solid fa-volume-high" /> {/* High volume icon */}
                <i slot="off" className="fa-solid fa-volume-xmark" /> {/* Mute icon */}
              </media-mute-button>
            </div>
          </media-control-bar>
        </media-controller>

        {/* Display available chapters if they exist */}
        <div className="h-25 w-full grid gap-1 overlay-y-scroll overlay-x-hidden overflow-x-hidden">
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => {
              const isActive = chapter.number === currentChapterNumber;
              const baseClass = "h-5 p-1 text-primary text-center bg-transparent font-bold border-2 rounded-sm cursor-pointer hover:shadow-none hover:transform-none active:shadow-none active:transform-none";
              const activeClass = isActive ? " text-third border-third" : "";

              return (
                <span className={`${baseClass}${activeClass}`} key={index} onClick={() => handleChapterClick(chapter.url)}>
                  Chapter {chapter.number}
                </span>
              );
            })
          ) : (
            <p>No chapters available.</p>
          )}
        </div>
      </div>
    </div>
  );
};