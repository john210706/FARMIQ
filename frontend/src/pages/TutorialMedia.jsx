import React, { useState } from 'react';
import { Button } from '../ui';

export default function TutorialMedia({ tutorial: t }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!t.videoUrl) return null;
  if (t.youtubeVideoId)
    return (
      <div className="stack">
        {loaded ? (
          <iframe
            className="tutorial-video"
            title={t.title}
            src={`https://www.youtube-nocookie.com/embed/${t.youtubeVideoId}?cc_load_policy=1&cc_lang_pref=${t.language}`}
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="empty">
            <p>This video is hosted on YouTube. Load it to connect to YouTube.</p>
            <Button secondary onClick={() => setLoaded(true)}>
              Load video
            </Button>
          </div>
        )}
        <p className="muted">Video language and captions depend on the original publisher.</p>
        <a href={t.videoUrl} target="_blank" rel="noreferrer">
          Open original video
        </a>
      </div>
    );
  return (
    <div className="stack">
      <video controls preload="none" crossOrigin="anonymous" width="100%" onError={() => setFailed(true)}>
        <source src={t.videoUrl} onError={() => setFailed(true)} />
        {t.captionsUrl && <track kind="captions" srcLang={t.language} src={t.captionsUrl} default />}
      </video>
      {failed && (
        <p className="notice" role="status">
          Video could not load. Use the original source or read the guide below.
        </p>
      )}
      <a href={t.videoUrl} target="_blank" rel="noreferrer">
        Open original video
      </a>
    </div>
  );
}
