"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import calmData from "public/66d472c0-880d-4b93-bc8a-ada91cbf997a.json";
import musicData from "public/204c081a-5684-4858-a89b-876b4187f66b.json";
import heartData from "public/bc85dd48-c477-44f3-a7cb-57ee63b86e07.json";
import planetData from "public/de34672e-4cf1-4ac2-bb1b-d9caae7d140a.json";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

export default function Banner() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
  });

  const size = 100;

  if (!isClient) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section>
        <div className="grid md:flex max-w-6xl mx-auto justify-center">
          <Lottie options={defaultLottieOptions(planetData)} width="200px" height="100%" />
          <div className="grid items-center text-center">
            <div>
              <h1>EchoVerse a Universe that speak to You</h1>
              <p className="mt-4 mb-6">Listen, create and share audiobooks with other users.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="w-auto" onClick={() => router.push("/auth/library")}>
                  Browse Audiobooks
                </button>
                <button className="w-auto" onClick={() => router.push("/auth/create-book")}>
                  Create Audiobook
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="u17">
          {[
            {
              animation: heartData,
              width: size,
              height: 95,
              title: "Huge of Audiobooks",
              text: "Access a lot of audiobooks in various categories and languages.",
            },
            {
              animation: musicData,
              width: size,
              height: size,
              title: "Create own Audiobooks",
              text: "Record and publish your own audio books with ease.",
            },
            {
              animation: calmData,
              width: 120,
              height: size,
              title: "Calm & simply",
              text: "Have anytime, anywhere access to your favorite titles.",
            },
          ].map(({ animation, width, height, title, text }, i) => (
            <div className="u10 h-63 grid p-6 items-center text-center" key={i}>
              <Lottie options={defaultLottieOptions(animation)} width={width} height={height} />
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Audiobooks */}
      <section>
        <div>
          <h3>Popular Audiobooks</h3>
          <div className="u17">
            {[
              {
                src: "/f0bdce3a-4e60-4215-9f3e-25a3fbd479ee.webp",
                title: "The Witcher - The Last Wish",
              },
              {
                src: "/3a9b1f84-d1e5-4c27-8d1f-72085a5a203f.webp",
                title: "Harry Potter and the Sorcerer's Stone",
              },
              {
                src: "/29a6d2ff-6c68-4899-99fc-1e3ea77940a1.webp",
                title: "The Lord of the Rings - The Fellowship of the Ring",
              },
            ].map((book, index) => (
              <div key={index} className="group relative overflow-hidden rounded-sm shadow-md focus:outline-none" tabIndex={0}>
                <Image
                  src={book.src}
                  alt={book.title}
                  width={600}
                  height={757}
                  className="h-auto w-full border-2 object-cover border-primary duration-300 transition-all group-hover:blur-xs group-focus:blur-xs group-active:blur-xs"
                />
                <div className="u1 p-4 absolute inset-0 opacity-0 duration-300 transition-all group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100">
                  <div className="text-center">
                    <button className="text-black border-black hover:shadow-[var(--spacing-s)_var(--spacing-s)_0px_black] hover:transform-(--transform) transition-(--transition)" onClick={() => router.push("/auth/library")}>
                      Listen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center">
          <h3>User reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                src: "/ce2f1653-5b32-4d3a-8f70-5d3f1a6f843d.webp",
                comment: "Sharing my book and audio version through EchoVerse was trivial. A few clicks and I'm done - I can share it with the world!",
                author: "Anna",
              },
              {
                src: "/f2ac1f7e-3fa0-4cb8-b2ab-b7e63a2a74c2.webp",
                comment: "Listening to audiobooks with EchoVerse is a pleasure. The app is intuitive, runs smoothly, and the selection of titles is really impressive!",
                author: "David",
              },
              {
                src: "/98d3f022-988e-48d4-9c9e-1c64df2bbdc6.webp",
                comment: "Creating audiobooks using AI in EchoVerse is a gamechanger. I don't need a studio or a voiceover - the app does it for me, and the end result is surprisingly good.",
                author: "Lisa",
              },
              {
                src: "/2780a0a3-11b3-4bb3-bef4-7ef75f7de7c5.webp",
                comment: "With EchoVerse, I can fire up an audiobook literally in seconds. Navigation is super easy and the sound quality is great. The perfect app for commuting!",
                author: "Mark",
              },
            ].map((review, index) => (
              <div key={index} className="p-6 flex border-2 border-primary text-left rounded-sm">
                <Image
                  width={500}
                  height={500}
                  src={review.src}
                  alt={`Avatar of ${review.author}`}
                  className="h-20 w-20 rounded-sm"
                />
                <div className="w-full px-2">
                  <p className="italic mb-1">{review.comment}</p>
                  <p className="text-sm font-bold">- {review.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section>
        <div className="text-center">
          <h3 className="mb-4">Start your adventure today</h3>
          <p className="mb-4">Join our community and discover a new dimension of listening to books.</p>
          <div className="flex justify-center">
            <button className="w-auto" onClick={() => router.push("/auth/register")}>
              Sign up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};