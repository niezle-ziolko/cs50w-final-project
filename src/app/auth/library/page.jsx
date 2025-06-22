"use client";
import ClientPanel from "components/panel/panel";
import AudioPlayer from "components/player";

export default function MyAccount() {
  const title = "Library";

  return (
    <div className="u22">
      <ClientPanel title={title} />
      <AudioPlayer title={title} />
    </div>
  );
};