"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { blurPlaceholder } from "../utils";

import calmData from "public/66d472c0-880d-4b93-bc8a-ada91cbf997a.json";
import musicData from "public/204c081a-5684-4858-a89b-876b4187f66b.json";
import heartData from "public/bc85dd48-c477-44f3-a7cb-57ee63b86e07.json";
import planetData from "public/de34672e-4cf1-4ac2-bb1b-d9caae7d140a.json";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

export default function Banner() {
  const router = useRouter();

  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
  });

  const size = 100;

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
                src: "/9c952f2e-dc15-4db0-b9c0-0782817b8f58.webp",
                title: "The Sixth Dead",
              },
              {
                src: "/d74a758e-5c65-4b77-af84-3f1e27f939a9.webp",
                title: "Star Protocol",
              },
              {
                src: "/6ffdb3d0-57fe-4008-9bbf-9798d2af71c6.webp",
                title: "Touch of Control",
              },
            ].map((book, index) => (
              <div key={index} className="group relative overflow-hidden rounded-sm shadow-md focus:outline-none" tabIndex={0}>
                <Image
                  width={600}
                  height={757}
                  loading="lazy"
                  src={book.src}
                  alt={book.title}
                  placeholder="blur"
                  blurDataURL={blurPlaceholder}
                  className="h-auto w-full border-2 object-cover border-primary duration-300 transition-all group-hover:blur-xs group-focus:blur-xs group-active:blur-xs"
                />
                <div className="u1 p-4 absolute inset-0 opacity-0 duration-300 transition-all group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100">
                  <div className="text-center">
                    <button className="text-black border-black hover:shadow-[var(--spacing-s)_var(--spacing-s)_0px_black] hover:transform-(--transform) active:shadow-[var(--spacing-s)_var(--spacing-s)_0px_black] active:transform-(--transform) transition-(--transition)" onClick={() => router.push("/auth/library")}>
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
                  loading="lazy"
                  src={review.src}
                  placeholder="blur"
                  blurDataURL={blurPlaceholder}
                  className="h-20 w-20 rounded-sm"
                  alt={`Avatar of ${review.author}`}
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