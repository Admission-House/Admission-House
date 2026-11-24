import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P, Ul, type LegalSection } from "@/components/legal";
import { DAILY_CAP, GAME_MAX, REFERRAL_POINTS, TIERS, VOUCHER_DAYS } from "@/lib/rewards-config";

export const metadata: Metadata = {
  title: "How rewards work",
  description: "How to earn points in the Admissions House games, who can play, what a voucher is worth and what it does not cover.",
};

const link = "font-semibold text-brand underline underline-offset-4";

const SECTIONS: LegalSection[] = [
  {
    title: "How it works",
    body: (
      <>
        <P>Play short games about admissions and exams, earn points, and swap the points for a voucher on the application form fee.</P>
        <Ul
          items={[
            <>Sign in on the <Link href="/rewards" className={link}>Rewards page</Link> and tell us your class and the course you want.</>,
            "Play the games. Each one pays points the first time you finish it that day.",
            "When your points reach a level, redeem them for a voucher code.",
            "Show the code to your counsellor. They apply it to the application form fee of the college you apply to.",
          ]}
        />
      </>
    ),
  },
  {
    title: "The games and the points",
    body: (
      <>
        <P>Questions follow the class and course you pick, so a Class 12 medical student gets different questions from a graduate in management.</P>
        <Ul
          items={[
            <>Daily quiz: 5 questions, up to {GAME_MAX.quiz} points. Pays once a day.</>,
            <>Exam match: pair each exam with what it is used for, up to {GAME_MAX.match} points. Pays once a day.</>,
            <>Myth or fact: 6 admission rumours, up to {GAME_MAX.myth} points. Pays once a day.</>,
            <>Which course fits you: {GAME_MAX.career} points, and it counts once only.</>,
          ]}
        />
        <P>Playing a game again on the same day is practice and earns no points. The points you win depend on how many answers you get right.</P>
      </>
    ),
  },
  {
    title: "Daily limit, streaks and invites",
    body: (
      <>
        <Ul
          items={[
            <>You can earn up to {DAILY_CAP} points a day from games. The limit resets every day at midnight India time.</>,
            "Play on consecutive days to build a streak. Your first game of a new day adds a streak bonus of 5 points for each day in the streak, up to 25 points.",
            <>Invite a friend and you both get {REFERRAL_POINTS} points. The friend must be new to Rewards and sign in with Google using your invite link. Friends who already have an account do not earn points for you.</>,
          ]}
        />
      </>
    ),
  },
  {
    title: "Who can play",
    body: (
      <>
        <P>Rewards are for students who are looking at admission to a college in India:</P>
        <Ul items={["Students in Class 10, who get questions on choosing a stream", "Students in Class 12, for engineering, medical, management, law, design and commerce", "Graduates looking at postgraduate courses"]} />
        <P>
          Sign in with Google to keep your points safe and see them on any phone or laptop. If you are under 18, please play together with a parent or guardian.
        </P>
      </>
    ),
  },
  {
    title: "Vouchers",
    body: (
      <>
        <P>Points turn into a percentage off the application form fee of a college. A higher level gives a bigger discount:</P>
        <Ul items={TIERS.map((t) => `${t.pts.toLocaleString("en-IN")} points: ${t.pct}% off the application form fee`)} />
        <Ul
          items={[
            `A voucher is valid for ${VOUCHER_DAYS} days from the day you redeem it.`,
            "Vouchers do not stack. Use one voucher per application form.",
            "Your counsellor applies the code when your application form is filled. It lowers the form fee only. It does not change the college's tuition or any other fee.",
            "The points are spent when you redeem. Points have no cash value and cannot be transferred to another student.",
          ]}
        />
      </>
    ),
  },
  {
    title: "What is not covered",
    body: (
      <>
        <Ul
          items={[
            "Rewards and vouchers are not available for online courses.",
            "A voucher does not guarantee a seat. Admission, cut-offs and fees are decided by the college.",
            "We may cancel points and vouchers that come from more than one account for the same student or from any other misuse.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Counselling is free",
    body: (
      <>
        <P>
          Talking to an Admissions House counsellor costs nothing, whether or not you play the games. The games are a bonus on top: they can lower the application form fee of a college,
          never what you pay us for counselling. You can <Link href="/counselling" className={link}>book a free counselling call</Link> at any time.
        </P>
      </>
    ),
  },
];

export default function RewardsRulesPage() {
  return (
    <LegalPage
      title="How rewards work"
      updated="24 November 2026"
      sections={SECTIONS}
      other={{ href: "/terms-of-use", label: "terms of use" }}
    />
  );
}
