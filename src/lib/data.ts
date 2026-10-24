// College data for the demo. Figures were collected on 2026-10-24 from the public
// pages of kollegeapply.com (fees, ranks, packages) and are marked `verified: false`
// until checked against each institute's official site. Fields a source did not
// publish are left out instead of guessed; the UI hides anything that is missing.

export type Level = "UG" | "PG";

export type Stream =
  | "Engineering"
  | "Management"
  | "Medical"
  | "Design"
  | "Law"
  | "Commerce"
  | "Science"
  | "Computer Applications"
  | "Pharmacy"
  | "Arts";

// Streams that have at least one college listed. Shown in filters and on the home page.
export const STREAMS: Stream[] = ["Engineering", "Management", "Medical", "Law", "Commerce", "Arts", "Science", "Design"];

export const CITIES = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
  "Pune",
  "Jamshedpur",
] as const;

export type City = (typeof CITIES)[number];

export type CollegeType = "Private" | "Government" | "Deemed";

export interface Program {
  name: string;
  level: Level;
  duration: string;
  /** Approximate tuition in lakh rupees per year. Used only for filtering and sorting. */
  fee: number;
  /** Fee exactly as the source states it, e.g. "₹27.5 L total". */
  feeText: string;
}

export interface College {
  slug: string;
  name: string;
  short: string;
  city: City;
  state: string;
  type: CollegeType;
  established: number;
  /** Rank within its category; lower is better. */
  nirf?: number;
  /** What the rank is for, e.g. "NIRF 2025, Management". */
  rankNote?: string;
  accreditation: string;
  approvals: string[];
  streams: Stream[];
  programs: Program[];
  /** LPA */
  avgPackage?: number;
  medianPackage?: number;
  highestPackage?: number;
  /** Year the placement figures belong to. */
  placementYear?: string;
  /** Free-text placement facts that do not fit a number, e.g. offers and recruiter counts. */
  placementNote?: string;
  recruiters: string[];
  exams: string[];
  hostel?: boolean;
  scholarship?: boolean;
  campusAcres?: number;
  image: string;
  /** CSS object-position for the cover photo, to keep the best part of the picture in frame. */
  imagePosition?: string;
  /** Accent colour for monograms. */
  hue: string;
  tagline: string;
  about: string;
  highlights: string[];
  source: string;
  verified: boolean;
}

const SRC = "kollegeapply.com, 2026-10-24";

