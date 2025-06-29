import React from "react";
import { type Note } from "../models/Note";

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p>{note.subtitle}</p>
      <span>{note.createdAt.toLocaleString()}</span>
    </div>
  );
};

export default NoteCard;
