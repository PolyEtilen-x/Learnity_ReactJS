import { type Note } from "../models/Note";

export interface NoteSection {
  id: string;
  notes: Note[];
}

export const getLatestEditTime = (notes: Note[]): Date => {
  if (notes.length === 0) return new Date(1970, 1, 1); 
  const sortedNotes = [...notes].sort((a, b) => b.lastEditedAt.getTime() - a.lastEditedAt.getTime());
  return sortedNotes[0].lastEditedAt;
};

export const noteSectionFromFirestore = (doc: any, notes: Note[]): NoteSection => {
  return {
    id: doc.id,
    notes: notes,
  };
};
