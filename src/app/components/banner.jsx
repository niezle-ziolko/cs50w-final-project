'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import planetData from 'public/lottie/de34672e-4cf1-4ac2-bb1b-d9caae7d140a.json';
import musicData from 'public/lottie/204c081a-5684-4858-a89b-876b4187f66b.json';
import heartData from 'public/lottie/bc85dd48-c477-44f3-a7cb-57ee63b86e07.json';
import calmData from 'public/lottie/66d472c0-880d-4b93-bc8a-ada91cbf997a.json';

import 'styles/css/components/banner.css';

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

export default function Banner() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
  });

  if (!isClient) return null;

  return (
    <div className='banner'>
      <div className='box'>
        <Lottie options={defaultLottieOptions(planetData)} width='800px' />
        <div className='content'>
          <h1 className='title'>Discover the Galaxy of Sounds 🗺️</h1>
          <p className='text'>
            Embark on an unforgettable journey through cosmic stories and discover a limitless universe of audiobooks.
            Our app will take you to distant corners of your imagination, where each story is a new planet to explore.
            Relax, close your eyes and let the sounds transport you to the places you&apos;ve always dreamed of.
            Join us and discover how fascinating sound travel in the cosmos of literature can be!
          </p>
        </div>
      </div>
      <div className='box'>
        <div className='content'>
          <h1 className='title-align'>Create Your Galaxy of Favourite Audiobooks ❤️</h1>
          <p className='text-align'>
            Welcome to a space adventure! Like your favourite audiobooks and build your own galaxy full of amazing stories.
            With hearts, it&apos;s easy to go back to your favourites and share them with other travellers.
            Let your audio universe flourish!
          </p>
        </div>
        <Lottie options={defaultLottieOptions(heartData)} width='500px' />
      </div>
      <div className='box'>
        <Lottie options={defaultLottieOptions(calmData)} />
        <div className='content'>
          <h1 className='title'>Your Audiobooks are always within reach 🚀</h1>
          <p className='text'>
            Don&apos;t worry about getting locked out - your audiobooks are always within reach.
            Our galaxy remembers where you left off so you can return to your favourite book at any time.
            Embark on a journey through a universe of literary adventures and we&apos;ll make sure you never lose the thread.
            Open the door to new worlds and enjoy every moment with an audiobook waiting for you!
          </p>
        </div>
      </div>
      <div className='box'>
        <div className='content'>
          <h1 className='title-align'>Create your own audiobooks ✨</h1>
          <p className='text-align'>
            Give your stories a voice and let them resonate in space.
            In Echoverse, you can create audiobooks using AI, turning text into professional sound recordings.
            Open a portal to the universe of imagination and share your stories.
          </p>
        </div>
        <Lottie options={defaultLottieOptions(musicData)} width='500px' />
      </div>
    </div>
  );
};