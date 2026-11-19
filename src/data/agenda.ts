export type Category = "Arrival" | "Welcome" | "Keynote" | "Talk" | "Posters" | "Break" | "Networking" | "Closing";
export interface AgendaEntry {
  start: string;
  duration: number;
  title: string;
  notes: string | null;
  category: Category;
  speaker?: string;
  affiliation?: string;
  session?: number;
}

export const sessions: Record<number, string> = {
  1: "Human Genomics, Precision Medicine & Sports Genomics",
  2: "Artificial Intelligence, Molecular Technologies & Therapeutic Discovery",
  3: "Plant Genomics, Biodiversity & Environmental Sustainability",
};

export const agenda: AgendaEntry[] = [
  { start: "08:30", duration: 30, title: "Registration and Welcome Reception", notes: "All attendees", category: "Arrival" },
  { start: "09:00", duration: 10, title: "Official Opening, Welcome and Vision of SHIFRA", speaker: "Hala Alsaleh; Haotian Tang; Eduardo Beltrame", notes: null, category: "Welcome" },
  { start: "09:10", duration: 15, title: "Opening Address", notes: "Guest of honour · Attendance, name and official title to be confirmed", category: "Welcome" },
  { start: "09:25", duration: 30, title: "Keynote: TBA", speaker: "TBA", notes: null, category: "Keynote" },
  { start: "09:55", duration: 25, session: 1, title: "From the Emirati Genome to AI-Driven Precision Medicine: The Future of Healthcare in the UAE", speaker: "TBA", notes: null, category: "Talk" },
  { start: "10:20", duration: 25, title: "UAE Sports Genomics: A Pioneering Study of Genetic Markers Associated with Athletic Performance, Strength, Endurance, and Injury Risk", speaker: "TBA", notes: null, category: "Talk" },
  { start: "10:45", duration: 15, title: "One-Minute Poster Pitches", notes: "Student presenters", category: "Posters" },
  { start: "11:00", duration: 10, title: "Cake Cutting and Photographs", notes: "All attendees", category: "Break" },
  { start: "11:10", duration: 60, title: "Poster Session and Scientific Networking", notes: "Student presenters and attendees", category: "Posters" },
  { start: "12:10", duration: 50, title: "Lunch and Scientific Networking", notes: "All attendees · Lunch service begins at 12:00", category: "Networking" },
  { start: "13:00", duration: 20, session: 2, title: "When Plants Become Medicine: From Genetic Engineering to Nanotechnology and AI", speaker: "TBA", notes: null, category: "Talk" },
  { start: "13:20", duration: 20, title: "Cancer Genomics and Genetic Risk Stratification in the United Arab Emirates", speaker: "TBA", notes: null, category: "Talk" },
  { start: "13:40", duration: 20, title: "The Emirati Genome Program Enables Population-wide Penetrance Estimation and Novel Discovery for Inherited Retinal Disease", speaker: "TBA", notes: null, category: "Talk" },
  { start: "14:00", duration: 20, session: 3, title: "Plant Genome Sequencing to Safeguard Native UAE Species", speaker: "TBA", notes: null, category: "Talk" },
  { start: "14:20", duration: 20, title: "Plant Genomics and Biodiversity Research in the UAE", speaker: "TBA", notes: null, category: "Talk" },
  { start: "14:40", duration: 20, title: "AI-Powered Wellness: Tailored Dietary Support for Chronic Disease Management", speaker: "TBA", notes: null, category: "Talk" },
  { start: "15:00", duration: 30, title: "Coffee Break", notes: "All attendees", category: "Break" },
  { start: "15:30", duration: 40, title: "Selected Speaker Talks", notes: "40 mins for 4 speakers · Presenters and titles to be confirmed", category: "Talk" },
  { start: "16:10", duration: 5, title: "Closing Remarks and Speaker Recognition", speaker: "Organizing Committee; Eduardo Beltrame", notes: null, category: "Closing" },
];
