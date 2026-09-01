import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDoc, { LegalContactCard, LegalSection } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Partner Terms of Service | Fasty-24',
  description:
    'Terms for Fasty-24 Partners / Expert app — independent contractor relationship, jobs, KYC, and earnings.',
};

const LAST_UPDATED = 'September 1, 2026';

export default function PartnerTermsPage() {
  return (
    <LegalDoc
      title="Partner Terms of Service"
      updated={LAST_UPDATED}
      intro={
        <p>
          These Partner Terms of Service (&quot;Terms&quot;) govern your use of the{' '}
          <strong className="text-white">Fasty-24 Partners</strong> (Expert) app. By creating a
          partner account, completing KYC, or going online, you agree to these Terms. Customer
          bookings are covered by the{' '}
          <Link href="/terms" className="text-fasty-yellow hover:underline">
            customer Terms of Service
          </Link>
          .
        </p>
      }
      footerLinks={
        <>
          <Link href="/partners/privacy" className="text-sm font-bold text-fasty-yellow hover:underline">
            Partner Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Customer Terms
          </Link>
        </>
      }
    >
      <LegalSection title="1. Independent partner, not employment">
        <p>
          You are an independent service professional (or the authorized representative of one).
          Nothing in these Terms makes you an employee, agent, or joint-venture partner of Fasty-24.
          You decide when to go online, which offers to accept (subject to quality and cancellation
          rules), and how you perform the work, provided you meet our safety and quality standards
          and applicable law.
        </p>
        <p>
          You are responsible for your own taxes, statutory registrations, tools, transport, and
          insurance unless we agree otherwise in writing.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and KYC">
        <p>
          You must be at least 18 years old, legally allowed to work in India, and provide true KYC
          documents. We may approve, reject, or later suspend your account if documents are incomplete,
          mismatched, or we receive credible safety complaints. You may not share your login or let
          another person perform jobs under your profile.
        </p>
      </LegalSection>

      <LegalSection title="3. The Partner App">
        <p>
          The app lets you go online, receive nearby job offers, navigate to the customer, share
          location while on a job, submit estimates, capture arrival/completion proof, and view
          earnings. Features may change as we improve dispatch.
        </p>
        <p>
          You agree to keep the app updated and to grant permissions needed for dispatch: notifications,
          location (including background while online), camera/photos for KYC and job proof, and
          full-screen alerts if you want incoming jobs to appear over the lock screen. You can revoke
          permissions; you may then miss offers or be unable to go online.
        </p>
      </LegalSection>

      <LegalSection title="4. Job offers">
        <p>
          Offers are invitations to take a specific booking. They expire after the countdown shown in
          the app. Accepting a job is a commitment to travel to the address and perform the described
          work professionally. Repeatedly ignoring, accepting then cancelling, or declining without
          going offline may reduce your offer priority or lead to suspension.
        </p>
        <p>
          Fasty-24 does not guarantee a minimum number of jobs or earnings.
        </p>
      </LegalSection>

      <LegalSection title="5. Conduct on the job">
        <p>You must:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Arrive as promptly as reasonably possible and keep status updated in the app</li>
          <li>Treat customers respectfully and work safely</li>
          <li>Use customer name, phone, and address only to complete that booking</li>
          <li>Collect start/complete OTPs as the app requires; never bypass them</li>
          <li>Charge only amounts the customer has approved in the app (including parts/labour)</li>
          <li>Not solicit the customer off-platform to avoid Fasty-24 fees</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Earnings and commission">
        <p>
          For each completed eligible job, you earn the expert share shown in the app (your
          percentage of the service amount after platform commission and any disclosed adjustments).
          The customer payment is collected through Fasty-24 or its payment partners. Payouts are
          made to the UPI/bank details you provide, on the schedule we communicate in the app or by
          email, subject to holds for disputes, chargebacks, or suspected fraud.
        </p>
        <p>
          You authorize Fasty-24 to deduct commission, chargebacks, and amounts you owe us from
          future payouts.
        </p>
      </LegalSection>

      <LegalSection title="7. Ratings, quality, and deactivation">
        <p>
          Customers may rate jobs. We may investigate complaints, require retraining, temporarily
          hide you from dispatch, or close your partner account for safety issues, fake KYC, theft,
          harassment, no-shows, or serious Terms violations. You can contact us to discuss a
          deactivation decision.
        </p>
      </LegalSection>

      <LegalSection title="8. Privacy">
        <p>
          Partner data (including KYC, location while online, and earnings) is handled under the{' '}
          <Link href="/partners/privacy" className="text-fasty-yellow hover:underline">
            Partner Privacy Policy
          </Link>
          . Customer data you see in a job is confidential.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          The Partner App, Fasty-24 name, and related content stay our property. You get a limited,
          revocable licence to use the app to perform partner work. You may not copy, scrape, or
          reverse-engineer it.
        </p>
      </LegalSection>

      <LegalSection title="10. Liability">
        <p>
          You are responsible for the work you perform at the customer&apos;s premises, including
          damage caused by your negligence. To the maximum extent permitted by law, Fasty-24 is not
          liable for lost earnings, device issues, or indirect losses. Nothing in these Terms limits
          liability that Indian law does not allow us to limit (including fraud or death/personal
          injury caused by our negligence).
        </p>
      </LegalSection>

      <LegalSection title="11. Changes and termination">
        <p>
          We may update these Terms and post a new date on this page. Material changes may be shown
          in the app. You may stop using the Partner App and request account deletion. We may end
          access if you breach these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of India. Courts at New Delhi, India have exclusive
          jurisdiction, except where mandatory law gives you other rights.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>Questions about these Partner Terms:</p>
        <LegalContactCard />
      </LegalSection>
    </LegalDoc>
  );
}
