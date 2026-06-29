import React, { useEffect, useState } from 'react';
import { Youtube, ExternalLink, Play, AlertCircle } from 'lucide-react';
import api from '../../lib/axiosClient';

const YoutubeSuggestions = ({ topic, hideHeader = false, onLoaded }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topic || topic === 'New Study Chat' || topic === 'Study Session' || topic === 'General Study') {
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/api/tutor/youtube/search`, {
          params: { topic },
          _silent: true,
        });
        if (data && data.videos) {
          setVideos(data.videos);
          if (onLoaded) {
            onLoaded(data.videos);
          }
        } else {
          if (onLoaded) {
            onLoaded([]);
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube suggestions:', err);
        setError('Failed to load video suggestions');
        if (onLoaded) {
          onLoaded([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [topic]);

  if (!topic || topic === 'New Study Chat' || topic === 'Study Session' || topic === 'General Study') {
    return null;
  }

  if (loading) {
    return (
      <div className={`${hideHeader ? '' : 'mt-4'} p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60/50 dark:bg-slate-900/30 animate-pulse`}>
        {!hideHeader && <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-3" />}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return null; // Return null silently on no suggestions or error
  }

  return (
    <div className={`${hideHeader ? '' : 'mt-4'} w-full`}>
      {!hideHeader && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400">
            <Youtube className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#333333] dark:text-slate-200">
            Related Videos on {topic}
          </h4>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {videos.map((vid) => (
          <a
            key={vid.videoId || vid.url}
            href={vid.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-dark/95 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-900/40 transition-all duration-300"
          >
            {/* Thumbnail aspect-video container */}
            <div className="relative aspect-video w-full overflow-hidden bg-white/80 dark:bg-slate-900">
              {vid.thumbnail ? (
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/80 dark:bg-slate-900 text-[#666666]">
                  <Play className="h-8 w-8 stroke-[1.5]" />
                </div>
              )}
              {/* Hover overlay with play button */}
              <div className="absolute inset-0 bg-[#181818]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play className="h-4.5 w-4.5 fill-current" />
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="p-2.5 flex-1 flex flex-col justify-between text-left">
              <h5 className="text-xs font-bold text-[#333333] dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {vid.title}
              </h5>
              {vid.channelName && (
                <p className="mt-1 text-[10px] font-semibold text-[#666666] dark:text-[#555555] truncate">
                  {vid.channelName}
                </p>
              )}
            </div>

            {/* Floating top right external link icon */}
            <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-[#181818]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default YoutubeSuggestions;
