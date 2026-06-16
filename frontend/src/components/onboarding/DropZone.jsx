import React, { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';

const DropZone = ({ onFileSelected, selectedFileName }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5'
          : selectedFileName
          ? 'border-emerald-500 bg-emerald-500/5'
          : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-accent bg-slate-50 dark:bg-slate-900/30'
      }`}
    >
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        id="file-upload-input"
        onChange={handleFileInput}
      />
      <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block w-full h-full">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 transition-colors">
          {selectedFileName ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {selectedFileName ? `Selected: ${selectedFileName}` : 'Drag & drop your syllabus PDF here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Accepts PDF, DOCX, TXT up to 10MB</p>
        </div>
      </label>
    </div>
  );
};

export default DropZone;
