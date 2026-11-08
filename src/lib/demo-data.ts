/**
 * Content from the SkillBuddy prototype.
 *
 * - Used as the site's content when Supabase isn't configured yet (demo mode),
 *   so the public pages render straight after cloning.
 * - `npm run seed:sql` turns this file into supabase/seed.sql, so the database
 *   starts with the same content.
 *
 * Bracketed values ("[Mentor name]") are placeholders carried over from the
 * prototype; replace them from the admin panel.
 */
import type { CourseDetail, Faq, Mentor, Review, SiteSettings } from "./types";

export const demoSettings: SiteSettings = {
  announcement_html: "From the team behind <strong>DUBuddy</strong> — trusted by 2 lakh+ students every year.",
  announcement_link_label: "Visit DUBuddy",
  announcement_link_url: "https://dubuddy.in/",
  admissions_badge: "Admissions open for upcoming cohorts",
  hero_title: "Learn job-ready skills in live cohorts, not recorded videos.",
  hero_highlight: "live cohorts",
  hero_subtitle:
    "Small-batch, mentor-led programs in Product, Design, Data, Marketing and AI. Learn live on weekends, build real projects, and get interview-ready while you're still in college.",
  max_batch_size: null,
  company_name: "Cyberflow Tech Private Limited",
  contact_email: null,
  contact_phone: null,
};

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const demoMentors: Mentor[] = [
  { id: id(101), name: "[Mentor name]", role: "Senior Product Manager", company: "[Company]", track: "product", bio: "[One line on their background and products shipped.]", photo_url: null, linkedin_url: null, published: true, sort_order: 1 },
  { id: id(102), name: "[Mentor name]", role: "Product Designer", company: "[Company]", track: "design", bio: "", photo_url: null, linkedin_url: null, published: true, sort_order: 2 },
  { id: id(103), name: "[Mentor name]", role: "Data Analyst", company: "[Company]", track: "data", bio: "", photo_url: null, linkedin_url: null, published: true, sort_order: 3 },
  { id: id(104), name: "[Mentor name]", role: "Growth Marketer", company: "[Company]", track: "marketing", bio: "", photo_url: null, linkedin_url: null, published: true, sort_order: 4 },
];

const weekendBatches = [
  { name: "Weekend Morning batch", schedule: "Sat & Sun · 10:00 AM – 12:00 PM" },
  { name: "Weekend Evening batch", schedule: "Sat & Sun · 6:00 PM – 8:00 PM" },
];

const typicalWeek = [
  { day_label: "Saturday", activity: "Live class", detail: "2 hours with your lead mentor" },
  { day_label: "Sunday", activity: "Live workshop", detail: "2 hours, hands-on with your peer group" },
  { day_label: "Mon – Thu", activity: "Assignment work", detail: "Self-paced, ~4 hours" },
  { day_label: "Friday", activity: "Submission & doubt session", detail: "1 hour, optional" },
];

type CourseSeed = Omit<CourseDetail, "lead_mentor">;

const base = {
  format: "Live online, weekends",
  mode: "Live · Weekends",
  effort: "8–10 hrs / week",
  batch_size: null,
  start_date: null,
  applications_close: null,
  price: null,
  emi_from: null,
  dubuddy_discount: null,
  seats_left: null,
  syllabus_url: null,
  guest_mentors_note: "",
  published: true,
  batches: weekendBatches,
  week_plan: typicalWeek,
} satisfies Partial<CourseSeed>;

