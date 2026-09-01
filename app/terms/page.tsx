import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';
import LegalDoc, { LegalContactCard, LegalSection } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Terms of Service | Fasty-24',
  description: 'Terms of Service for Fasty-24 home services — bookings, payments, and use of the customer app and website.',
};

const LAST_UPDATED = 'September 1, 2026';

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated={LAST_UPDATED}
      intro={
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Fasty-24 website, customer mobile
          application, and related services (the &quot;Services&quot;). By creating an account or booking a
          service, you agree to these Terms. If you are a service professional, the{' '}
          <Link href="/partners/terms" className="text-fasty-yellow hover:underline">
            Partner Terms
          </Link>{' '}
          apply instead.
        </p>
      }
      footerLinks={
        <>
          <Link href="/" className="text-sm font-bold text-fasty-yellow hover:underline">
            ← Back to home
          </Link>
          <Link href="/privacy" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </>
      }
    >
      <LegalSection title="1. Who we are">
        <p>
          Fasty-24 is a home-services marketplace. We connect customers with independent, verified
          professionals for jobs such as AC repair, RO servicing, cleaning, and related household work.
          We are not the employer of professionals assigned to your booking unless we expressly say so.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and able to form a binding contract under Indian law. You
          are responsible for the accuracy of the phone number, name, and addresses you provide.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <p>
          Accounts are created using your mobile number and a one-time password (OTP). You must keep
          OTP codes confidential. You are responsible for activity on your account. Notify us promptly
          at {SITE.email} if you suspect unauthorized use.
        </p>
      </LegalSection>

      <LegalSection title="4. Bookings">
        <p>
          When you place a booking you request a professional for a described service at a stated
          address and time. Acceptance of a job by a professional, travel time, and completion depend
          on availability, traffic, and site conditions. Arrival estimates (including 15–20 minute
          targets) are goals, not guaranteed arrival times in every case.
        </p>
        <p>
          You must provide safe access to the premises, accurate issue details, and a person on site
          who can authorize the work. OTP codes shown in the app are used to start and complete jobs
          securely — do not share them with anyone other than the assigned professional at your door.
        </p>
      </LegalSection>

      <LegalSection title="5. Pricing and payments">
        <p>
          Displayed prices, inspection fees, and parts/labour estimates may change after on-site
          diagnosis. Additional work is performed only after you approve an estimate in the app where
          required. Payments are processed by our payment partners (for example Razorpay). Card and
          UPI credentials are not stored on Fasty-24 servers.
        </p>
        <p>
          You agree to pay the confirmed amount for completed work, including approved parts and
          applicable taxes. Refunds, if any, are handled according to the facts of the job and
          applicable law.
        </p>
      </LegalSection>

      <LegalSection title="6. Cancellations and no-shows">
        <p>
          You may cancel a booking before a professional is assigned or, where the app allows, before
          they are en route. Late cancellations or refusing access after dispatch may attract a
          visit/cancellation charge. We may cancel a booking if we cannot find a suitable professional
          or if we detect fraud or unsafe conditions.
        </p>
      </LegalSection>

      <LegalSection title="7. Conduct and safety">
        <p>
          Treat professionals with respect. Do not request illegal work, harassment, or unsafe
          conditions. We may suspend accounts that abuse professionals, the platform, or payment
          systems. Reviews must be honest and not defamatory.
        </p>
      </LegalSection>

      <LegalSection title="8. Location and communications">
        <p>
          Core features need location (to confirm serviceability and tracking during an active job)
          and notifications (booking updates). You can revoke permissions in device settings; some
          features will then be unavailable. Transactional SMS, OTP, and push messages are part of
          the service.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          The Fasty-24 name, logo, app, and content are owned by us or our licensors. You may not copy,
          scrape, or reverse-engineer the Services except as allowed by law.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          Home-service work is performed by independent professionals. To the maximum extent permitted
          by law, Fasty-24 is not liable for indirect, incidental, or consequential losses, or for
          delays caused by traffic, weather, or third parties. Our aggregate liability for a booking
          is limited to the amount you paid for that booking, except where Indian law requires
          otherwise (including liability that cannot be excluded for death or personal injury caused
          by negligence, or for fraud).
        </p>
      </LegalSection>

      <LegalSection title="11. Privacy">
        <p>
          How we collect and use personal data is described in our{' '}
          <Link href="/privacy" className="text-fasty-yellow hover:underline">
            Privacy Policy
          </Link>
          . To delete your account, use the{' '}
          <Link href="/delete-account" className="text-fasty-yellow hover:underline">
            Account Deletion
          </Link>{' '}
          page.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes and termination">
        <p>
          We may update these Terms and will post the new date on this page. Continued use after
          changes means you accept the updated Terms. We may suspend or close accounts that violate
          these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing law">
        <p>
          These Terms are governed by the laws of India. Courts at New Delhi, India shall have
          exclusive jurisdiction, subject to any rights you have under mandatory consumer-protection
          law.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>Questions about these Terms:</p>
        <LegalContactCard />
      </LegalSection>
    </LegalDoc>
  );
}
