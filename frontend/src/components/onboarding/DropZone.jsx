import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['.pdf', '.docx', '.txt', '.md'];
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
];

const isAllowed = (file) => {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return ALLOWED_TYPES.includes(ext) || ALLOWED_MIME.includes(file.type) || file.type === '';
};

const DropZone = ({ onFileSelected, selectedFileName }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [typeError, setTypeError] = useState('');

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
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!isAllowed(file)) {
      setTypeError(`"${file.name}" is not supported. Please upload a PDF, DOCX, TXT, or Markdown (.md) file.`);
      return;
    }
    setTypeError('');
    onFileSelected(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowed(file)) {
      setTypeError(`"${file.name}" is not supported. Please upload a PDF, DOCX, TXT, or Markdown (.md) file.`);
      return;
    }
    setTypeError('');
    onFileSelected(file);
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
        accept=".pdf,.docx,.txt,.md,text/markdown,text/x-markdown"
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
            {selectedFileName ? `Selected: ${selectedFileName}` : 'Drag & drop your syllabus here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Accepts PDF, DOCX, TXT, MD — up to 10MB</p>
        </div>
      </label>
      {typeError && (
        <div className="mt-3 flex items-start space-x-2 text-red-500">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-semibold">{typeError}</p>
        </div>
      )}
    </div>
  );
};

export default DropZone;
