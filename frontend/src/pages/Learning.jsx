import React, { useState } from 'react';
import { api, download, when } from '../lib/api';
import { useData, State, Panel, Field, Button, Action, Form, Badge, Empty } from '../ui';
export default function Learning({ language }) {
  const [v, setV] = useState(0),
    [messages, setMessages] = useState([]),
    [chat, setChat] = useState(''),
    [speechError, setSpeechError] = useState('');
  const { data: tutorials, error } = useData('/tutorials', v);
  const { data: progress } = useData('/progress', v);
  const { data: history } = useData('/ai/history', v);
  const { data: tickets } = useData('/tickets', v);
  const refresh = () => setV((v) => v + 1);
  const speak = (text) => {
    if (!window.speechSynthesis) {
      setSpeechError('Audio reading is unavailable in this browser');
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' }[language];
    speechSynthesis.speak(u);
  };
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">LEARN, ASK, GET HELP</span>
        <h1>Confidence in the field.</h1>
        <p>Reviewed instructions and a clear path to support.</p>
      </div>
      <div className="two">
        <Panel title="FarmIQ assistant">
          <p className="muted">
            Answers use available inventory and booking guidance. Operating advice must be checked against the
            manufacturer manual.
          </p>
          <div className="chat-log" aria-live="polite">
            {[...(history || []), ...messages].map((m, i) => (
              <div key={m.id || i} className={`chat-message ${m.role}`}>
                <small>{m.role === 'user' ? 'You' : 'FarmIQ'}</small>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <Form
            label="Send message"
            onSubmit={async () => {
              const text = chat;
              const r = await api('/ai/chat', { method: 'POST', body: { message: text, language } });
              setMessages((m) => [
                ...m,
                { role: 'user', text },
                {
                  role: 'assistant',
                  text:
                    r.reply +
                    `\n(${r.source === 'ai' ? 'AI-generated guidance' : 'Guided help; AI not configured or unavailable'})`,
                },
              ]);
              setChat('');
            }}
          >
            <Field label="Your question">
              <textarea value={chat} onChange={(e) => setChat(e.target.value)} maxLength="2000" required />
            </Field>
            <Button
              secondary
              onClick={() => {
                const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!Speech) {
                  setSpeechError('Voice input is unavailable in this browser. Please type your question.');
                  return;
                }
                const s = new Speech();
                s.lang = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' }[language];
                s.onresult = (e) => setChat(e.results[0][0].transcript);
                s.onerror = () => setSpeechError('Microphone access failed; please type your question.');
                s.start();
              }}
            >
              Use voice input
            </Button>
            {speechError && <p className="notice">{speechError}</p>}
          </Form>
        </Panel>
        <Panel title="Contact support">
          <Form
            label="Create support ticket"
            onSubmit={async (v, f) => {
              await api('/tickets', { method: 'POST', body: v });
              f.reset();
              refresh();
            }}
          >
            <Field label="Category">
              <select name="category">
                {['HELP', 'DAMAGE', 'BREAKDOWN', 'PAYMENT', 'EMERGENCY'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Describe your question">
              <textarea name="message" maxLength="3000" required />
            </Field>
          </Form>
          {tickets?.map((t) => (
            <div className="list-row" key={t.id}>
              <div>
                <Badge>{t.status}</Badge>
                <p>{t.message}</p>
                {t.resolution && (
                  <p>
                    <strong>Response:</strong> {t.resolution}
                  </p>
                )}
                <small>{when(t.createdAt)}</small>
              </div>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Equipment learning library">
        <State data={tutorials} error={error}>
          {tutorials?.filter((t) => t.language === language).length ? (
            tutorials
              .filter((t) => t.language === language)
              .map((t) => (
                <article className="panel" key={t.id}>
                  <Badge>{t.category}</Badge>
                  <h2>{t.title}</h2>
                  <p>{t.summary}</p>
                  {t.videoUrl && (
                    <video controls preload="none" crossOrigin="anonymous" width="100%">
                      <source src={t.videoUrl} />
                      {t.captionsUrl && (
                        <track kind="captions" srcLang={t.language} src={t.captionsUrl} default />
                      )}
                      Your browser cannot play this video.
                    </video>
                  )}
                  {t.audioUrl && <audio controls preload="none" src={t.audioUrl} />}
                  <ol>
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <p>
                    <a href={t.sourceUrl} target="_blank" rel="noreferrer">
                      Original source
                    </a>
                  </p>
                  <div className="row wrap">
                    <Button secondary onClick={() => speak(t.title + '. ' + t.steps.join('. '))}>
                      Read aloud
                    </Button>
                    <Button
                      secondary
                      onClick={() =>
                        download(
                          `${t.title}.txt`,
                          `${t.title}\n${t.summary}\n\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nSource: ${t.sourceUrl}`,
                        )
                      }
                    >
                      Download guide
                    </Button>
                    <Action
                      run={() =>
                        api(`/tutorials/${t.id}/progress`, {
                          method: 'PUT',
                          body: { completedSteps: t.steps.length },
                        })
                      }
                      done={refresh}
                    >
                      {progress?.some((p) => p.tutorialId === t.id && p.completedAt)
                        ? 'Completed ✓'
                        : 'Mark reviewed'}
                    </Action>
                  </div>
                  <small>
                    Review completion records learning progress; it is not an operator certification.
                  </small>
                </article>
              ))
          ) : (
            <Empty>
              No reviewed tutorials are published in this language yet. Administrators can add source-backed
              video, audio and written guides.
            </Empty>
          )}
        </State>
      </Panel>
    </>
  );
}
