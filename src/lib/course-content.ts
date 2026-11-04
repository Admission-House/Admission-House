// Write course details here. Anything you leave out is simply not shown on the course page.
// The 20 main courses already have duration, fees, eligibility, exams and careers in data.ts;
// an entry here adds a description and can override those. Example:
//
//   bed: {
//     description: "Two-year teacher training degree for ...",
//     duration: "2 years",
//     eligibility: "Graduation with 50%",
//     fees: "₹0.4 to ₹1.5 lakh a year",
//     exams: ["State B.Ed CET"],
//     careers: ["School teacher", "Education counsellor"],
//   },
export interface CourseContent {
  description?: string;
  duration?: string;
  eligibility?: string;
  fees?: string;
  exams?: string[];
  careers?: string[];
  avgSalary?: string;
}

export const COURSE_CONTENT: Record<string, CourseContent> = {};
