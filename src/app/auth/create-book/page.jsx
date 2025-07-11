"use client";
import ClientPanel from "components/panel/panel";
import CreateForm from "components/forms/create-book";

export default function MyAccount() {
  const title = "My books";

  return (
    <div className="u22">
      <ClientPanel title={title} />
      <CreateForm />
    </div>
  );
};