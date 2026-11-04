import type { Metadata } from "next";
import { LegalPage, P, Ul, type LegalSection } from "@/components/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using the Admissions House website and counselling service, and what you can and cannot expect from us.",
};

const mail = (
  <a href={`mailto:${SITE.email}`} className="font-semibold text-brand underline underline-offset-4">
    {SITE.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    title: "Agreeing to these terms",
    body: (
      <>
        <P>
          These terms apply when you use {SITE.url.replace("https://", "")} or speak to the counsellors of {SITE.name}. By using the site or sending
          an enquiry, you agree to them and to our privacy policy. If you do not agree, please do not use the site.
        </P>
        <P>
          You may use the site if you are 18 or older. If you are younger, please use it together with a parent or guardian, who is
          responsible for your use.
        </P>
      </>
    ),
  },
  {
    title: "What we do, and what we are not",
    body: (
      <>
        <P>
          We publish information about colleges, universities, courses and entrance exams, and we offer free counselling to help you pick a
          college and complete your admission.
        </P>
        <P>
          We are not a college or a university, and we are not connected to any government body, exam board or regulator. We do not run any
          entrance exam and we do not decide who gets a seat. The college does.
        </P>
      </>
    ),
  },
  {
    title: "Our relationship with colleges",
    body: (
      <>
        <P>
          Some colleges and universities that we list work with us, and may pay us a fee when a student we helped takes admission with
          them. This does not add anything to what you pay, and the fee is never taken from you.
        </P>
        <P>
          We try to suggest colleges that suit your marks, budget and goals. You should still compare more than one option, visit or speak
          to the college, and make the decision yourself.
        </P>
      </>
    ),
  },
  {
    title: "No promise of admission",
    body: (
      <P>
        Counselling improves your chances of choosing well and applying on time, but we cannot promise you a seat, a rank, a scholarship, a
        placement or any other result. Colleges and exam bodies make their own decisions, and they can change their rules at any time.
      </P>
    ),
  },
  {
    title: "Information on the site",
    body: (
      <>
        <P>
          College details such as fees, cut-offs, seats, rankings, placements and dates come from public sources and from the colleges
          themselves. They change often. We work to keep them correct, but we do not promise that every detail is complete or up to date.
        </P>
        <P>
          Please confirm the important facts, especially fees, eligibility, last dates and approvals, on the college&apos;s own website or
          notice before you pay or apply.
        </P>
      </>
    ),
  },
  {
    title: "How you may use the site",
    body: (
      <>
        <P>You agree to:</P>
        <Ul
          items={[
            "give true and complete details in forms and on calls, and not use someone else's name, number or identity",
            "use the site only for your own, personal, non-commercial purposes",
            "not copy, scrape or collect content or data from the site by automated means, or try to disturb or break into it",
            "not post or send anything unlawful, abusive, false or harmful",
            "not use the site to send unwanted messages or advertise to other users",
          ]}
        />
      </>
    ),
  },
  {
    title: "Fees and payments",
    body: (
      <>
        <P>Our counselling is free for students and parents. We will tell you clearly in advance if we ever offer a paid service.</P>
        <P>For your safety:</P>
        <Ul
          items={[
            "pay admission, seat and tuition fees only to the college's official bank account or payment page, and keep the receipt",
            "never pay money to a person's personal account or UPI ID, including to someone who says they work with us",
            "never share an OTP, password or card PIN with anyone, including our team",
          ]}
        />
        <P>If anyone asks you to do otherwise in our name, please tell us straight away on {SITE.phoneDisplay}.</P>
      </>
    ),
  },
  {
    title: "Calls and messages",
    body: (
      <P>
        When you send an enquiry, you allow us to contact you by call, WhatsApp, SMS and email about it, as set out in the privacy policy.
        You can ask us to stop at any time.
      </P>
    ),
  },
  {
    title: "Our content and ownership",
    body: (
      <>
        <P>
          The design, text, logos, graphics, layout and software of the site belong to {SITE.name} or are used with permission. The names,
          logos and marks of colleges, universities and exam bodies belong to them.
        </P>
        <P>
          You may read the site, share a page link and print a page for your own use. You may not copy, sell, change or republish our
          content without our written permission.
        </P>
      </>
    ),
  },
  {
    title: "Links and third-party content",
    body: (
      <P>
        The site links to colleges, exam bodies and other sites. They are not ours, and we do not control or endorse what they say or do.
        Using them is at your own risk. If you want to link to our site, please link to the page address and do not suggest that we
        endorse you.
      </P>
    ),
  },
  {
    title: "Limits on our responsibility",
    body: (
      <>
        <P>
          We provide the site and the counselling &quot;as they are&quot;. To the extent the law allows, we are not responsible for decisions you
          make using the information we give, for mistakes or changes in details published by colleges, for a college refusing or cancelling
          an admission, or for loss caused by the site being unavailable, slow or affected by something we do not control.
        </P>
        <P>
          Nothing in these terms limits any right you have under law that cannot be limited, and nothing limits our responsibility for
          fraud or for harm we cause on purpose.
        </P>
      </>
    ),
  },
  {
    title: "If you break these terms",
    body: (
      <P>
        If you misuse the site, give false details or harm others, we may stop your access or stop contacting you. You agree to compensate
        us for loss we suffer because of your breach of these terms or your unlawful use of the site.
      </P>
    ),
  },
  {
    title: "Law and disputes",
    body: (
      <>
        <P>
          These terms are governed by the laws of India. If a disagreement cannot be settled by talking, the courts at Greater Noida, Gautam
          Buddh Nagar, Uttar Pradesh will have the right to hear it.
        </P>
        <P>
          Before going to court, please write to us at {mail}. We would like to fix the problem first.
        </P>
      </>
    ),
  },
  {
    title: "Changes to these terms",
    body: (
      <P>
        We may change these terms from time to time. The date at the top shows the latest version. If you keep using the site after a
        change, you accept the new terms.
      </P>
    ),
  },
  {
    title: "Contact us",
    body: (
      <>
        <Ul
          items={[
            <span key="e">Email: {mail}</span>,
            <span key="p">Phone: {SITE.phoneDisplay} ({SITE.hours})</span>,
            <span key="a">Address: {SITE.address}</span>,
          ]}
        />
      </>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="4 November 2026"
      intro="These are the ground rules for using our website and counselling. We have kept them short and in plain language, so you know what to expect from us and what we expect from you."
      sections={SECTIONS}
      other={{ href: "/privacy-policy", label: "privacy policy" }}
    />
  );
}
