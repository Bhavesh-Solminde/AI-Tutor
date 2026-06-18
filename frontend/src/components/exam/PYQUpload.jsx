import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const ALLOWED = ['.pdf', '.docx', '.txt', '.md'];
const isAllowed = (file) => ALLOWED.includes('.' + file.name.split('.').pop().toLowerCase());

const PYQUpload = ({ file, onFileChange, onSkip }) => {
  const [dragActive, setDragActive] = useState(false);
  const [typeError, setTypeError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!isAllowed(f)) { setTypeError(`"${f.name}" is not supported. Use PDF, DOCX, TXT, or MD.`); return; }
    setTypeError('');
    onFileChange(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAllowed(f)) { setTypeError(`"${f.name}" is not supported. Use PDF, DOCX, TXT, or MD.`); return; }
    setTypeError('');
    onFileChange(f);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-text-base-light dark:text-text-base-dark">Upload Past Papers (PYQs)</h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
          Drag and drop past year question files for priority weighting.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 transition-all duration-300 relative ${
          dragActive
            ? 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5'
            : file
            ? 'border-emerald-500 bg-emerald-500/5'
            : 'border-border-light dark:border-border-dark hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          id="pyq-file-input"
          accept=".pdf,.docx,.txt,.md,text/plain,text/markdown"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />

        {file ? (
          <>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-base-light dark:text-text-base-dark">{file.name}</p>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark font-mono mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-slate-100 dark:bg-elevated-dark text-text-muted-light dark:text-text-muted-dark rounded-full">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-base-light dark:text-text-base-dark">
                Drag and drop past exam files here
              </p>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                Supports PDF, DOCX, TXT, MD — up to 10MB.
              </p>
            </div>
          </>
        )}
      </div>

      {typeError && (
        <div className="flex items-start space-x-2 text-red-500">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-semibold">{typeError}</p>
        </div>
      )}

      {/* AI Explanation Box */}
      <div className="p-3 bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/15 rounded-xl flex items-start space-x-2.5 text-left">
        <Sparkles className="h-4 w-4 text-primary dark:text-accent-light mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-base-light dark:text-text-base-dark leading-relaxed">
          <strong>AI Analysis:</strong> NeuralNest counts how many times each topic appears in past papers to auto-prioritize your day-by-day rescue plan.
        </p>
      </div>

      {!file && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-xs font-semibold text-text-muted-light dark:text-text-muted-dark hover:underline block pt-2"
        >
          Skip past exam weighting
        </button>
      )}
    </div>
  );
};

export default PYQUpload;
