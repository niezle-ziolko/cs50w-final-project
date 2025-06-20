"use client";
import ClientPanel from "components/panel/panel";
import EditForm from "components/forms/edit-account";

export default function MyAccount() {
  const title = "Liked books";

  return (
    <div className="u22">
      <ClientPanel title={title} />
      <EditForm />
    </div>
  );
};