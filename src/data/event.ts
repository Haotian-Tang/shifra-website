export interface Person {
  name: string;
  initials: string;
  title: string | null;
  affiliation: string | null;
  biography: string | null;
  portrait: string | null;
  profileUrl: string | null;
}

export interface Speaker extends Person {
  talkTitle: string | null;
}

export const event = {
  name: "SHIFRA Symposium",
  brand: "SHIFRA",
  arabicBrand: "شيفرة",
  theme: "Genomics × AI UAE",
  date: "2026-11-27",
  displayDate: "27 November 2026",
  shortDate: "27.11.2026",
  timezone: "Asia/Dubai",
  timezoneLabel: "UAE time (GST, UTC+4)",
  utcOffset: "+04:00",
  venue: "Visitor Center",
  institution: "Mohamed bin Zayed University of Artificial Intelligence",
  institutionShort: "MBZUAI",
  division: "Division of Biological and Life Sciences",
  divisionShort: "BLS",
  programmeStatus: "Provisional programme",
  confirmationNote:
    "Speakers and presenter assignments are subject to confirmation.",
  introduction:
    "SHIFRA brings students, researchers, and invited guests together to explore the intersection of genomics and artificial intelligence.",
  story:
    "Named after the Arabic word for “code”, SHIFRA connects the code of life with the code of computation through scientific talks, student research, posters, and conversations across disciplines.",
  registrationUrl: null as string | null,
  contactEmail: null as string | null,
  poster: {
    image: null as string | null,
    alt: "SHIFRA Symposium poster",
    download: null as string | null,
  },
};

export const organizers: Person[] = [
  {
    name: "Hala Alsaleh",
    initials: "HA",
    title: null,
    affiliation: null,
    biography: null,
    portrait: null,
    profileUrl: null,
  },
  {
    name: "Haotian Tang",
    initials: "HT",
    title: null,
    affiliation: null,
    biography: null,
    portrait: null,
    profileUrl: null,
  },
  {
    name: "Eduardo Beltrame",
    initials: "EB",
    title: null,
    affiliation: null,
    biography: null,
    portrait: null,
    profileUrl: null,
  },
];

export const speakers: Speaker[] = [];

export const navigation = [
  { label: "Home", path: "" },
  { label: "Agenda", path: "agenda/" },
  { label: "Organizing Committee", path: "organizing-committee/" },
  { label: "Speakers", path: "speakers/" },
];
