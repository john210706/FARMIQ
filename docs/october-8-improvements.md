# No-signup improvements — 8 October 2026

## Delivered

- Performance: route-level lazy loading, cancellation of obsolete reads, existing debounced catalogue search verified, incremental translation updates instead of repeated whole-screen scans, asynchronous image decoding, quiet polling while offline/hidden, reduced-motion support.
- Workflow/security: demo relocation now runs transactionally and preserves active machinery/driver positions; handover-code generation validates the booking stage in the same transaction as writing the code. Added cross-account notification and demo-access checks.
- Tutorials: illustrated eight-stage rental journey, first-party localized recording scripts and downloadable draft WebVTT captions. Search now explains when nothing matches.
- Localization: new labels/errors available in Tamil/Hindi, dynamic accessible labels retain their latest text, and nearest-driver evidence has translated patterns. User-authored content stays in its original language.
- Demo: accurate number of relocated machines, honest active-rental notice, and [role-by-role demonstration instructions](demo-walkthrough.md).
- Offline/recovery: saved farm coordinates are preserved on reopening; storage failures are visible; writes are blocked offline; online events retry reads only; failed page chunks show a recovery screen.
- Administration: loaded-record search, status filtering, refresh/retry and downloadable counts grouped by status without personal details.

No new dependencies, external accounts, paid services, schema migrations or production-data changes are required. Restart the application to load the update. Changes remain uncommitted for review.

## Boundaries

This does not activate real SMS/payments/hosting, create a finished video, certify machinery safety, provide background GPS, or queue financial actions offline. Native-speaker/domain-expert review and alignment of captions to recordings remain necessary. Offline recovery tests cover drafts and read retry, not every production service-worker/device scenario. Large-dataset load testing and live provider validation remain separate work.
