/** Category id (slug). Categories are managed in the admin panel (`categories` table). */
export type Category = string;

export type CategoryItem = { id: Category; label: string; sort_order: number };

/** Default categories, used in demo mode and as a fallback if the table can't be read. */
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "product", label: "Product", sort_order: 1 },
  { id: "engineering", label: "Engineering", sort_order: 2 },
  { id: "operations", label: "Operations", sort_order: 3 },
  { id: "marketing", label: "Marketing", sort_order: 4 },
  { id: "creative", label: "Creative", sort_order: 5 },
  { id: "design", label: "Design", sort_order: 6 },
  { id: "data", label: "Data", sort_order: 7 },
  { id: "ai", label: "AI", sort_order: 8 },
];

export const categoryLabel = (categories: CategoryItem[], id: string | null | undefined) =>
  categories.find((c) => c.id === id)?.label ?? id ?? "";

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
