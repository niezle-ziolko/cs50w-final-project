import { notFound } from "next/navigation";

import AudioPlayer from "components/player";
import BookPanel from "components/panel/book-panel";

export default async function Page({ params }) {
  const { id } = await params;

  try {
    const response = await fetch(`https://echoverse.wgwcompany.workers.dev/api/data/book?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_BOOK_AUTH}`
      }
    });

    const book = await response.json();

    if (!book || !id) {
      notFound();
    };

    return (
      <div className="u22">
        <BookPanel />
        <AudioPlayer />
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    notFound();
  };
};