# Optional integrations: activation and safe testing

These adapters are implemented, not activated live. Keep credentials in backend environment settings, never frontend files, screenshots or Git. Rotate any secrets previously exposed. Restart the API after configuration changes. No provider purchase, SMS send, cloud-file migration or public deployment was performed by the October update.

## Twilio: two separate purposes

For an academic demonstration, in-app notifications work without Twilio. Do not buy a number just to demonstrate driver assignment.

### Phone sign-in and password reset

Create a Twilio Verify service and configure:

```ini
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
```

The account's phone must be in E.164 format, such as `+91` followed by the Indian mobile number. Verify handles the verification code; FarmIQ limits challenge attempts, prevents reuse and revokes previous sessions after a password reset. Verify does not depend on FarmIQ's booking-alert sender/outbox. Registration phone ownership verification is still separate outstanding work.

Test only with a consenting recipient permitted by your account. Review current trial restrictions, geographic permissions and Verify charges in Twilio Console before sending. The SMS login UI stays disabled when Verify configuration is absent.

### Booking alerts, inbound commands and delivery receipts

In addition to account credentials, configure an SMS-capable sender and public HTTPS callback origin:

```ini
TWILIO_FROM=+...
SMS_OUTBOX_ENABLED=true
PUBLIC_WEBHOOK_ORIGIN=https://your-api.example
```

Configure POST callbacks for incoming messages at `/api/channels/sms` and voice at `/api/channels/voice`. The application supplies its signed status-callback URL when sending booking messages. Preserve the public host/path through your proxy so signature validation succeeds.

Enable SMS consent in the test user's account. Create an owner-approved booking and pay a sandbox advance. Check Administration → Dispatch & finance → SMS delivery outbox, then confirm the actual phone receipt and provider status. An accepted API request is not proof of handset delivery. Reconcile UNKNOWN outcomes in the provider dashboard before retrying to avoid duplicate charges/messages.

Signed STOP/START updates consent; STOP cancels pending/retry alerts, not already-sent messages. Advanced Opt-Out callbacks are acknowledged without an extra duplicate reply. Booking notices use the recipient's saved language.

For Indian recipients, confirm the supported sender/route with Twilio: domestic and international routes have different sender and DLT rules. Do not assume one approval applies to both. Public launch also needs consent records, support procedures and messaging/legal review.

References: [Verify](https://www.twilio.com/docs/verify/api), [India SMS guidance](https://www.twilio.com/en-us/guidelines/in/sms), [webhook security](https://www.twilio.com/docs/usage/security).

## Video tutorials

Learn & get help contains app walkthroughs in English, Tamil and Hindi. Administration supports creating/editing titles, language, steps, direct video/audio, captions, sources and publication status. Progress is self-reported, not safety certification.

The optional learning seed also adds three English video drafts from [University of Maine Cooperative Extension](https://extension.umaine.edu/agriculture/farm-safety/tractor-safety-video-training-series/). Review regional/equipment suitability, captions and permitted embedding before publishing. Drafts are not visible to learners. YouTube loads only after the learner presses play, uses the privacy-enhanced embed host and retains a source link if embedding fails.

For direct MP4/WebM videos, supply a working matching-language WebVTT caption URL before publication. For YouTube, captions/audio are supplied by the original publisher; selecting Tamil/Hindi in FarmIQ does not translate that video. Obtain or record reviewed regional tutorials rather than relabelling English media as translated.

Recommended first recordings: booking and owner approval; driver pickup/inspection and farmer handover; farmer return request and owner return-code confirmation. Use test accounts, hide secrets and personal information, and have a domain expert review machinery-safety claims.

## Private files and malware screening

Local private storage remains the default. To use an existing private Supabase bucket:

```ini
STORAGE_DRIVER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=farmiq-private
```

Create the bucket as **private** first. Startup and upload/download checks reject public buckets. Files continue to be delivered through authorized FarmIQ routes; the service-role key never reaches the browser. Existing local uploads retain their old paths and still need their original persistent volume. This switch does not copy or delete old files.

For screening, provision an updated ClamAV daemon reachable only over a trusted private network:

```ini
CLAMAV_HOST=your-private-clamav-host
CLAMAV_PORT=3310
CLAMAV_REQUIRED=true
```

Required scanning rejects uploads when scanning is unavailable, as well as infected uploads. Monitor daemon health and signature updates. ClamAV TCP is not an internet-facing authenticated service. File type/signature/size validation remains active, but no antivirus guarantees every malicious file is detected.

Before production, test clean/rejected uploads, wrong-user download denial, scanner outage, bucket privacy and restart persistence. Back up both the database metadata and file objects; rehearse restoration in a separate environment. Define retention and authorized deletion rules. These operational services and retention jobs are not provisioned by this repository.

References: [Supabase Storage API](https://supabase.com/docs/reference/self-hosting-storage), [private downloads](https://supabase.com/docs/guides/storage/serving/downloads), [ClamAV protocol](https://docs.clamav.net/manual/Usage/ClamdProtocol.html).
