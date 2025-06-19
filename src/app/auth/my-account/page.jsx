"use client";
import ClientPanel from "components/panel/panel";
import EditForm from "components/forms/edit-account";

import "styles/css/components/panel.css";

export default function MyAccount() {
  const title = "Liked books";

  return (
    <div className="grid md:flex gap-5 justify-around">
      <ClientPanel title={title} />
      <EditForm />
    </div>
  );
};