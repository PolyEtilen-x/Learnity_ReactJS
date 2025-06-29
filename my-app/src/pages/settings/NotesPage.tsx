import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { type Note, noteFromFirestore } from "../../models/Note";
import { type NoteSection, noteSectionFromFirestore } from "../../models/NoteSection";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { saveNoteToFirestore } from "../../services/noteApi";
import { AppBackgroundStyles } from "../../theme/theme";
import { useTheme } from "../../theme/ThemeProvider";
import NoteDetailPage from "../settings/NotesDetailPage"; 
import { useNavigate } from "react-router-dom";

const NotesPage: React.FC = () => {
  const { user } = useCurrentUser();
  const [noteSections, setNoteSections] = useState<NoteSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteSubtitle, setNewNoteSubtitle] = useState<string>("");
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();


  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      const notesRef = collection(db, "users", user.uid!, "noteSections");
      const notesSnapshot = await getDocs(notesRef);
      const sections: NoteSection[] = [];

      for (const sectionDoc of notesSnapshot.docs) {
        const notesCollectionRef = collection(
          db,
          "users",
          user.uid!,
          "noteSections",
          sectionDoc.id,
          "notes"
        );
        const notesSnapshot = await getDocs(notesCollectionRef);
        const notes = notesSnapshot.docs.map(noteFromFirestore);
        sections.push(noteSectionFromFirestore(sectionDoc, notes));
      }

      setNoteSections(sections);
      setLoading(false);
    };

    fetchNotes();
  }, [user]);

  const handleSaveNote = async (sectionId: string) => {
    if (!newNoteTitle || !newNoteSubtitle) {
      alert("Please fill in both title and subtitle.");
      return;
    }

    const newNote: Note = {
      id: new Date().toISOString(),
      title: newNoteTitle,
      subtitle: newNoteSubtitle,
      createdAt: new Date(),
      lastEditedAt: new Date(),
    };

    try {
      if (!user) {
        alert("User not found. Please log in again.");
        return;
      }
      await saveNoteToFirestore(user.uid, sectionId, newNote);
      setNoteSections((prevSections) =>
        prevSections.map((section) =>
          section.id === sectionId
            ? { ...section, notes: [...section.notes, newNote] }
            : section
        )
      );
      setNewNoteTitle("");
      setNewNoteSubtitle("");
      alert("Note saved successfully!");
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note.");
    }
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`); // Chuyển hướng đến trang chi tiết của ghi chú
  };

  if (!user) return <div>Please log in to view your notes.</div>;

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="min-h-screen p-6 flex flex-col items-center justify-start"
    >
      {/* Render Sections */}
      {noteSections.map((section) => (
        <div
          key={section.id}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
          >
            {section.id}
          </h2>

          {/* Render each note as a box */}
          <div className="note-list mt-4 grid grid-cols-1 gap-4">
            {section.notes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-4 rounded-lg shadow-lg"
                onClick={() => handleNoteClick(note.id)}
                style={{
                  backgroundColor: isDarkMode ? "#333333" : "#f9f9f9",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              >
                <h3 className="text-xl font-semibold">{note.title}</h3>
                <p className="text-sm text-gray-500">{note.subtitle}</p>
              </div>
            ))}
          </div>

          {/* New Note Form */}
          <div className="new-note-form mt-6">
            <input
              type="text"
              placeholder="Note Title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
            />
            <textarea
              placeholder="Note Subtitle"
              value={newNoteSubtitle}
              onChange={(e) => setNewNoteSubtitle(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
            />
            <button
              onClick={() => handleSaveNote(section.id)}
              className="w-full py-3 bg-blue-500 text-black rounded-lg hover:bg-blue-600"
            >
              Save Note
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesPage;
