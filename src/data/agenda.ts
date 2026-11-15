export type Category =
  | "Arrival"
  | "Welcome"
  | "Keynote"
  | "Talk"
  | "Posters"
  | "Break"
  | "Networking"
  | "Closing";
export interface AgendaEntry {
  start: string;
  duration: number;
  title: string;
  notes: string | null;
  category: Category;
}

export const agenda: AgendaEntry[] = [
  {
    start: "08:30",
    duration: 30,
    title: "Registration and welcome coffee",
    notes: null,
    category: "Arrival",
  },
  {
    start: "09:00",
    duration: 10,
    title: "Welcome and introduction to SHIFRA; host remarks",
    notes: "Hala Alsaleh, Haotian Tang, Eduardo Beltrame",
    category: "Welcome",
  },
  {
    start: "09:10",
    duration: 30,
    title: "Opening keynote",
    notes: "To be announced",
    category: "Keynote",
  },
  {
    start: "09:40",
    duration: 20,
    title: "Session 1: Reading Life — first talk",
    notes: "Speaker and talk title to be announced",
    category: "Talk",
  },
  {
    start: "10:00",
    duration: 20,
    title: "Session 1: Reading Life — second talk",
    notes: "Speaker and talk title to be announced",
    category: "Talk",
  },
  {
    start: "10:20",
    duration: 20,
    title: "One-minute poster pitches",
    notes: "Presenters to be announced",
    category: "Posters",
  },
  {
    start: "10:40",
    duration: 60,
    title: "Coffee break and poster session",
    notes:
      "All attendees · Cake cutting and group photo in the provisional plan",
    category: "Posters",
  },
  {
    start: "11:40",
    duration: 20,
    title: "Session 2: AI That Acts",
    notes: "Speaker and talk title to be announced",
    category: "Talk",
  },
  {
    start: "12:00",
    duration: 20,
    title: "Session 3: Bridge Genomics with AI — first talk",
    notes: "Speaker and talk title to be announced",
    category: "Talk",
  },
  {
    start: "12:20",
    duration: 20,
    title: "Session 3: Bridge Genomics with AI — second talk",
    notes: "Speaker and talk title to be announced",
    category: "Talk",
  },
  {
    start: "12:40",
    duration: 20,
    title: "Session 4: Future of AI and Genomics",
    notes: "Presenter and details to be announced",
    category: "Talk",
  },
  {
    start: "13:00",
    duration: 60,
    title: "Lunch and informal networking",
    notes: null,
    category: "Networking",
  },
  {
    start: "14:00",
    duration: 15,
    title: "Selected talk 1",
    notes: "To be announced",
    category: "Talk",
  },
  {
    start: "14:15",
    duration: 15,
    title: "Selected talk 2",
    notes: "To be announced",
    category: "Talk",
  },
  {
    start: "14:30",
    duration: 15,
    title: "Selected talk 3",
    notes: "To be announced",
    category: "Talk",
  },
  {
    start: "14:45",
    duration: 15,
    title: "Selected talk 4",
    notes: "To be announced",
    category: "Talk",
  },
  {
    start: "15:00",
    duration: 10,
    title: "Closing remarks",
    notes: "Eduardo Beltrame · Provisional assignment",
    category: "Closing",
  },
];
