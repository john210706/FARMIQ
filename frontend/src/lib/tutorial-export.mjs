// Draft timing is deliberately visible: these captions must be aligned to the eventual recording.
export function draftCaptions(tutorial) {
  const timestamp = (seconds) => new Date(seconds * 1000).toISOString().slice(11, 23);
  return (
    'WEBVTT\n\n' +
    tutorial.steps
      .map(
        (step, i) =>
          `${i + 1}\n${timestamp(i * 20)} --> ${timestamp((i + 1) * 20)}\n${step.replace(/\r?\n/g, ' ').replaceAll('-->', '→').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}\n`,
      )
      .join('\n')
  );
}
export function recordingScript(tutorial) {
  return (
    `${tutorial.title}\n${tutorial.summary}\n\n` +
    tutorial.steps.map((step, i) => `${i + 1}. [${i * 20}–${(i + 1) * 20}s]\n${step}`).join('\n\n') +
    `\n\n${tutorial.sourceUrl}\n`
  );
}
