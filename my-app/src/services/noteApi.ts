import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { type Note, noteToFirestore } from "../models/Note";
import { type NoteSection, noteSectionFromFirestore } from "../models/NoteSection";

export const saveNoteToFirestore = async (
  userId: string | undefined,
  sectionId: string,
  note: Note
) => {
  const noteSectionRef = doc(
    collection(
      collection(db, "users"),
      userId!,
      "noteSections"
    ),
    sectionId
  );

  const notesRef = collection(noteSectionRef, "notes");

  await setDoc(doc(notesRef, note.id), noteToFirestore(note), { merge: true });
};