export const demoCourses: CourseSeed[] = [
  {
    ...base,
    id: id(1),
    slug: "product-management",
    title: "Product Management Cohort",
    short_title: "Product Management",
    short_code: "PM",
    category: "product",
    blurb: "Go from user problems to shipped features. Write PRDs, define metrics, and present a product case study to mentors.",
    description:
      "A 12-week live program for students and freshers who want to become Associate Product Managers. Learn the PM toolkit on weekends and finish with a product case study you can walk interviewers through.",
    duration_weeks: 12,
    featured: true,
    sort_order: 1,
    lead_mentor_id: id(101),
    guest_mentors_note: "Plus guest sessions from PMs across startups and large tech companies.",
    outcomes: [
      "Talk to users and turn interviews into clear problem statements",
      "Write a PRD and user stories engineers can build from",
      "Define success metrics and read a product dashboard",
      "Prioritise a roadmap with RICE and trade-off reasoning",
      "Wireframe flows and test them with real users",
      "Crack product sense, metrics and guesstimate interview rounds",
    ],
    modules: [
      { weeks_label: "Week 1–2", title: "What PMs actually do", topics: "The PM role across startups and big tech, product lifecycle, working with design and engineering.", assignment: "Teardown of an app you use daily." },
      { weeks_label: "Week 3–4", title: "User research & problem discovery", topics: "User interviews, personas, jobs-to-be-done, synthesising insights.", assignment: "Run 5 user interviews and present findings." },
      { weeks_label: "Week 5–6", title: "Solutioning & PRDs", topics: "Ideation, prioritisation frameworks, writing PRDs and user stories.", assignment: "Write a PRD for a new feature." },
      { weeks_label: "Week 7–8", title: "Design & prototyping for PMs", topics: "Wireframing in Figma, usability testing, iterating on feedback.", assignment: "Clickable prototype tested with users." },
      { weeks_label: "Week 9–10", title: "Metrics, SQL & experimentation", topics: "North-star metrics, funnels, basic SQL, A/B testing.", assignment: "Metrics plan and dashboard for your feature." },
      { weeks_label: "Week 11–12", title: "Capstone & interview prep", topics: "Roadmapping, stakeholder pitch, resume and mock interviews.", assignment: "Capstone demo day with mentor panel." },
    ],
    projects: [
      { title: "Product teardown", description: "Break down a popular Indian app — users, business model, and what you'd change next.", accent: "blue", image_url: null },
      { title: "Feature PRD & prototype", description: "Write a PRD for a new feature and test a clickable prototype with five real users.", accent: "yellow", image_url: null },
      { title: "Capstone case study", description: "Pick a problem, define success metrics, and pitch your roadmap to a panel of mentors.", accent: "green", image_url: null },
    ],
  },
  {
    ...base,
    id: id(2),
    slug: "ui-ux-design",
    title: "UI/UX Design Cohort",
    short_title: "UI/UX Design",
    short_code: "UX",
    category: "design",
    blurb: "Research, wireframe and prototype in Figma. Graduate with two case studies for your design portfolio.",
    description: "A 14-week live program to take you from design basics to a portfolio with two end-to-end case studies.",
    duration_weeks: 14,
    featured: true,
    sort_order: 2,
    lead_mentor_id: id(102),
    outcomes: [],
    modules: [],
    projects: [],
  },
  {
    ...base,
    id: id(3),
    slug: "data-analytics",
    title: "Data Analytics Cohort",
    short_title: "Data Analytics",
    short_code: "DA",
    category: "data",
    blurb: "Excel, SQL, Python and Power BI on real business datasets. Build dashboards recruiters can click through.",
    description: "A 16-week live program covering the analyst toolkit on real business datasets.",
    duration_weeks: 16,
    featured: true,
    sort_order: 3,
    lead_mentor_id: id(103),
    outcomes: [],
    modules: [],
    projects: [],
  },
  {
    ...base,
    id: id(4),
    slug: "business-analyst",
    title: "Business Analyst Cohort",
    short_title: "Business Analyst",
    short_code: "BA",
    category: "data",
    blurb: "Turn data into decisions: requirement docs, process maps, SQL and stakeholder-ready presentations.",
    description: "A 12-week live program on requirements, process mapping, SQL and stakeholder communication.",
    duration_weeks: 12,
    featured: false,
    sort_order: 4,
    lead_mentor_id: null,
    outcomes: [],
    modules: [],
    projects: [],
  },
  {
    ...base,
    id: id(5),
    slug: "digital-marketing",
    title: "Digital Marketing Cohort",
    short_title: "Digital Marketing",
    short_code: "DM",
    category: "marketing",
    blurb: "Performance ads, SEO, content and analytics. Run a live campaign with a real budget during the program.",
    description: "A 10-week live program on performance marketing, SEO, content and analytics.",
    duration_weeks: 10,
    featured: false,
    sort_order: 5,
    lead_mentor_id: id(104),
    outcomes: [],
    modules: [],
    projects: [],
  },
  {
    ...base,
    id: id(6),
    slug: "applied-generative-ai",
    title: "Applied Generative AI Bootcamp",
    short_title: "Applied Generative AI",
    short_code: "AI",
    category: "ai",
    blurb: "Use AI tools and APIs to automate real work: prompt design, no-code agents and a capstone you can demo.",
    description: "A 6-week live bootcamp on using AI tools and APIs to automate real work.",
    duration_weeks: 6,
    featured: true,
    sort_order: 6,
    lead_mentor_id: null,
    outcomes: [],
    modules: [],
    projects: [],
  },
];

export const demoReviews: Review[] = [
  { id: id(201), learner_name: "[Learner name]", college: "[College]", outcome_role: "[Role]", outcome_company: "[Company]", course_id: id(1), quote: "[Learner quote about the Product Management cohort — what they built and where they landed.]", photo_url: null, published: true, sort_order: 1 },
  { id: id(202), learner_name: "[Learner name]", college: "[College]", outcome_role: "[Role]", outcome_company: "[Company]", course_id: id(2), quote: "[Learner quote about the UI/UX Design cohort — what they built and where they landed.]", photo_url: null, published: true, sort_order: 2 },
  { id: id(203), learner_name: "[Learner name]", college: "[College]", outcome_role: "[Role]", outcome_company: "[Company]", course_id: id(3), quote: "[Learner quote about the Data Analytics cohort — what they built and where they landed.]", photo_url: null, published: true, sort_order: 3 },
];

export const demoFaqs: Faq[] = [
  { id: id(301), question: "Who are these programs for?", answer: "College students in any year and freshers up to 2 years of experience who want to move into product, design, data, marketing or AI roles. No prior background is needed for most programs.", published: true, sort_order: 1 },
  { id: id(302), question: "How much time do I need each week?", answer: "Plan for about 8–10 hours: two live weekend sessions plus assignments. Sessions are recorded in case you miss one.", published: true, sort_order: 2 },
  { id: id(303), question: "Is this a self-paced course?", answer: "No. Every program runs as a live cohort with a fixed start date, weekly deadlines and mentor reviews — that structure is what keeps learners finishing.", published: true, sort_order: 3 },
  { id: id(304), question: "Do you offer placement support?", answer: "Yes. You get resume and portfolio reviews, mock interviews, and access to internship and job openings shared with the cohort. [Add final placement policy.]", published: true, sort_order: 4 },
  { id: id(305), question: "Are EMI or scholarships available?", answer: "[Confirm EMI partners and scholarship criteria before launch.]", published: true, sort_order: 5 },
  { id: id(306), question: "What is the refund policy?", answer: "[Add refund window and conditions before launch.]", published: true, sort_order: 6 },
];
