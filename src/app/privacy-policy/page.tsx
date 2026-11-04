import type { Metadata } from "next";
import { LegalPage, P, Ul, type LegalSection } from "@/components/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Admissions House collects when you ask for counselling, how we use it, who we share it with, and the choices you have.",
};

const mail = (
  <a href={`mailto:${SITE.email}`} className="font-semibold text-brand underline underline-offset-4">
    {SITE.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    title: "Who we are and what this policy covers",
    body: (
      <>
        <P>
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) runs {SITE.url.replace("https://", "")}, a free guide to colleges, courses and entrance exams in
          India, along with a counselling service that helps students choose a college and complete the admission.
        </P>
        <P>
          This policy explains what personal data we collect when you use the website, fill in an enquiry form or speak to our
          counsellors, why we collect it, who sees it and what you can do about it. We handle personal data in line with the
          Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, as they apply to us.
        </P>
        <P>It does not cover websites run by colleges, universities or other third parties that we link to. Those have their own policies.</P>
      </>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        <P>
          <strong>What you tell us.</strong> When you fill in a form, call us or message us on WhatsApp, you may give us:
        </P>
        <Ul
          items={[
            "your name, mobile number and, if you choose, your email address",
            "whether you are looking at an undergraduate or a postgraduate course, and whether you want to study online or on campus",
            "the field of study, course, college and city you are interested in",
            "marks, entrance exam scores, budget and other details you share during counselling",
            "a parent or guardian's name and number, if you give them",
            "anything else you write in a message or say on a call",
          ]}
        />
        <P>
          <strong>What we pick up automatically.</strong> When you visit the site we may record the page you filled the form on, the
          campaign or link you arrived from (for example the source or campaign name in the web address), your approximate location
          from your IP address, and basic details about your browser and device. We use this to understand which pages help students
          and to keep the site secure.
        </P>
        <P>
          <strong>What stays on your device.</strong> If you use the compare tool, the colleges you pick are saved in your own browser so
          they are still there when you come back. We do not receive that list.
        </P>
        <P>We do not ask for passwords, card numbers, bank details or Aadhaar numbers, and you should not send them to us.</P>
      </>
    ),
  },
  {
    title: "Why we ask for your consent",
    body: (
      <>
        <P>
          Before you send an enquiry we show a short note next to the button explaining that a counsellor will call or WhatsApp you
          about admissions. By sending the form you agree to that. We keep a record of when and where you gave it.
        </P>
        <P>
          You can take your consent back at any time by writing to {mail} or telling a counsellor on a call. We will stop contacting you
          for that purpose. Browsing the site does not need your consent and does not make us share anything about you.
        </P>
      </>
    ),
  },
  {
    title: "How we use your data",
    body: (
      <>
        <Ul
          items={[
            "to call, message or email you about the enquiry you made, and to suggest colleges and courses that fit your marks, budget and city",
            "to help you with forms, documents, scholarships and counselling rounds, if you ask us to",
            "to share your details with colleges you have shown interest in, as described in the next section",
            "to send you reminders about exam dates, deadlines and offers that matter to you, where you have agreed to hear from us",
            "to improve the site and our counselling, for example by finding pages that confuse people",
            "to keep the site safe, stop spam and fraud, and meet legal duties",
          ]}
        />
        <P>We do not use your data to make decisions about you by computer alone, and we do not sell it.</P>
      </>
    ),
  },
  {
    title: "Who we share it with",
    body: (
      <>
        <P>
          <strong>Colleges and universities.</strong> We share your name, contact details and course interest with a college only when
          you have asked us to help you apply there, or have agreed to it. We tell you which colleges before we do it. A college that
          receives your details will use them under its own privacy policy.
        </P>
        <P>
          <strong>Service providers.</strong> We use trusted companies that help us run the service, such as website hosting, the system
          where we keep enquiries, and calling and messaging tools. They may handle your data only to do that work for us and must keep
          it safe.
        </P>
        <P>
          <strong>Authorities.</strong> We may share data if the law, a court or a government body requires it, or to protect the safety
          of a person.
        </P>
        <P>
          <strong>If our business changes.</strong> If we merge with or are bought by another company, your data may move with the
          service. We will tell you, and the same protections will continue to apply.
        </P>
      </>
    ),
  },
  {
    title: "Calls, WhatsApp and messages",
    body: (
      <>
        <P>
          When you send an enquiry, you agree that we may contact you by phone call, WhatsApp, SMS and email about it, even if your number
          is on a Do Not Disturb or similar list, because you asked us to. Our counsellors work from 10 am to 8 pm.
        </P>
        <P>
          If you do not want more calls, say so on the call, reply STOP on a message, or write to {mail}. We will mark your number and stop
          within a few days.
        </P>
      </>
    ),
  },
  {
    title: "Children and students under 18",
    body: (
      <>
        <P>
          Many of our students are under 18. If you are under 18, please use the site and the enquiry form together with a parent or
          guardian, and give their details if our counsellor asks. If we learn that a child&apos;s data was sent without a parent or
          guardian&apos;s knowledge, we will delete it when asked.
        </P>
        <P>We do not target advertising at children and we do not track their behaviour across other sites.</P>
      </>
    ),
  },
  {
    title: "Cookies and browser storage",
    body: (
      <>
        <P>
          The site uses small files and browser storage to work properly, for example to remember the colleges in your compare list and to
          keep forms from being flooded by bots. We do not use advertising cookies at the moment.
        </P>
        <P>
          If we add tools that measure how the site is used, they will be listed here and, where the law asks for it, we will ask you first.
          You can clear or block cookies and site data in your browser settings. Some parts of the site may not work if you do.
        </P>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <>
        <Ul
          items={[
            "Enquiry and counselling records: while we are helping you, and for up to 12 months after our last contact, so you can come back without starting again.",
            "Records of consent and of requests to stop contact: for as long as the law needs, so that we keep respecting your choice.",
            "Basic technical logs: for a short period, usually a few weeks, for security.",
          ]}
        />
        <P>After that we delete the data or remove anything that could identify you.</P>
      </>
    ),
  },
  {
    title: "How we keep it safe",
    body: (
      <P>
        We use secure connections, limit who in our team can see enquiries, and choose providers that protect data. No system is perfectly
        safe, so we cannot promise that nothing will ever go wrong. If a breach affects your data in a way that could harm you, we will
        tell you and the authorities as the law requires.
      </P>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        <P>You can ask us to:</P>
        <Ul
          items={[
            "tell you what personal data of yours we hold and what we have done with it",
            "correct details that are wrong or out of date",
            "delete your data, unless we must keep it for a legal reason",
            "stop contacting you, or take back a consent you gave",
            "name someone to use these rights for you if you cannot",
          ]}
        />
        <P>
          Write to {mail} from the email address or tell us the mobile number you used, so that we can be sure it is you. We aim to answer
          within 30 days. If you are not happy with our answer, you can use the grievance contact below, and after that you may approach the
          Data Protection Board of India.
        </P>
        <P>In return, please give us true details and do not use another person&apos;s name or number.</P>
      </>
    ),
  },
  {
    title: "Data stored outside India",
    body: (
      <P>
        Some of our service providers may keep or process data on servers outside India. When that happens we choose providers that
        protect it properly, and we follow any limits the Indian government sets on where data may go.
      </P>
    ),
  },
  {
    title: "Links to other sites",
    body: (
      <P>
        Our pages link to college websites, exam bodies and other sites. We do not control them and are not responsible for how they handle
        your data. Please read their policies before you share anything.
      </P>
    ),
  },
  {
    title: "Grievance and contact",
    body: (
      <>
        <P>For any question, request or complaint about your data, contact our Grievance Officer:</P>
        <Ul
          items={[
            <span key="o">Grievance Officer, {SITE.name}</span>,
            <span key="e">Email: {mail}</span>,
            <span key="p">Phone: {SITE.phoneDisplay} ({SITE.hours})</span>,
            <span key="a">Address: {SITE.address}</span>,
          ]}
        />
        <P>We will acknowledge your message within 2 working days and try to resolve it within 30 days.</P>
      </>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy as our service or the law changes. The date at the top shows the latest version. If a change affects how
        we use data you have already given us in a big way, we will ask you again before we apply it.
      </P>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="4 November 2026"
      intro="You trust us with your phone number, your marks and your plans. This page explains in plain words what we do with them, and what you can do if you would like us to do something different."
      sections={SECTIONS}
      other={{ href: "/terms-of-use", label: "terms of use" }}
    />
  );
}
