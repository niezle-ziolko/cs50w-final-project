import { notFound } from "next/navigation";

import { BOOK_QUERY } from "client/query";
import AudioPlayer from "components/player";
import { apolloClient } from "client/client";
import BookPanel from "components/panel/book-panel";

export default async function Page({ params }) {
  const { id } = await params;

  try {
    const client = apolloClient(process.env.NEXT_PUBLIC_BOOK_AUTH);

    const data = await client.query({
      query: BOOK_QUERY,
      variables: { id }
    });

    const book = data?.books;

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