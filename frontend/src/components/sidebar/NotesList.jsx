import React, { useEffect, useState } from 'react';
import { UploadCloud, FileText, FileCode2, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axiosClient';
import useAuthStore from '../../stores/useAuthStore';
import useSessionStore from '../../stores/useSessionStore';

const iconFor = (method) => {
  if (method === 'pdf') return <FileText className="h-3.5 w-3.5 flex-shrink-0" />;
  return <FileCode2 className="h-3.5 w-3.5 flex-shrink-0" />;
};

/**
 * NotesList — shows only reference materials (uploaded via chat Materials modal).
 * These are chat-context materials only; they have nothing to do with the roadmap.
 * Clicking one does NOT navigate — it's informational only.
 */
const NotesList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession } = useSessionStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = () => {
    if (!user?._id) return;
    setLoading(true);
    api.get(`/api/sessions/${user._id}/materials`, { _silent: true })
      .then(({ data }) => setMaterials(data.materials || []))
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  // Re-fetch whenever a new session is created or after navigation
  }, [user?._id, currentSession?._id]);

  if (loading) {
    return <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark italic px-1 py-2">Loading...</p>;
  }

  if (materials.length === 0) {
    return (
      <div className="pt-2 space-y-1.5">
        <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark italic px-1">
          No reference materials yet
        </p>
        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark px-1 leading-snug flex items-center gap-1">
          Attach materials in any chat using the
          <span className="inline-flex items-center">
            <Paperclip className="h-3 w-3" />
          </span>
          button to add context for the AI tutor.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 pt-2">
      {materials.map((m) => (
        <li key={m._id}>
          <div
            className="w-full flex items-center space-x-2 p-1.5 rounded-lg text-xs
              text-text-muted-light dark:text-text-muted-dark
              hover:bg-slate-100 dark:hover:bg-elevated-dark transition-colors cursor-default"
            title={`${m.title} — reference material for AI chat context`}
          >
            <span className="text-primary dark:text-accent">{iconFor(m.inputMethod)}</span>
            <span className="truncate">{m.title}</span>
            <span className="ml-auto text-[9px] font-mono opacity-60 flex-shrink-0">ref</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NotesList;
