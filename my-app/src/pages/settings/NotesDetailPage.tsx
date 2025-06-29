import React, { useState, useEffect } from "react";
import { saveNoteToFirestore } from "../../services/noteApi"; 
import { useCurrentUser } from "../../hooks/useCurrentUser"; 
import { type Note } from "../../models/Note"; 
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

interface NoteDetailPageProps {
  sectionId: string; 
}

const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ sectionId }) => {
  const { user } = useCurrentUser(); 
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      
      try {
        const noteRef = doc(db, "users", user?.uid!, "noteSections", sectionId, "notes", id);
        const noteSnap = await getDoc(noteRef);

        if (noteSnap.exists()) {
          const fetchedNote = noteSnap.data() as Note;
          setNote(fetchedNote);
          setTitle(fetchedNote.title); 
          setSubtitle(fetchedNote.subtitle);
        } else {
          console.log("No such note!");
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    fetchNote();
  }, [id, sectionId, user?.uid]); 

  const handleSave = async () => {
    if (!user) {
      alert("User not logged in");
      return;
    }

    const updatedNote: Note = {
      ...note!,
      title,
      subtitle,
      lastEditedAt: new Date(),
    };

    setIsSaving(true);
    try {
      await saveNoteToFirestore(user.uid!, sectionId, updatedNote);
      alert("Note saved successfully!");
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit Note</h2>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label>Subtitle</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>
      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default NoteDetailPage;
