"use client";
import ClientPanel from "components/panel/panel";
import AudioPlayer from "components/player";

import "styles/css/components/forms.css";

export default function MyAccount() {
  const title = "Library";

  return (
    <div className="u22">
      <ClientPanel title={title} />
      <AudioPlayer title={title} />
    </div>
  );
};