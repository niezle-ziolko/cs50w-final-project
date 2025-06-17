"use client";
import Link from "next/link";
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
                <button onClick={() => router.push("/auth/library")}>
                  Browse Audiobooks
                </button>
                <button onClick={() => router.push("/auth/create-book")}>
                  Create Audiobook
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="u15">
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
        <div className="max-w-6xl mx-auto">
          <h3>Popular Audiobooks</h3>
          <div className="u15">
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
              <div key={index} className="group relative overflow-hidden rounded-lg shadow-md">
                <Image
                  src={book.src}
                  alt={book.title}
                  width={325}
                  height={482}
                  className="h-[482px] w-full object-cover border-2 border-primary rounded-lg transition-all duration-300 group-hover:blur-xs"
                />
                <div className="absolute inset-0 p-4 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h4 className="mb-3 font-semibold">{book.title}</h4>
                    <button className="border-black hover:shadow-[6px_6px_0px_black]" onClick={() => router.push("/auth/library")}>
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
            <Testimonial
              name="Anna"
              text="I love this platform! I discovered so many amazing stories and was finally able to create my own audiobook."
            />
            <Testimonial
              name="Mark"
              text="The best app for listening and creating audiobooks! Very intuitive and user friendly."
            />
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className=" px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Zacznij swoją przygodę już dziś</h2>
          <p className="text-lg text-gray-700 mb-8">
            Dołącz do naszej społeczności i odkryj nowy wymiar słuchania książek.
          </p>
          <Link href="/signup">
            <button className="py-2 px-6 text-base font-bold rounded-sm cursor-pointer bg-bl-100 transition-all border-2 border-primary text-b-100 hover:shadow-lg hover:scale-105 font-[var(--secondary-font-family)]">
              Zarejestruj się
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

function Testimonial({ name, text }) {
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-sm text-left">
      <p className="text-gray-800 italic mb-4">{text}</p>
      <p className="text-sm text-gray-600 font-semibold">- {name}</p>
    </div>
  );
}
