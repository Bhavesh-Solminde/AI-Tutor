import React, { useState, useEffect } from 'react';
import { X, Search, Grid, List, Plus, FileText, CheckCircle2, Upload } from 'lucide-react';
import useSessionStore from '../../stores/useSessionStore';
import useAuthStore from '../../stores/useAuthStore';
import toast from 'react-hot-toast';
import api from '../../lib/axiosClient';

const MaterialsModal = ({ isOpen, onClose, onConfirm }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { currentSession } = useSessionStore();
  const { user } = useAuthStore();

  // Load real materials from all sessions for this user
  useEffect(() => {
    if (!isOpen) return;
    if (user?._id) {
      api.get(`/api/sessions/${user._id}/materials`, { _silent: true })
        .then(({ data }) => {
          setMaterials((data.materials || []).map((m) => ({ ...m, selected: false })));
        })
        .catch(() => {
          setMaterials([]);
        });
    }
  }, [isOpen, user?._id]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setMaterials((prev) => prev.map((m) => m._id === id ? { ...m, selected: !m.selected } : m));
  };

  const handleSelectAll = () => {
    const allSelected = materials.every((m) => m.selected);
    setMaterials((prev) => prev.map((m) => ({ ...m, selected: !allSelected })));
  };

  const handleUploadNew = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.txt,.md';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Maximum size is 10MB.'); return; }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        if (currentSession?._id) fd.append('sessionId', currentSession._id);
        fd.append('referenceOnly', 'true');   // embed only — do NOT create topics or roadmap
        fd.append('sessionName', file.name);
        const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const newMaterial = {
          _id: data.sessionId,          // session ID is what we pass to the backend for namespace lookup
          title: file.name,
          desc: 'Reference material',
          selected: false
        };
        setMaterials((prev) => [...prev, newMaterial]);
        toast.success(`${file.name} uploaded successfully!`);
      } catch {
        // Error already toasted
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const filtered = materials.filter((m) =>
    (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.desc || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-xl flex flex-col overflow-hidden text-left">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Materials</h3>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Choose materials to reference during this session.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg border border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-slate-100 dark:hover:bg-elevated-dark">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted-light dark:text-text-muted-dark" />
            <input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-border-light dark:border-border-dark bg-transparent text-text-base-light dark:text-text-base-dark focus:outline-none focus:border-primary dark:focus:border-accent"
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className="flex items-center border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
              {[['grid', Grid], ['list', List]].map(([m, Icon]) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`p-1.5 ${viewMode === m ? 'bg-slate-100 dark:bg-elevated-dark text-primary dark:text-accent' : 'text-text-muted-light dark:text-text-muted-dark hover:bg-slate-50 dark:hover:bg-elevated-dark/50'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <button onClick={handleSelectAll} className="text-xs font-semibold text-primary dark:text-accent-light hover:underline">
              Select All
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[300px] overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={handleUploadNew}
                disabled={uploading}
                className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-4 flex flex-col items-center justify-center space-y-2 text-center text-text-muted-light dark:text-text-muted-dark hover:border-slate-400 hover:text-text-base-light dark:hover:text-text-base-dark transition-all duration-300 disabled:opacity-50"
              >
                {uploading ? <div className="h-5 w-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" /> : <Plus className="h-6 w-6" />}
                <span className="text-xs font-semibold">{uploading ? 'Uploading...' : 'Upload New'}</span>
              </button>
              {filtered.length === 0 && !uploading && (
                <div className="col-span-3 flex items-center justify-center py-8 text-xs text-slate-400">
                  No materials yet — upload your first file above.
                </div>
              )}
              {filtered.map((item) => (
                <div key={item._id} onClick={() => handleToggle(item._id)}
                  className={`border rounded-xl p-4 flex flex-col justify-between items-start space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-sm ${
                    item.selected ? 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5' : 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <FileText className={`h-5 w-5 ${item.selected ? 'text-primary dark:text-accent-light' : 'text-text-muted-light dark:text-text-muted-dark'}`} />
                    {item.selected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-base-light dark:text-text-base-dark leading-tight">{item.title}</h4>
                    <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5 truncate w-full">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div key={item._id} onClick={() => handleToggle(item._id)}
                  className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all duration-300 ${
                    item.selected ? 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5' : 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <FileText className={`h-4.5 w-4.5 flex-shrink-0 ${item.selected ? 'text-primary dark:text-accent-light' : 'text-text-muted-light dark:text-text-muted-dark'}`} />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-text-base-light dark:text-text-base-dark leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark truncate">{item.desc}</p>
                    </div>
                  </div>
                  {item.selected && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900/10">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-elevated-dark text-text-muted-light dark:text-text-muted-dark rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(materials.filter((m) => m.selected)); onClose(); }}
            className="px-4 py-2 text-xs font-semibold bg-cta hover:bg-cta-hover text-white rounded-xl shadow-md transition-all duration-300"
          >
            Confirm Selection ({materials.filter((m) => m.selected).length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialsModal;
