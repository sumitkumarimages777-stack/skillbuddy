export const CATEGORIES = [
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
  { id: "data", label: "Data" },
  { id: "marketing", label: "Marketing" },
  { id: "ai", label: "AI" },
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];

export const LEAD_STATUSES = ["new", "contacted", "converted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const APPLICATION_STATUSES = ["new", "contacted", "accepted", "enrolled", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PROJECT_ACCENTS = ["blue", "yellow", "green"] as const;
export type ProjectAccent = (typeof PROJECT_ACCENTS)[number];

export type SiteSettings = {
  announcement_html: string | null;
  announcement_link_label: string | null;
  announcement_link_url: string | null;
  admissions_badge: string | null;
  hero_title: string | null;
  hero_highlight: string | null;
  hero_subtitle: string | null;
  max_batch_size: number | null;
  company_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

export type Mentor = {
  id: string;
  name: string;
  role: string;
  company: string;
  track: Category;
  bio: string;
  photo_url: string | null;
  /** Vertical focus of the cropped photo: 0 = top, 50 = centre, 100 = bottom. */
  photo_position_y: number;
  linkedin_url: string | null;
  published: boolean;
  sort_order: number;
};

export type CourseModule = {
  id?: string;
  position?: number;
  weeks_label: string;
  title: string;
  topics: string;
  assignment: string;
};

export type CourseProject = {
  id?: string;
  position?: number;
  title: string;
  description: string;
  accent: ProjectAccent;
  image_url: string | null;
};

export type CourseBatch = {
  id?: string;
  position?: number;
  name: string;
  schedule: string;
};

export type WeekPlanItem = {
  id?: string;
  position?: number;
  day_label: string;
  activity: string;
  detail: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  short_code: string;
  category: Category;
  blurb: string;
  description: string;
  duration_weeks: number | null;
  format: string;
  mode: string;
  effort: string;
  batch_size: number | null;
  start_date: string | null;
  applications_close: string | null;
  price: number | null;
  emi_from: number | null;
  dubuddy_discount: number | null;
  seats_left: number | null;
  outcomes: string[];
  syllabus_url: string | null;
  lead_mentor_id: string | null;
  guest_mentors_note: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export type CourseDetail = Course & {
  modules: CourseModule[];
  projects: CourseProject[];
  batches: CourseBatch[];
  week_plan: WeekPlanItem[];
  lead_mentor: Mentor | null;
};

export type Review = {
  id: string;
  learner_name: string;
  college: string;
  outcome_role: string;
  outcome_company: string;
  course_id: string | null;
  quote: string;
  photo_url: string | null;
  published: boolean;
  sort_order: number;
  course?: { title: string; short_title: string } | null;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  published: boolean;
  sort_order: number;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: "home" | "course";
  course_id: string | null;
  status: LeadStatus;
  notes: string;
  created_at: string;
  course?: { title: string } | null;
};

export type Application = {
  id: string;
  course_id: string | null;
  batch_id: string | null;
  batch_name: string;
  full_name: string;
  college_year: string;
  phone: string;
  status: ApplicationStatus;
  notes: string;
  created_at: string;
  course?: { title: string } | null;
};
