"use client";

import { useFormStatus } from "react-dom";
import { deletePostAction } from "@/lib/actions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button className="table-action danger" type="submit" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const action = deletePostAction.bind(null, id);
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <DeleteButton />
    </form>
  );
}
