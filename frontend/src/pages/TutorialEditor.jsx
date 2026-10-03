import React from 'react';
import { Form, Field } from '../ui';

export default function TutorialEditor({ tutorial = {}, onSave }) {
  return (
    <Form
      label={tutorial.id ? 'Save tutorial' : 'Create tutorial'}
      onSubmit={async (v, form) => {
        await onSave({
          ...v,
          steps: v.steps
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          published: v.published === 'on',
          videoUrl: v.videoUrl || null,
          audioUrl: v.audioUrl || null,
          captionsUrl: v.captionsUrl || null,
        });
        if (!tutorial.id) form.reset();
      }}
    >
      {[
        ['title', 'Title'],
        ['category', 'Category'],
        ['summary', 'Summary'],
        ['sourceUrl', 'Manufacturer / reviewed source HTTPS URL'],
        ['videoUrl', 'MP4/WebM or YouTube HTTPS URL (optional)'],
        ['audioUrl', 'Audio HTTPS URL (optional)'],
        ['captionsUrl', 'WebVTT captions HTTPS URL (required for hosted video)'],
      ].map(([name, label]) => (
        <Field
          key={name}
          label={label}
          name={name}
          defaultValue={tutorial[name] || ''}
          required={['title', 'category', 'summary', 'sourceUrl'].includes(name)}
        />
      ))}
      <Field label="Language">
        <select name="language" defaultValue={tutorial.language || 'en'}>
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>
      </Field>
      <Field label="Reviewed steps, one per line">
        <textarea name="steps" required defaultValue={tutorial.steps?.join('\n') || ''} />
      </Field>
      <p className="muted">
        Preview the original video and check its language, captions and source before publishing.
      </p>
      <label className="check">
        <input type="checkbox" name="published" defaultChecked={!!tutorial.published} />
        Publish now
      </label>
    </Form>
  );
}
