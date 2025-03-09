'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAudio } from 'context/audio-context';

import Placeholder from './placeholder';
import LikeButton from './buttons/like-button';

import 'styles/css/components/player.css';

export default function AudioPlayer({ title }) {
  // Access current book details from the audio context
  const { bookId, bookFile, bookPicture, bookTitle } = useAudio();
  
  // State for detecting if the component is client-side
  const [isClient, setIsClient] = useState(false);

  // State for current audio file and its chapters
  const [currentAudio, setCurrentAudio] = useState(null);
  const [chapters, setChapters] = useState([]);

  // UseEffect hook to update client-side status and prepare chapters when bookFile changes
  useEffect(() => {
    setIsClient(true); // Set 'isClient' to true when component is mounted (indicating it's client-side)
    
    if (bookFile) {
      // Split the 'bookFile' string into separate chapter URLs
      const chapterUrls = bookFile.split(',').map((url, index) => ({
        number: index + 1,
        url: url.trim()
      }));

      setChapters(chapterUrls); // Store chapter URLs in state

      // If there are chapters, set the first chapter as the current audio
      if (chapterUrls.length > 0) {
        setCurrentAudio(chapterUrls[0].url);
      };
    };
  }, [bookFile]); // Dependency array ensures effect runs when 'bookFile' changes

  // Function to handle chapter click: sets the current audio to the selected chapter URL
  const handleChapterClick = (url) => {
    setCurrentAudio(url);
  };

  return (
    <div className='player'>
      <div className='container'>
        <p className='heading'>Currently book playing</p>
        
        <div className='image'>
          {/* If bookPicture is available, display it, otherwise show a placeholder */}
          {bookPicture ? (
            <img src={bookPicture} alt='bookly book cover' />
          ) : (
            <div className='placeholder'>
              <Placeholder /> {/* Placeholder component for missing image */}
            </div>
          )}
        </div>

        {/* Display the book title with a link if it's the client side */}
        {isClient && (
          title ? (
            <Link href={`/auth/library/${bookId}`} className='title'>{bookTitle}</Link> // Link to the book's detailed page
          ) : (
            <p className='title'>{bookTitle}</p> // Plain title if not a link
          )
        )}

        {/* Media controller for audio playback */}
        <media-controller audio>
          <audio slot='media' src={currentAudio} crossOrigin='true' controls />
          <media-control-bar>
            <div className='box'>
              <media-time-display /> {/* Displays current playback time */}
              <media-time-range /> {/* Time range slider */}
              <media-duration-display /> {/* Displays total duration of the audio */}
            </div>
            <div className='box'>
              <LikeButton /> {/* Button for liking the current audio/book */}
              <media-seek-backward-button>
                <i slot='icon' className='fa-solid fa-arrow-rotate-left' /> {/* Icon for rewind */}
              </media-seek-backward-button>
              <media-play-button>
                <i slot='play' className='fa-solid fa-play' /> {/* Play button icon */}
                <i slot='pause' className='fa-solid fa-pause' /> {/* Pause button icon */}
              </media-play-button>
              <media-seek-forward-button>
                <i slot='icon' className='fa-solid fa-arrow-rotate-right' /> {/* Icon for fast forward */}
              </media-seek-forward-button>
              <media-mute-button>
                <i slot='high' className='fa-solid fa-volume-high' /> {/* High volume icon */}
                <i slot='off' className='fa-solid fa-volume-xmark' /> {/* Mute icon */}
              </media-mute-button>
            </div>
          </media-control-bar>
        </media-controller>

        {/* Display available chapters if they exist */}
        <div className='chapters'>
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <button key={index} onClick={() => handleChapterClick(chapter.url)}>
                Chapter {chapter.number} {/* Button to select a chapter */}
              </button>
            ))
          ) : (
            <p>No chapters available.</p>
          )}
        </div>
      </div>
    </div>
  );
};