export const COLLEGES: College[] = [
  {
    slug: "iim-ahmedabad",
    name: "Indian Institute of Management Ahmedabad",
    short: "IIM Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "Government",
    established: 1961,
    nirf: 1,
    rankNote: "NIRF 2025, Management",
    accreditation: "EQUIS accredited",
    approvals: [],
    streams: ["Management"],
    programs: [
      { name: "MBA (PGP)", level: "PG", duration: "2 years", fee: 13.8, feeText: "₹27.5 L total" },
      { name: "MBA (PGPX)", level: "PG", duration: "1 year", fee: 35, feeText: "₹35 L total" },
    ],
    avgPackage: 35.22,
    medianPackage: 34.53,
    highestPackage: 110,
    placementYear: "2025, PGP batch",
    recruiters: ["Boston Consulting Group", "Accenture Strategy", "American Express", "Bain & Company", "McKinsey & Company"],
    exams: ["CAT", "GMAT", "GRE"],
    hostel: true,
    scholarship: true,
    campusAcres: 102,
    image: "/images/colleges/iim-ahmedabad.jpg",
    hue: "#1B2A4A",
    tagline: "India's top-ranked management institute",
    about:
      "IIM Ahmedabad is a government-run management institute in Vastrapur, Ahmedabad, founded in 1961 under the Government of India. It is an Institute of National Importance and ranks first in the NIRF Management category.",
    highlights: [
      "Ranked #1 in NIRF 2025 (Management)",
      "MBA admission through CAT, then a written ability test and personal interview",
      "2025 PGP median package of ₹34.53 LPA",
      "Need-based and merit scholarships from ₹30,000 to ₹4,00,000",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "iim-bangalore",
    name: "Indian Institute of Management Bangalore",
    short: "IIM Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Government",
    established: 1973,
    nirf: 2,
    rankNote: "NIRF 2025, Management",
    accreditation: "NAAC A",
    approvals: [],
    streams: ["Management"],
    programs: [
      { name: "MBA (PGP)", level: "PG", duration: "2 years", fee: 13, feeText: "₹26 L total" },
      { name: "MBA (Business Analytics)", level: "PG", duration: "2 years", fee: 13, feeText: "₹26 L total" },
      { name: "Executive MBA (EPGP)", level: "PG", duration: "1 year", fee: 33.7, feeText: "₹33.71 L total" },
      { name: "BBA (Digital Business and Entrepreneurship)", level: "UG", duration: "3 years", fee: 1.5, feeText: "₹4.5 L total" },
    ],
    avgPackage: 34.88,
    medianPackage: 32.61,
    placementYear: "2025, MBA batch",
    placementNote: "601 offers from 140 companies",
    recruiters: ["Accenture Strategy", "Bain & Company", "BCG", "EY Parthenon", "PwC", "Amazon"],
    exams: ["CAT", "GMAT", "GRE"],
    hostel: true,
    campusAcres: 100,
    image: "/images/colleges/iim-bangalore.jpg",
    hue: "#1B2A4A",
    tagline: "Second in India for management, on a 100-acre green campus",
    about:
      "IIM Bangalore is a public management institute in Bangalore, founded in 1973. It offers undergraduate, postgraduate, executive and doctoral programmes, with entry mainly through CAT, a written ability test and an interview.",
    highlights: [
      "Ranked #2 in NIRF 2025 (Management)",
      "QS Global MBA ranking in the top 55 worldwide",
      "2025 MBA median package of ₹32.61 LPA",
      "Six degree types across 16 courses",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "isb-hyderabad",
    name: "Indian School of Business, Hyderabad",
    short: "ISB Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    type: "Private",
    established: 2001,
    rankNote: "FT Global MBA 2025: #27",
    accreditation: "AMBA, EQUIS and AACSB accredited",
    approvals: [],
    streams: ["Management"],
    programs: [
      { name: "PGP (1-year MBA)", level: "PG", duration: "12 months", fee: 33, feeText: "₹32.96 L total" },
      { name: "PGP Pro", level: "PG", duration: "18 months", fee: 21, feeText: "₹31.51 L total" },
      { name: "PGP MAX", level: "PG", duration: "15 months", fee: 33.4, feeText: "₹41.78 L total" },
      { name: "AMPBA (Business Analytics)", level: "PG", duration: "15 months", fee: 8.8, feeText: "₹11 L total" },
    ],
    placementYear: "2025",
    placementNote: "364 companies made 1,164 offers",
    recruiters: ["Accenture", "Amazon", "Bain & Company", "Barclays India", "Deloitte"],
    exams: ["GMAT", "GRE"],
    campusAcres: 260,
    image: "/images/colleges/isb-hyderabad.jpg",
    hue: "#1B2A4A",
    tagline: "India's top global-ranked business school",
    about:
      "ISB Hyderabad is a private business school founded in 2001 in Gachibowli. It holds the AMBA, EQUIS and AACSB accreditations and offers one-year and executive postgraduate management programmes.",
    highlights: [
      "27th in the Financial Times Global MBA Ranking 2025, first in India for its PGP",
      "Triple-crown accreditation: AMBA, EQUIS and AACSB",
      "364 companies and 1,164 offers in 2025 placements",
      "GMAT or GRE for the PGP; CAT and NMAT accepted for select programmes",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    short: "IIT Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Government",
    established: 1958,
    nirf: 3,
    rankNote: "NIRF 2025, Engineering",
    accreditation: "Institute of National Importance",
    approvals: [],
    streams: ["Engineering", "Science", "Design"],
    programs: [
      { name: "B.Tech", level: "UG", duration: "4 years", fee: 2.2, feeText: "₹1.08 L per semester" },
      { name: "M.Tech", level: "PG", duration: "2 years", fee: 0.5, feeText: "₹25,350 per semester" },
    ],
    avgPackage: 23.5,
    medianPackage: 17.92,
    placementYear: "2023-24",
    placementNote: "364 companies made offers",
    recruiters: ["Apple", "Google", "Microsoft", "Amazon", "Intel", "Nvidia"],
    exams: ["JEE Advanced", "GATE", "CAT", "UCEED", "CEED", "IIT JAM"],
    campusAcres: 550,
    image: "/images/colleges/iit-bombay.jpg",
    hue: "#1B2A4A",
    tagline: "Top three in India for engineering",
    about:
      "IIT Bombay is a government engineering institute in Powai, Mumbai, founded in 1958. It offers undergraduate, postgraduate and doctoral programmes across engineering, science, design, management and humanities.",
    highlights: [
      "Ranked #3 in NIRF 2025 for Engineering and overall",
      "Ranked #134 globally in QS World University Rankings 2027",
      "Average package of ₹23.5 LPA in 2023-24",
      "550-acre campus with 60,000+ alumni",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    short: "IIT Delhi",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Government",
    established: 1961,
    nirf: 2,
    rankNote: "NIRF 2025, Engineering",
    accreditation: "Institute of National Importance",
    approvals: [],
    streams: ["Engineering", "Science", "Management", "Design"],
    programs: [
      { name: "B.Tech", level: "UG", duration: "4 years", fee: 2, feeText: "₹1 L per semester" },
      { name: "M.Tech", level: "PG", duration: "2 years", fee: 0.4, feeText: "₹17,500 to ₹75,000 per semester" },
    ],
    avgPackage: 23.4,
    medianPackage: 22.05,
    highestPackage: 40.5,
    recruiters: ["Accenture", "Adani", "Air India", "Amazon", "Bajaj", "Flipkart"],
    exams: ["JEE Advanced", "JEE Main", "GATE", "CAT", "CEED", "UCEED"],
    hostel: true,
    scholarship: true,
    campusAcres: 325,
    image: "/images/colleges/iit-delhi.jpg",
    hue: "#1B2A4A",
    tagline: "Second in NIRF Engineering 2025",
    about:
      "IIT Delhi is one of India's oldest institutes of national importance, established in 1961 at Hauz Khas, New Delhi. It offers undergraduate, postgraduate and doctoral programmes in engineering, science, management and design.",
    highlights: [
      "Ranked #2 in Engineering and #4 overall in NIRF 2025",
      "Ranked #118 globally in QS World University Rankings 2027",
      "Highest domestic package of ₹40.5 LPA",
      "Merit-cum-Means scholarships and fee waivers",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "iit-madras",
    name: "Indian Institute of Technology Madras",
    short: "IIT Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Government",
    established: 1959,
    nirf: 1,
    rankNote: "NIRF 2025, Overall",
    accreditation: "Institute of Eminence",
    approvals: [],
    streams: ["Engineering", "Science", "Management"],
    programs: [
      { name: "B.Tech", level: "UG", duration: "4 years", fee: 2, feeText: "₹1 L per semester" },
      { name: "M.Tech", level: "PG", duration: "2 years", fee: 0.5, feeText: "₹25,000 per semester" },
      { name: "M.Sc", level: "PG", duration: "2 years", fee: 0.5, feeText: "₹25,000 per semester" },
    ],
    medianPackage: 17.78,
    placementYear: "2025, 4-year UG",
    placementNote: "97.76% placed (1,833 of 1,875 eligible students)",
    recruiters: ["Apple", "Amazon", "BCG", "Deloitte", "Accenture", "PwC"],
    exams: ["JEE Advanced", "GATE", "IIT JAM", "CAT"],
    hostel: true,
    scholarship: true,
    campusAcres: 630,
    image: "/images/colleges/iit-madras.jpg",
    hue: "#1B2A4A",
    tagline: "Number one in India, NIRF 2025",
    about:
      "IIT Madras was established in 1959 in Chennai and holds the Institute of Eminence title. It offers undergraduate, postgraduate and doctoral programmes, with the B.Tech as its flagship.",
    highlights: [
      "Ranked #1 in NIRF 2025, overall and in Engineering",
      "Ranked #170 globally in QS World University Rankings 2027",
      "97.76% placement rate in 2025",
      "630-acre campus with 20+ hostels",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "aiims-delhi",
    name: "All India Institute of Medical Sciences, Delhi",
    short: "AIIMS Delhi",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Government",
    established: 1956,
    nirf: 1,
    rankNote: "NIRF 2025, Medical",
    accreditation: "Institute of National Importance",
    approvals: [],
    streams: ["Medical", "Science"],
    programs: [
      { name: "MBBS", level: "UG", duration: "5.5 years", fee: 0.02, feeText: "Under ₹2,000 a year" },
      { name: "MD / MS", level: "PG", duration: "3 years", fee: 0.01, feeText: "About ₹700 a year" },
    ],
    recruiters: [],
    exams: ["NEET UG", "NEET PG", "INI-CET"],
    hostel: true,
    image: "/images/colleges/aiims-delhi.jpg",
    hue: "#1B2A4A",
    tagline: "India's number one medical institute",
    about:
      "AIIMS Delhi is a government medical institute founded in 1956 and designated an Institute of National Importance. It offers undergraduate, postgraduate, super-speciality and doctoral programmes across 40+ departments.",
    highlights: [
      "Ranked #1 in NIRF 2025 (Medical) and #8 overall",
      "Admission only through NEET UG, INI-CET and the AIIMS paramedical exam",
      "Attached hospital with 3,000+ beds",
      "Hostel fees of about ₹500 to ₹1,000 a month",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "nlsiu-bangalore",
    name: "National Law School of India University",
    short: "NLSIU Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Government",
    established: 1986,
    nirf: 1,
    rankNote: "NIRF 2025, Law",
    accreditation: "NAAC A",
    approvals: ["BCI"],
    streams: ["Law", "Arts"],
    programs: [
      { name: "BA LL.B. (Hons.)", level: "UG", duration: "5 years", fee: 5, feeText: "₹5 L a year, hostel included" },
      { name: "LL.B. (Hons.)", level: "UG", duration: "3 years", fee: 5.06, feeText: "About ₹5.06 L a year" },
      { name: "LL.M.", level: "PG", duration: "1 year", fee: 5.56, feeText: "About ₹5.56 L" },
    ],
    medianPackage: 16,
    placementYear: "2025, UG",
    recruiters: ["Cyril Amarchand Mangaldas", "AZB & Partners", "Khaitan & Co.", "Trilegal", "Shardul Amarchand Mangaldas", "Deloitte"],
    exams: ["CLAT"],
    hostel: true,
    scholarship: true,
    campusAcres: 23,
    image: "/images/colleges/nlsiu.jpg",
    hue: "#1B2A4A",
    tagline: "First in NIRF Law for five years running",
    about:
      "NLSIU is a public law school in Nagarabhavi, Bengaluru, established in 1986 and widely regarded as India's most prominent national law university. It admits students to its flagship law programmes mainly through CLAT.",
    highlights: [
      "Ranked #1 for Law in NIRF every year from 2021 to 2025",
      "UG median placement package of ₹16 LPA",
      "Fully residential 23-acre campus",
      "Income-based fee waivers and SC/ST concessions",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "nalsar-hyderabad",
    name: "NALSAR University of Law",
    short: "NALSAR",
    city: "Hyderabad",
    state: "Telangana",
    type: "Government",
    established: 1998,
    nirf: 3,
    rankNote: "NIRF 2025, Law",
    accreditation: "NAAC A++",
    approvals: ["BCI", "UGC"],
    streams: ["Law", "Management"],
    programs: [
      { name: "BA LL.B. (Hons.)", level: "UG", duration: "5 years", fee: 3.17, feeText: "₹3.17 L first year" },
      { name: "Integrated BBA-MBA (IPM)", level: "UG", duration: "5 years", fee: 4.52, feeText: "₹4.52 L a year" },
      { name: "LL.M.", level: "PG", duration: "1 year", fee: 2.15, feeText: "₹2.15 L" },
      { name: "MBA", level: "PG", duration: "2 years", fee: 4.47, feeText: "₹4.47 L a year" },
    ],
    medianPackage: 17.5,
    highestPackage: 59,
    placementYear: "NIRF 2025 report, BA LL.B.",
    recruiters: ["Cyril Amarchand Mangaldas", "Trilegal", "AZB & Partners", "Khaitan & Co.", "Shardul Amarchand Mangaldas", "Nishith Desai Associates"],
    exams: ["CLAT", "CAT", "IPMAT", "JIPMAT"],
    hostel: true,
    scholarship: true,
    campusAcres: 55,
    image: "/images/colleges/nalsar.jpg",
    hue: "#1B2A4A",
    tagline: "Third in NIRF Law 2025",
    about:
      "NALSAR University of Law, also known as NLU Hyderabad, was founded in 1998 and is based in Shamirpet, Hyderabad. It offers undergraduate, postgraduate, management, diploma and doctoral programmes in law and related fields.",
    highlights: [
      "Ranked #3 in NIRF Law in both 2024 and 2025",
      "NAAC A++ accredited, BCI approved",
      "BA LL.B. median package of ₹17.5 LPA",
      "Fully residential 55-acre campus",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "srcc-delhi",
    name: "Shri Ram College of Commerce",
    short: "SRCC Delhi",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Government",
    established: 1926,
    nirf: 18,
    rankNote: "NIRF 2025, Colleges",
    accreditation: "NAAC A++",
    approvals: ["UGC"],
    streams: ["Commerce", "Arts"],
    programs: [
      { name: "B.Com (Hons)", level: "UG", duration: "3 years", fee: 0.32, feeText: "₹97,260 total" },
      { name: "B.A. (Economics)", level: "UG", duration: "3 years", fee: 0.32, feeText: "₹97,260 total" },
      { name: "M.Com", level: "PG", duration: "2 years", fee: 0.5, feeText: "₹1 L total" },
      { name: "M.A. (Economics)", level: "PG", duration: "2 years", fee: 0.5, feeText: "₹1 L total" },
      { name: "PG Diploma in Global Business Operations", level: "PG", duration: "2 years", fee: 1.6, feeText: "₹3.2 L total" },
    ],
    avgPackage: 9.9,
    medianPackage: 7.7,
    highestPackage: 36,
    placementYear: "2025",
    placementNote: "520+ offers from 115+ recruiters",
    recruiters: ["McKinsey & Company", "Bain & Company", "BCG", "Google", "EY", "KPMG"],
    exams: ["CUET UG", "CUET PG"],
    hostel: true,
    scholarship: true,
    campusAcres: 15,
    image: "/images/colleges/srcc.jpg",
    hue: "#1B2A4A",
    tagline: "Delhi University's flagship commerce college",
    about:
      "SRCC is a University of Delhi college founded in 1926 as a small commercial school. It offers programmes in commerce, economics and management, and admits through CUET.",
    highlights: [
      "NAAC A++ accredited, UGC approved",
      "B.Com (Hons) and B.A. (Economics) admission through CUET UG",
      "2025 placements: highest ₹36 LPA, average ₹9.9 LPA",
      "120+ internship offers in 2025",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "hindu-college-delhi",
    name: "Hindu College, University of Delhi",
    short: "Hindu College",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Government",
    established: 1899,
    nirf: 2,
    rankNote: "NIRF 2024, Colleges",
    accreditation: "NAAC A+",
    approvals: ["UGC"],
    streams: ["Arts", "Science", "Commerce"],
    programs: [
      { name: "B.A. (Hons)", level: "UG", duration: "3 years", fee: 0.29, feeText: "₹86,010 total" },
      { name: "B.Sc. (Hons)", level: "UG", duration: "3 years", fee: 0.3, feeText: "₹87,360 to ₹93,810 total" },
      { name: "B.Com (Hons)", level: "UG", duration: "3 years", fee: 0.29, feeText: "₹86,010 total" },
      { name: "M.A.", level: "PG", duration: "2 years", fee: 0.28, feeText: "₹55,950 total" },
      { name: "M.Sc.", level: "PG", duration: "2 years", fee: 0.28, feeText: "₹56,160 total" },
    ],
    avgPackage: 10.4,
    medianPackage: 8.4,
    highestPackage: 36.5,
    placementYear: "2023",
    placementNote: "200+ offers from 150+ recruiters",
    recruiters: ["Google", "Deloitte", "HDFC", "KPMG", "Bain & Company", "Accenture"],
    exams: ["CUET UG", "CUET PG"],
    hostel: true,
    scholarship: true,
    campusAcres: 24,
    image: "/images/colleges/hindu-college.jpg",
    hue: "#1B2A4A",
    tagline: "A top-ranked Delhi University college since 1899",
    about:
      "Hindu College is a University of Delhi college in North Campus, founded in 1899. It offers undergraduate and postgraduate programmes in arts, science and commerce.",
    highlights: [
      "Second in NIRF Colleges in 2023 and 2024",
      "NAAC A+ accredited, UGC approved",
      "Admission through CUET UG and CUET PG",
      "2023 placements: average ₹10.4 LPA, highest ₹36.5 LPA",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "xlri-jamshedpur",
    name: "XLRI Jamshedpur",
    short: "XLRI",
    city: "Jamshedpur",
    state: "Jharkhand",
    type: "Private",
    established: 1949,
    nirf: 10,
    rankNote: "NIRF 2025, Management",
    accreditation: "AACSB and NBA accredited",
    approvals: ["AICTE"],
    streams: ["Management"],
    programs: [
      { name: "PGDM (Human Resource Management)", level: "PG", duration: "2 years", fee: 15.3, feeText: "₹30.6 L total" },
      { name: "PGDM (Business Management)", level: "PG", duration: "2 years", fee: 15.3, feeText: "₹30.6 L total" },
      { name: "PGDM (General Management)", level: "PG", duration: "18 months", fee: 17.2, feeText: "₹25.8 L total" },
    ],
    avgPackage: 31.4,
    medianPackage: 29,
    highestPackage: 59,
    placementYear: "2026",
    placementNote: "576 students placed by 145 recruiters",
    recruiters: ["Accenture", "Aditya Birla Group", "Amazon", "American Express", "Bajaj Auto", "Boston Consulting Group"],
    exams: ["XAT", "GMAT", "GRE"],
    image: "/images/colleges/xlri-jamshedpur.jpg",
    hue: "#1B2A4A",
    tagline: "India's oldest business school, strong in HR",
    about:
      "XLRI Jamshedpur was founded in 1949 and is known for management education, particularly human resource management and industrial relations. It offers PGDM, FPM and executive programmes.",
    highlights: [
      "Ranked 10th in NIRF Management 2025",
      "AICTE approved, AACSB and NBA accredited",
      "2026 placements: 576 students, average ₹31.4 LPA",
      "Admission through XAT, GMAT or GRE",
    ],
    source: SRC,
    verified: false,
  },
  {
    slug: "sibm-pune",
    name: "Symbiosis Institute of Business Management, Pune",
    short: "SIBM Pune",
    city: "Pune",
    state: "Maharashtra",
    type: "Private",
    established: 1978,
    nirf: 11,
    rankNote: "NIRF 2025, Management",
    accreditation: "NAAC A++",
    approvals: [],
    streams: ["Management"],
    programs: [
      { name: "MBA", level: "PG", duration: "2 years", fee: 13.9, feeText: "₹27.77 L total" },
      { name: "MBA Executive", level: "PG", duration: "2 years", fee: 3.5, feeText: "₹7.03 L total" },
    ],
    avgPackage: 28.83,
    medianPackage: 26,
    highestPackage: 53.58,
    placementYear: "2024",
    recruiters: ["Accenture", "Airtel", "Asian Paints", "ITC", "Johnson & Johnson"],
    exams: ["SNAP", "CAT"],
    campusAcres: 45,
    image: "/images/colleges/sibm-pune.jpg",
    hue: "#1B2A4A",
    tagline: "A leading Symbiosis business school in Pune",
    about:
      "SIBM Pune is a private business school founded in 1978 and part of Symbiosis International (Deemed) University. It is known for its MBA programmes and sits on a 45-acre campus.",
    highlights: [
      "Ranked 11th in NIRF Management 2025",
      "NAAC A++ accredited",
      "2024 placements: average ₹28.83 LPA, highest ₹53.58 LPA",
      "Admission through SNAP",
    ],
    source: SRC,
    verified: false,
  },
];

/** The best placement number a college has published, with its label. */
export function packageStat(c: College): { label: string; value: string } | null {
  if (c.avgPackage) return { label: "Average package", value: `₹${c.avgPackage} LPA` };
  if (c.medianPackage) return { label: "Median package", value: `₹${c.medianPackage} LPA` };
  return null;
}

export function getCollege(slug: string) {
  return COLLEGES.find((c) => c.slug === slug);
}

export function feeRange(c: College): [number, number] {
  const fees = c.programs.map((p) => p.fee);
  return [Math.min(...fees), Math.max(...fees)];
}

export function formatLakh(n: number) {
  if (n < 1) return `₹${Math.round(n * 100)}K`;
  return `₹${Number.isInteger(n) ? n : n.toFixed(1)}L`;
}

/* ------------------------------------------------------------------ */

export interface Course {
  slug: string;
  name: string;
  full: string;
  level: Level;
  stream: Stream;
  duration: string;
  feeFrom: number;
  feeTo: number;
  exams: string[];
  careers: string[];
  eligibility: string;
  avgSalary: string;
}

export const COURSES: Course[] = [
  { slug: "btech", name: "B.Tech", full: "Bachelor of Technology", level: "UG", stream: "Engineering", duration: "4 years", feeFrom: 1.2, feeTo: 4.5, exams: ["JEE Main", "BITSAT", "MHT CET"], careers: ["Software engineer", "Data analyst", "Core engineer"], eligibility: "12th with PCM, 60%+", avgSalary: "₹6–12 LPA" },
  { slug: "mbbs", name: "MBBS", full: "Bachelor of Medicine & Surgery", level: "UG", stream: "Medical", duration: "5.5 years", feeFrom: 0.5, feeTo: 25, exams: ["NEET UG"], careers: ["Doctor", "Medical officer", "Researcher"], eligibility: "12th with PCB, 50%+", avgSalary: "₹8–15 LPA" },
  { slug: "bba", name: "BBA", full: "Bachelor of Business Administration", level: "UG", stream: "Management", duration: "3 years", feeFrom: 0.8, feeTo: 4, exams: ["CUET UG", "IPMAT", "NPAT"], careers: ["Business analyst", "Marketing executive", "Entrepreneur"], eligibility: "12th any stream, 50%+", avgSalary: "₹4–7 LPA" },
  { slug: "bca", name: "BCA", full: "Bachelor of Computer Applications", level: "UG", stream: "Computer Applications", duration: "3 years", feeFrom: 0.6, feeTo: 2, exams: ["CUET UG", "Merit-based"], careers: ["Web developer", "QA engineer", "System admin"], eligibility: "12th with Maths, 50%+", avgSalary: "₹3.5–6 LPA" },
  { slug: "bdes", name: "B.Des", full: "Bachelor of Design", level: "UG", stream: "Design", duration: "4 years", feeFrom: 1.5, feeTo: 4, exams: ["NID DAT", "UCEED", "NIFT"], careers: ["UX designer", "Product designer", "Fashion designer"], eligibility: "12th any stream", avgSalary: "₹5–10 LPA" },
  { slug: "ballb", name: "BA LLB", full: "Integrated Bachelor of Arts & Law", level: "UG", stream: "Law", duration: "5 years", feeFrom: 1, feeTo: 4, exams: ["CLAT", "AILET", "LSAT India"], careers: ["Corporate lawyer", "Litigator", "Legal advisor"], eligibility: "12th any stream, 45%+", avgSalary: "₹6–15 LPA" },
  { slug: "bcom", name: "B.Com", full: "Bachelor of Commerce", level: "UG", stream: "Commerce", duration: "3 years", feeFrom: 0.2, feeTo: 2.5, exams: ["CUET UG", "Merit-based"], careers: ["Accountant", "Financial analyst", "CA / CS"], eligibility: "12th Commerce preferred", avgSalary: "₹3–6 LPA" },
  { slug: "bsc", name: "B.Sc", full: "Bachelor of Science", level: "UG", stream: "Science", duration: "3–4 years", feeFrom: 0.2, feeTo: 1.5, exams: ["CUET UG"], careers: ["Researcher", "Lab scientist", "Teacher"], eligibility: "12th Science", avgSalary: "₹3–5 LPA" },
  { slug: "bpharm", name: "B.Pharm", full: "Bachelor of Pharmacy", level: "UG", stream: "Pharmacy", duration: "4 years", feeFrom: 0.7, feeTo: 2, exams: ["State CETs", "NEET UG"], careers: ["Pharmacist", "Drug inspector", "Medical rep"], eligibility: "12th with PCB/PCM", avgSalary: "₹3–6 LPA" },
  { slug: "ba", name: "BA", full: "Bachelor of Arts", level: "UG", stream: "Arts", duration: "3 years", feeFrom: 0.1, feeTo: 1.5, exams: ["CUET UG"], careers: ["Content writer", "Civil services", "Psychologist"], eligibility: "12th any stream", avgSalary: "₹3–5 LPA" },
  { slug: "mba", name: "MBA / PGDM", full: "Master of Business Administration", level: "PG", stream: "Management", duration: "2 years", feeFrom: 2, feeTo: 25, exams: ["CAT", "XAT", "MAT", "CMAT"], careers: ["Product manager", "Consultant", "Investment banker"], eligibility: "Graduation, 50%+", avgSalary: "₹8–25 LPA" },
  { slug: "mtech", name: "M.Tech", full: "Master of Technology", level: "PG", stream: "Engineering", duration: "2 years", feeFrom: 0.8, feeTo: 3, exams: ["GATE"], careers: ["R&D engineer", "Chip designer", "Professor"], eligibility: "B.Tech / B.E.", avgSalary: "₹7–15 LPA" },
  { slug: "mca", name: "MCA", full: "Master of Computer Applications", level: "PG", stream: "Computer Applications", duration: "2 years", feeFrom: 0.8, feeTo: 3, exams: ["NIMCET", "CUET PG"], careers: ["Software developer", "Cloud engineer", "Data engineer"], eligibility: "BCA / B.Sc with Maths", avgSalary: "₹5–10 LPA" },
  { slug: "md-ms", name: "MD / MS", full: "Doctor of Medicine / Master of Surgery", level: "PG", stream: "Medical", duration: "3 years", feeFrom: 1, feeTo: 30, exams: ["NEET PG"], careers: ["Specialist doctor", "Surgeon", "Consultant"], eligibility: "MBBS + internship", avgSalary: "₹15–40 LPA" },
  { slug: "mdes", name: "M.Des", full: "Master of Design", level: "PG", stream: "Design", duration: "2 years", feeFrom: 1.5, feeTo: 4, exams: ["CEED", "NID DAT"], careers: ["Design lead", "Interaction designer", "Design researcher"], eligibility: "Graduation in any field", avgSalary: "₹8–16 LPA" },
  { slug: "llm", name: "LLM", full: "Master of Laws", level: "PG", stream: "Law", duration: "1 year", feeFrom: 1, feeTo: 3, exams: ["CLAT PG"], careers: ["Legal counsel", "Judicial services", "Academic"], eligibility: "LLB, 50%+", avgSalary: "₹8–18 LPA" },
  { slug: "mcom", name: "M.Com", full: "Master of Commerce", level: "PG", stream: "Commerce", duration: "2 years", feeFrom: 0.2, feeTo: 1.5, exams: ["CUET PG"], careers: ["Finance manager", "Lecturer", "Tax consultant"], eligibility: "B.Com", avgSalary: "₹4–7 LPA" },
  { slug: "msc", name: "M.Sc", full: "Master of Science", level: "PG", stream: "Science", duration: "2 years", feeFrom: 0.2, feeTo: 2, exams: ["IIT JAM", "CUET PG"], careers: ["Scientist", "Data scientist", "Professor"], eligibility: "B.Sc in relevant subject", avgSalary: "₹4–9 LPA" },
  { slug: "mpharm", name: "M.Pharm", full: "Master of Pharmacy", level: "PG", stream: "Pharmacy", duration: "2 years", feeFrom: 0.8, feeTo: 2.5, exams: ["GPAT"], careers: ["Clinical researcher", "QA manager", "Formulation scientist"], eligibility: "B.Pharm", avgSalary: "₹5–9 LPA" },
  { slug: "ma", name: "MA", full: "Master of Arts", level: "PG", stream: "Arts", duration: "2 years", feeFrom: 0.1, feeTo: 1.5, exams: ["CUET PG"], careers: ["Journalist", "Policy analyst", "Lecturer"], eligibility: "Graduation in any field", avgSalary: "₹3.5–7 LPA" },
];

/* ------------------------------------------------------------------ */

export type ExamStatus = "Applications open" | "Opening soon" | "Closed";

export interface Exam {
  slug: string;
  name: string;
  full: string;
  level: Level;
  stream: Stream;
  body: string;
  examDate: string;
  applyBy: string;
  status: ExamStatus;
  mode: string;
  colleges: string;
}

// Dates are tentative for the 2027 admission cycle.
export const EXAMS: Exam[] = [
  { slug: "jee-main", name: "JEE Main", full: "Joint Entrance Examination (Main)", level: "UG", stream: "Engineering", body: "NTA", examDate: "Jan 21–30, 2027", applyBy: "Nov 22, 2026", status: "Applications open", mode: "Computer-based", colleges: "NITs, IIITs, 1,500+ private" },
  { slug: "neet-ug", name: "NEET UG", full: "National Eligibility cum Entrance Test", level: "UG", stream: "Medical", body: "NTA", examDate: "May 2, 2027", applyBy: "Mar 7, 2027", status: "Opening soon", mode: "Pen and paper", colleges: "All MBBS & BDS colleges" },
  { slug: "cuet-ug", name: "CUET UG", full: "Common University Entrance Test", level: "UG", stream: "Arts", body: "NTA", examDate: "May 13–Jun 3, 2027", applyBy: "Mar 22, 2027", status: "Opening soon", mode: "Computer-based", colleges: "Central & 250+ universities" },
  { slug: "clat", name: "CLAT", full: "Common Law Admission Test", level: "UG", stream: "Law", body: "Consortium of NLUs", examDate: "Dec 6, 2026", applyBy: "Nov 3, 2026", status: "Applications open", mode: "Pen and paper", colleges: "24 NLUs + 60 private" },
  { slug: "nid-dat", name: "NID DAT", full: "NID Design Aptitude Test", level: "UG", stream: "Design", body: "NID", examDate: "Jan 10, 2027", applyBy: "Nov 30, 2026", status: "Applications open", mode: "Pen and paper", colleges: "NIDs + design schools" },
  { slug: "bitsat", name: "BITSAT", full: "BITS Admission Test", level: "UG", stream: "Engineering", body: "BITS Pilani", examDate: "May 20–30, 2027", applyBy: "Apr 10, 2027", status: "Opening soon", mode: "Computer-based", colleges: "BITS Pilani, Goa, Hyderabad" },
  { slug: "cat", name: "CAT", full: "Common Admission Test", level: "PG", stream: "Management", body: "IIMs", examDate: "Nov 29, 2026", applyBy: "Sep 20, 2026", status: "Closed", mode: "Computer-based", colleges: "IIMs + 1,200 B-schools" },
  { slug: "xat", name: "XAT", full: "Xavier Aptitude Test", level: "PG", stream: "Management", body: "XLRI", examDate: "Jan 3, 2027", applyBy: "Nov 30, 2026", status: "Applications open", mode: "Computer-based", colleges: "XLRI + 160 B-schools" },
  { slug: "mat", name: "MAT", full: "Management Aptitude Test", level: "PG", stream: "Management", body: "AIMA", examDate: "Dec 14, 2026", applyBy: "Dec 5, 2026", status: "Applications open", mode: "Online & paper", colleges: "600+ B-schools" },
  { slug: "gate", name: "GATE", full: "Graduate Aptitude Test in Engineering", level: "PG", stream: "Engineering", body: "IIT Roorkee", examDate: "Feb 6–14, 2027", applyBy: "Oct 30, 2026", status: "Applications open", mode: "Computer-based", colleges: "IITs, NITs, PSU jobs" },
  { slug: "neet-pg", name: "NEET PG", full: "NEET Postgraduate", level: "PG", stream: "Medical", body: "NBEMS", examDate: "Jun 2027", applyBy: "Apr 2027", status: "Opening soon", mode: "Computer-based", colleges: "All MD/MS seats" },
  { slug: "cuet-pg", name: "CUET PG", full: "Common University Entrance Test PG", level: "PG", stream: "Science", body: "NTA", examDate: "Mar 13–31, 2027", applyBy: "Feb 1, 2027", status: "Opening soon", mode: "Computer-based", colleges: "Central & 190+ universities" },
];

/* ------------------------------------------------------------------ */

export interface Counsellor {
  name: string;
  initials: string;
  role: string;
  focus: Stream[];
  languages: string[];
  years: number;
  students: number;
  rating: number;
  tone: string;
  photo: string;
}

// Sample counsellors for the demo. Replace with the client's real team before launch; sections that show them hide themselves if this list is empty.
export const COUNSELLORS: Counsellor[] = [
  { name: "Ritu Malhotra", initials: "RM", role: "Senior admission counsellor", focus: ["Management", "Commerce"], languages: ["Hindi", "English", "Punjabi"], years: 11, students: 3200, rating: 4.9, tone: "#0D7377", photo: "/images/c-ritu.jpg" },
  { name: "Arvind Iyer", initials: "AI", role: "Engineering admissions lead", focus: ["Engineering", "Computer Applications"], languages: ["English", "Tamil", "Hindi"], years: 9, students: 2750, rating: 4.9, tone: "#EA7300", photo: "/images/c-arvind.jpg" },
  { name: "Dr. Farah Khan", initials: "FK", role: "Medical & NEET counsellor", focus: ["Medical", "Pharmacy"], languages: ["Hindi", "English", "Urdu"], years: 13, students: 4100, rating: 5.0, tone: "#E0475B", photo: "/images/c-farah.jpg" },
  { name: "Sneha Kulkarni", initials: "SK", role: "Design & creative careers", focus: ["Design", "Arts"], languages: ["Marathi", "Hindi", "English"], years: 7, students: 1380, rating: 4.8, tone: "#C2410C", photo: "/images/c-sneha-centered.jpg" },
  { name: "Abhishek Rao", initials: "AR", role: "Law admissions counsellor", focus: ["Law"], languages: ["Telugu", "English", "Hindi"], years: 8, students: 1600, rating: 4.8, tone: "#7C3AED", photo: "/images/c-abhishek-2.jpg" },
  { name: "Priyanka Das", initials: "PD", role: "PG & study-gap specialist", focus: ["Science", "Arts", "Management"], languages: ["Bengali", "Assamese", "English", "Hindi"], years: 10, students: 2240, rating: 4.9, tone: "#0E7490", photo: "/images/c-priyanka.jpg" },
];

export interface Testimonial {
  name: string;
  photo: string;
  /** Width and height of the photo, so it can be shown whole at its own shape. */
  photoSize: [number, number];
  from: string;
  outcome: string;
  counsellor: string;
  text: string;
}

// Sample reviews for the demo. Replace with real student reviews before launch; the section hides itself if this list is empty.
export const TESTIMONIALS: Testimonial[] = [
  { name: "Ananya Verma", photo: "/images/s-8.jpg", photoSize: [600, 898], from: "Lucknow", outcome: "B.Tech CSE, Vardhan Institute", counsellor: "Arvind", text: "I had a 91 percentile and no idea which colleges were realistic. Arvind made me a list of 8 and I got into my second choice with a 50% scholarship." },
  { name: "Rahul Bhatt", photo: "/images/s-2.jpg", photoSize: [500, 291], from: "Surat", outcome: "MBA, Kaveri School of Management", counsellor: "Ritu", text: "I was working for two years and scared of the gap. Ritu helped me shortlist B-schools that value work experience and even reviewed my SOP." },
  { name: "Sakshi Jain", photo: "/images/s-10.jpg", photoSize: [600, 900], from: "Indore", outcome: "MBBS, Indus Valley Medical College", counsellor: "Dr. Farah", text: "The NEET counselling rounds are confusing. Dr. Farah sat with my parents on a call and explained every round and choice-filling step." },
  { name: "Mohit Saini", photo: "/images/s-4.jpg", photoSize: [500, 333], from: "Rohtak", outcome: "BA LLB, Northgate University", counsellor: "Abhishek", text: "My parents wanted engineering, I wanted law. The counsellor showed them placement data for law schools, and that changed the conversation." },
  { name: "Ishaan Rao", photo: "/images/s-3.jpg", photoSize: [500, 333], from: "Hyderabad", outcome: "B.Des UX, Saraswati Institute of Design", counsellor: "Sneha", text: "Sneha told me exactly what to put in my portfolio. Didn't know design entrance was this different from boards." },
  { name: "Neha Gogoi", photo: "/images/s-5.jpg", photoSize: [600, 900], from: "Jorhat", outcome: "M.Sc, Brahmaputra University", counsellor: "Priyanka", text: "Spoke to me in Assamese, which made my parents comfortable. Found me a scholarship I didn't know existed." },
];

export const FAQS = [
  { q: "Is counselling on Admission House really free?", a: "Yes. Students and parents never pay us. Our partner colleges support the platform, but our counsellors recommend colleges based on your marks, budget and goals, not on who partners with us." },
  { q: "I'm in Class 12. When should I start?", a: "Ideally right after your pre-boards (Dec–Jan). That gives time to plan entrance exams, application deadlines and scholarship forms. But it's never too late, many admissions run until August." },
  { q: "Can you help with PG admissions after a gap year or job?", a: "Yes. We have counsellors who specialise in MBA, M.Tech, MCA and MA admissions for working professionals and students with study gaps." },
  { q: "Will you help with the application form and documents?", a: "Your counsellor will walk you through each form, the documents needed, and scholarship applications over a call, WhatsApp or video." },
  { q: "Do you guarantee admission?", a: "No one can honestly guarantee admission. What we do is build a balanced list of dream, target and safe colleges so you always have a strong option." },
  { q: "Can my parents join the counselling call?", a: "Please bring them. Most of our sessions include parents, and counsellors speak Hindi, English and 8 regional languages." },
];

export const LANGUAGES = Array.from(new Set(COUNSELLORS.flatMap((c) => c.languages))).sort();

export const STREAM_IMAGES: Record<Stream, string> = {
  Engineering: "/images/campus-eng.jpg",
  Management: "/images/suits.jpg",
  Medical: "/images/st-medical.jpg",
  "Computer Applications": "/images/st-computer.jpg",
  Design: "/images/st-design.jpg",
  Law: "/images/st-law.jpg",
  Commerce: "/images/st-commerce.jpg",
  Science: "/images/st-science.jpg",
  Pharmacy: "/images/st-pharmacy.jpg",
  Arts: "/images/st-arts.jpg",
};
