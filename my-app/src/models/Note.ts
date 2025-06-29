import { Timestamp } from "firebase/firestore";  

export interface Note {
  id: string;
  title: string;
  subtitle: string;
  createdAt: Date;
  lastEditedAt: Date;
}

export const noteFromFirestore = (doc: any): Note => {
  return {
    id: doc.id,
    title: doc.data().title,
    subtitle: doc.data().subtitle,
    createdAt: doc.data().createdAt.toDate(),  
    lastEditedAt: doc.data().lastEditedAt.toDate(), 
  };
};

export const noteToFirestore = (note: Note) => {
  return {
    title: note.title,
    subtitle: note.subtitle,
    createdAt: Timestamp.fromDate(note.createdAt),
    lastEditedAt: Timestamp.fromDate(note.lastEditedAt), 
  };
};
