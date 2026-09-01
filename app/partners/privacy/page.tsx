import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';
import LegalDoc, { LegalContactCard, LegalSection } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Partner Privacy Policy | Fasty-24',
  description:
    'Privacy Policy for the Fasty-24 Partners / Expert app — KYC, location, job offers, and earnings data.',
};

const LAST_UPDATED = 'September 1, 2026';

export default function PartnerPrivacyPage() {
  return (
    <LegalDoc
      title="Partner Privacy Policy"
      updated={LAST_UPDATED}
      intro={
        <p>
          This Privacy Policy describes how <strong className="text-white">Fasty-24</strong> (&quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;) collects, uses, shares, and protects information when you use the{' '}
          <strong className="text-white">Fasty-24 Partners</strong> (Expert) mobile application and related
          partner tools (the &quot;Partner App&quot;). It is written for service professionals. If you use
          Fasty-24 as a customer, see the{' '}
          <Link href="/privacy" className="text-fasty-yellow hover:underline">
            customer Privacy Policy
          </Link>
          .
        </p>
      }
      footerLinks={
        <>
          <Link href="/partners/terms" className="text-sm font-bold text-fasty-yellow hover:underline">
            Partner Terms
          </Link>
          <Link href="/privacy" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Customer Privacy Policy
          </Link>
          <Link href="/delete-account" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Delete Account
          </Link>
        </>
      }
    >
      <LegalSection title="1. Information We Collect">
        <p>We collect information you provide and information generated when you use the Partner App.</p>
        <p>
          <strong className="text-white">Account & identity:</strong> mobile number, OTP verification
          data, name, email, profile photo, skills, and bio.
        </p>
        <p>
          <strong className="text-white">KYC & onboarding:</strong> identity documents (for example
          Aadhaar/PAN or other IDs you upload), selfies, and any notes from our review team. We use
          this to verify you are eligible to take jobs.
        </p>
        <p>
          <strong className="text-white">Location:</strong> precise GPS while you are marked{' '}
          <em>online</em> (so we can offer nearby jobs) and while you are assigned to an active job
          (so the customer can see you are on the way). Background location is used only for these
          dispatch and tracking purposes, together with an ongoing &quot;You are online&quot;
          notification.
        </p>
        <p>
          <strong className="text-white">Job & earnings data:</strong> offers you receive, accept, or
          decline; job status; estimates and parts; completion photos; ratings; payout amounts; and
          commission breakdown.
        </p>
        <p>
          <strong className="text-white">Device & app information:</strong> device type, OS, app
          version, push notification token, diagnostic logs, and permission states (notifications,
          camera, photos, location, full-screen alerts / display-over-other-apps where you grant
          them). Camera and photos are used for KYC and job-arrival / completion proof.
        </p>
        <p>
          <strong className="text-white">Support:</strong> information you share by phone, email, or
          in-app when you contact us.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use this information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create and manage your partner account and authenticate you via OTP</li>
          <li>Verify identity (KYC) and skills before you go online</li>
          <li>Dispatch nearby job offers and show a full-screen / heads-up incoming-job alert</li>
          <li>Share live location with the customer only during an active assigned job</li>
          <li>Process job workflow (accept/decline, navigate, estimate, complete, collect payment status)</li>
          <li>Calculate earnings, commission, and payouts</li>
          <li>Send job alerts, OTPs, and operational push notifications</li>
          <li>Improve safety, fraud prevention, quality, and app reliability</li>
          <li>Respond to support requests and resolve disputes with customers</li>
          <li>Comply with applicable law and enforce the Partner Terms</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Share Information">
        <p>We do not sell your personal information. We may share it as follows:</p>
        <p>
          <strong className="text-white">Customers:</strong> when you are assigned a job we share your
          first name (or display name), rating, vehicle/ETA information where available, and live
          location during that job so they can receive the service safely.
        </p>
        <p>
          <strong className="text-white">You receive customer details:</strong> name, phone, service
          address, and job notes needed to perform the booking. You must use this only to complete
          that job (see Partner Terms).
        </p>
        <p>
          <strong className="text-white">Payment processors:</strong> partners such as Razorpay receive
          what is needed to process customer payments. Payout details you provide (for example UPI or
          bank) are used to send your earnings.
        </p>
        <p>
          <strong className="text-white">SMS & push providers:</strong> we use providers (for example
          Expo / FCM and SMS vendors) to deliver OTPs and job alerts.
        </p>
        <p>
          <strong className="text-white">Cloud & media:</strong> hosting and image storage (for example
          Cloudinary) for KYC and job photos, under our instructions.
        </p>
        <p>
          <strong className="text-white">Legal:</strong> if required by law, court order, or to protect
          users, partners, or the public.
        </p>
        <p>
          <strong className="text-white">Business transfers:</strong> if Fasty-24 is involved in a
          merger or sale, partner information may transfer with appropriate safeguards.
        </p>
      </LegalSection>

      <LegalSection title="4. Location, notifications, and overlay">
        <p>
          Going online requires location (including background location) so we can match you to nearby
          jobs. You can go offline or revoke location in Android settings; you will then stop
          receiving dispatch offers.
        </p>
        <p>
          Incoming jobs use high-priority notifications and, if you allow it, full-screen alerts so
          an offer can appear over the lock screen or home screen. Display-over-other-apps is optional
          on some devices. These permissions are for job offers only, not advertising.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We keep partner account, KYC, job, and payout records while your account is active and as
          needed for tax, dispute, and legal retention under Indian law. When no longer required, we
          delete or anonymize data using reasonable measures.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <p>
          We use HTTPS, OTP authentication, access controls, and role-restricted admin tools. No
          transmission or storage method is 100% secure.
        </p>
      </LegalSection>

      <LegalSection title="7. Your Choices & Rights">
        <p>
          Depending on applicable law (including India&apos;s Digital Personal Data Protection Act,
          2023, where applicable), you may:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access and review personal information we hold about you</li>
          <li>Correct profile details in the Partner App</li>
          <li>Delete your partner account, subject to legal retention of job/payout records</li>
          <li>Go offline or disable location, notifications, or full-screen alerts in device settings</li>
        </ul>
        <p>
          To delete your account, use our{' '}
          <Link href="/delete-account" className="text-fasty-yellow hover:underline">
            Account Deletion page
          </Link>{' '}
          and mention that you are a <strong className="text-white">Fasty-24 Partner</strong>. For
          other requests, email{' '}
          <a href={`mailto:${SITE.email}`} className="text-fasty-yellow hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Children&apos;s Privacy">
        <p>
          The Partner App is only for individuals 18 years or older. We do not knowingly onboard
          minors as professionals.
        </p>
      </LegalSection>

      <LegalSection title="9. Third-Party Links">
        <p>
          The Partner App may open maps, payment, or system settings screens operated by others. Their
          privacy policies apply to those services.
        </p>
      </LegalSection>

      <LegalSection title="10. International Data Transfers">
        <p>
          Information is primarily processed in India. If transferred outside India, we use safeguards
          consistent with applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <p>
          We may update this policy and will change the &quot;Last updated&quot; date. Material
          changes may be notified in the Partner App. Continued use after changes means you accept
          the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <p>Questions about partner privacy or your data:</p>
        <LegalContactCard />
      </LegalSection>
    </LegalDoc>
  );
}
