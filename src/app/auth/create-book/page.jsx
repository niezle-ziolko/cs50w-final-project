"use client";
import ClientPanel from "components/panel/panel";
import CreateForm from "components/forms/create-book";

import "styles/css/components/forms.css";
import "styles/css/components/panel.css";

export default function MyAccount() {
  const title = "My books";

  return (
    <div className="page">
      <ClientPanel title={title} />
      <CreateForm />
    </div>
  );
};