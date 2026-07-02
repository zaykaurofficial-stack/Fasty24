import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy | Fasty-24',
  description: 'Privacy Policy for Fasty-24 home services platform — how we collect, use, and protect your data.',
};

const LAST_UPDATED = 'July 3, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-gray-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-fasty-black text-white">
      <section className="relative pt-28 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/" className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-6 inline-flex items-center gap-1.5">
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="text-gray-400 mt-4 text-base leading-relaxed">
            This Privacy Policy describes how <strong className="text-white">Fasty-24</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, shares, and protects information when you use our website, mobile applications (customer and expert apps), and related services (collectively, the &quot;Services&quot;).
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Section title="1. Information We Collect">
          <p>We collect information you provide directly and information generated when you use our Services.</p>
          <p><strong className="text-white">Account & identity information:</strong> mobile phone number, one-time password (OTP) verification data, name, email address, gender, and date of birth (where provided during profile setup).</p>
          <p><strong className="text-white">Location information:</strong> precise location (GPS latitude/longitude) when you grant permission — used to verify service availability in your area, assign nearby professionals, and show live job tracking during active bookings.</p>
          <p><strong className="text-white">Address information:</strong> saved delivery/service addresses including house details, city, pincode, and associated coordinates.</p>
          <p><strong className="text-white">Booking & service data:</strong> services booked, appointment times, job status, OTP codes for service start/completion, ratings, reviews, and communication related to your bookings.</p>
          <p><strong className="text-white">Payment information:</strong> payment status, transaction references, and billing amounts. Payment card or UPI details are processed by our payment partners (e.g. Razorpay) and are not stored on our servers.</p>
          <p><strong className="text-white">Device & app information:</strong> device type, operating system, app version, push notification tokens, and basic diagnostic logs needed to operate and secure the Services.</p>
          <p><strong className="text-white">Expert partner information (Expert App):</strong> identity verification (KYC) documents, profile photo, skills, availability status, real-time location while online or on a job, earnings, and training records.</p>
          <p><strong className="text-white">Customer support:</strong> information you share when contacting us by phone, email, or in-app support.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use collected information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Create and manage your account and authenticate you via OTP</li>
            <li>Process bookings, dispatch professionals, and deliver home services</li>
            <li>Calculate pricing, process payments, and issue receipts</li>
            <li>Send booking updates, OTPs, service notifications, and push alerts</li>
            <li>Enable live tracking of assigned professionals during active jobs</li>
            <li>Verify expert partners through background checks and KYC</li>
            <li>Improve service quality, safety, fraud prevention, and platform performance</li>
            <li>Respond to support requests and resolve disputes</li>
            <li>Comply with applicable laws and enforce our terms</li>
          </ul>
        </Section>

        <Section title="3. How We Share Information">
          <p>We do not sell your personal information. We may share information in these cases:</p>
          <p><strong className="text-white">Service professionals:</strong> we share your name, phone number, service address, and booking details with assigned experts so they can perform the job.</p>
          <p><strong className="text-white">Payment processors:</strong> payment partners (e.g. Razorpay) receive information needed to process transactions securely.</p>
          <p><strong className="text-white">SMS & communication providers:</strong> we use third-party providers (e.g. MSG91) to send OTPs and transactional messages.</p>
          <p><strong className="text-white">Cloud & infrastructure:</strong> data may be stored or processed on secure cloud hosting and media storage services (e.g. Cloudinary for service images).</p>
          <p><strong className="text-white">Legal requirements:</strong> we may disclose information if required by law, court order, or to protect the rights, safety, and security of users, professionals, or the public.</p>
          <p><strong className="text-white">Business transfers:</strong> in the event of a merger, acquisition, or asset sale, user information may be transferred as part of that transaction with appropriate safeguards.</p>
        </Section>

        <Section title="4. Location Data">
          <p>Location access is optional but required for core features such as checking service availability, booking a service at your address, and live tracking during an active job. You can disable location permissions in your device settings; however, some features may not work without it.</p>
          <p>Expert partners share location only while online or actively performing a job, to enable dispatch and customer tracking.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain personal information for as long as your account is active or as needed to provide Services, comply with legal obligations, resolve disputes, and enforce agreements.</p>
          <p>Booking records, payment references, and support communications may be retained for statutory periods required under applicable Indian law. When data is no longer needed, we delete or anonymize it using reasonable security measures.</p>
        </Section>

        <Section title="6. Data Security">
          <p>We implement appropriate technical and organizational measures to protect your information, including encrypted connections (HTTPS), secure authentication, access controls, and OTP-verified service sessions. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.</p>
        </Section>

        <Section title="7. Your Choices & Rights">
          <p>Depending on applicable law (including India&apos;s Digital Personal Data Protection Act, 2023, where applicable), you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access and review personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information via your account settings</li>
            <li>Delete your account and associated data, subject to legal retention requirements</li>
            <li>Withdraw consent for optional processing (e.g. marketing communications)</li>
            <li>Disable push notifications or location access through device or app settings</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href={`mailto:${SITE.email}`} className="text-fasty-yellow hover:underline">{SITE.email}</a>.
            We will respond within a reasonable timeframe.
          </p>
        </Section>

        <Section title="8. Children&apos;s Privacy">
          <p>Our Services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us personal data, please contact us and we will take steps to delete it.</p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies separately.</p>
        </Section>

        <Section title="10. International Data Transfers">
          <p>Your information is primarily processed and stored in India. If data is transferred outside India, we ensure appropriate safeguards consistent with applicable data protection laws.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the &quot;Last updated&quot; date. Material changes may be notified via the app, website, or email where required by law. Continued use of the Services after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="12. Contact Us">
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, contact:</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-2 space-y-2">
            <p><strong className="text-white">Fasty-24</strong></p>
            <p>Email: <a href={`mailto:${SITE.email}`} className="text-fasty-yellow hover:underline">{SITE.email}</a></p>
            <p>Phone: <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-fasty-yellow hover:underline">{SITE.phone}</a></p>
            <p className="text-gray-400">Operating in: {SITE.cities.join(', ')}</p>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
          <Link href="/" className="text-sm font-bold text-fasty-yellow hover:underline">← Back to home</Link>
          <Link href="/categories" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Browse services</Link>
        </div>
      </div>
    </main>
  );
}
