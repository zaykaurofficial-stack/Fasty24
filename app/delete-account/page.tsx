import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Delete Account | Fasty-24',
  description: 'Request deletion of your Fasty-24 account and associated personal data.',
};

const LAST_UPDATED = 'July 3, 2026';
const DELETE_EMAIL = 'hello@fasty24.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-gray-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

const STEPS = [
  {
    step: '1',
    title: 'Send a deletion request',
    desc: `Email us at ${DELETE_EMAIL} from the email address linked to your Fasty-24 account (or include your registered mobile number if you signed up with OTP).`,
  },
  {
    step: '2',
    title: 'Include required details',
    desc: 'Subject line: "Fasty-24 Account Deletion Request". In the body, provide your full name, registered phone number, and registered email (if any).',
  },
  {
    step: '3',
    title: 'Confirm your identity',
    desc: 'We may reply to verify ownership of the account (e.g. confirm OTP or reply from your registered contact). This protects your data from unauthorized deletion requests.',
  },
  {
    step: '4',
    title: 'Deletion processed',
    desc: 'Once verified, we delete your account and personal data within 30 days and send you a confirmation email when complete.',
  },
];

export default function DeleteAccountPage() {
  const mailtoSubject = encodeURIComponent('Fasty-24 Account Deletion Request');
  const mailtoBody = encodeURIComponent(
    'Hello Fasty-24 team,\n\nI would like to request deletion of my Fasty-24 account and associated personal data.\n\nFull name:\nRegistered phone number:\nRegistered email (if any):\n\nThank you.',
  );
  const mailtoHref = `mailto:${DELETE_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <main className="min-h-screen bg-fasty-black text-white">
      <section className="relative pt-28 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/" className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-6 inline-flex items-center gap-1.5">
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Delete Your Account</h1>
          <p className="text-gray-400">Last updated: {LAST_UPDATED}</p>
          <p className="text-gray-300 mt-4 text-base leading-relaxed">
            This page explains how users of the <strong className="text-white">Fasty-24</strong> app and website can request deletion of their account and associated personal data. Fasty-24 is the developer name shown on our Google Play Store listing.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Prominent CTA */}
        <div className="bg-fasty-yellow/10 border-2 border-fasty-yellow/30 rounded-2xl p-6 sm:p-8 mb-12">
          <h2 className="text-lg font-extrabold text-white mb-2">Request account deletion</h2>
          <p className="text-gray-300 text-sm mb-5 leading-relaxed">
            To delete your Fasty-24 account, email us using the button below. You must use the email or phone number registered on your account so we can verify your identity.
          </p>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 bg-fasty-yellow text-fasty-black font-extrabold px-6 py-3.5 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_4px_20px_rgba(255,196,0,0.25)]"
          >
            Email deletion request →
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Or write to:{' '}
            <a href={`mailto:${DELETE_EMAIL}`} className="text-fasty-yellow hover:underline">{DELETE_EMAIL}</a>
          </p>
        </div>

        <Section title="Steps to request account deletion">
          <p>Follow these steps to request that your Fasty-24 account and personal data be deleted:</p>
          <ol className="space-y-4 mt-4">
            {STEPS.map((s) => (
              <li key={s.step} className="flex gap-4 bg-white/4 border border-white/8 rounded-xl p-4">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-fasty-yellow text-fasty-black font-extrabold flex items-center justify-center text-sm">
                  {s.step}
                </span>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="What data is deleted">
          <p>When your deletion request is approved and processed, we permanently delete or anonymize the following:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Account profile (name, phone number, email, gender, date of birth)</li>
            <li>Login credentials (password hash, OTP records, session tokens)</li>
            <li>Saved addresses and location preferences</li>
            <li>Push notification tokens</li>
            <li>Active or pending bookings tied to your account (where legally permitted)</li>
            <li>Support conversations linked to your identity</li>
          </ul>
        </Section>

        <Section title="What data may be kept">
          <p>Some information may be retained after account deletion where required by law or for legitimate business purposes:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong className="text-white">Completed booking & payment records</strong> — retained for tax, accounting, and dispute resolution (typically up to 7 years under applicable Indian law)
            </li>
            <li>
              <strong className="text-white">Payment transaction references</strong> — retained as required by payment partners and financial regulations (Razorpay transaction IDs, amounts, dates)
            </li>
            <li>
              <strong className="text-white">Fraud prevention & security logs</strong> — anonymized or minimized records kept for up to 90 days to prevent abuse
            </li>
            <li>
              <strong className="text-white">Legal compliance data</strong> — any data we are legally obligated to retain beyond deletion
            </li>
          </ul>
          <p className="mt-3">Retained data is no longer used for marketing or active service delivery and is access-restricted to authorized personnel only.</p>
        </Section>

        <Section title="Retention period after your request">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Processing time:</strong> we aim to complete account deletion within <strong className="text-white">30 days</strong> of verifying your identity.</li>
            <li><strong className="text-white">Legal retention:</strong> booking and payment records may be kept for up to <strong className="text-white">7 years</strong> after the last transaction, as required by law, after which they are deleted or anonymized.</li>
            <li><strong className="text-white">Backup systems:</strong> deleted data may persist in encrypted backups for up to <strong className="text-white">90 days</strong> before being permanently purged.</li>
          </ul>
        </Section>

        <Section title="Expert (service partner) accounts">
          <p>
            If you are a Fasty-24 Expert (service professional), email{' '}
            <a href={`mailto:${DELETE_EMAIL}`} className="text-fasty-yellow hover:underline">{DELETE_EMAIL}</a>{' '}
            with subject &quot;Fasty-24 Expert Account Deletion Request&quot;. Include your registered phone number and expert name. KYC documents may be retained as required by law even after account closure.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            For privacy-related questions, see our{' '}
            <Link href="/privacy" className="text-fasty-yellow hover:underline">Privacy Policy</Link>.
            Contact us at{' '}
            <a href={`mailto:${SITE.email}`} className="text-fasty-yellow hover:underline">{SITE.email}</a>{' '}
            or{' '}
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-fasty-yellow hover:underline">{SITE.phone}</a>.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
          <a
            href={mailtoHref}
            className="text-sm font-bold text-fasty-yellow hover:underline"
          >
            Request deletion via email →
          </a>
          <Link href="/privacy" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
