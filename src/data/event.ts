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
  theme: "UAE Genomics × AI",
  date: "2026-11-27",
  displayDate: "27 November 2026",
  shortDate: "27.11.2026",
  timezone: "Asia/Dubai",
  timezoneLabel: "UAE time (GST, UTC+4)",
  utcOffset: "+04:00",
  venue: "Lecture Hall 1 & 2",
  institution: "Mohamed bin Zayed University of Artificial Intelligence",
  institutionShort: "MBZUAI",
  city: "Abu Dhabi, UAE",
  mapsUrl: "https://maps.app.goo.gl/RiVvrxRdd8ehJdk88",
  mapsEmbedUrl:
    "https://www.google.com/maps?cid=7247490091810667654&output=embed",
  division: "Division of Biological and Life Sciences",
  divisionShort: "BLS",
  programmeStatus: "Symposium programme",
  confirmationNote:
    "The guest of honour and selected-speaker assignments are subject to confirmation.",
  introduction:
    "SHIFRA brings students, researchers, and invited guests together to explore the intersection of genomics and artificial intelligence. The symposium creates a shared space for scientific exchange across disciplines and career stages.",
  story:
    "Named after the Arabic word for “code”, SHIFRA connects the code of life with the code of computation. Scientific talks and discussions explore how biological insight and computational methods can inform one another.",
  community:
    "Poster presentations and one-minute pitches give emerging researchers a place to share their work and receive feedback. Informal conversations make room for new connections and future collaborations across our growing genomics and AI community.",
  contactEmail: "hala.alsaleh@mbzuai.ac.ae" as string | null,
  banner: {
    image: "images/shifra-banner.webp" as string | null,
    alt: "Genomics and AI artwork featuring a neural human silhouette, DNA, insects, and a plant",
  },
  poster: {
    image: "images/shifra-poster.webp" as string | null,
    alt: "SHIFRA UAE Genomics and AI Symposium poster, 27 November 2026 at Mohamed bin Zayed University of Artificial Intelligence",
    download: "downloads/SHIFRA_Poster.pdf" as string | null,
  },
  acknowledgement: [
    "We are grateful to Eduardo Beltrame for his all-round support of SHIFRA.",
    "We also thank our speakers and the BLS administrative team for their contributions and help in bringing the symposium together.",
  ],
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

export const speakers: Speaker[] = [
  { name: "Dr. Shahrukh Hashmi", initials: "SH", title: "Director of Research", affiliation: "Department of Health – Abu Dhabi", talkTitle: "The Future of Scientific Research and Precision Medicine in the UAE", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Shadab Khan", initials: "SK", title: "Senior Scientist", affiliation: "ADIA Lab", talkTitle: "From the Emirati Genome to AI-Driven Precision Medicine: The Future of Healthcare in the UAE", biography: null, portrait: null, profileUrl: null },
  { name: "Hala Alsaleh", initials: "HA", title: "Master’s Student; Former Research Scientist (Genetics), M42", affiliation: "MBZUAI", talkTitle: "UAE Sports Genomics: A Pioneering Study of Genetic Markers Associated with Athletic Performance, Strength, Endurance, and Injury Risk", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Nancy ElNaker", initials: "NE", title: "Senior Applied Scientist", affiliation: "Inception", talkTitle: "When Plants Become Medicine: From Genetic Engineering to Nanotechnology and AI", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Shalini Behl", initials: "SB", title: "Senior Research Scientist", affiliation: "M42", talkTitle: "Cancer Genomics and Genetic Risk Stratification in the United Arab Emirates", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Budour Alkaf", initials: "BA", title: "Senior Bioinformatician", affiliation: "M42", talkTitle: "The Emirati Genome Program Enables Population-wide Penetrance Estimation and Novel Discovery for Inherited Retinal Disease", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Thyago Cardoso", initials: "TC", title: "Manager, Commercial Research and Development", affiliation: "M42", talkTitle: "Plant Genome Sequencing to Safeguard Native UAE Species", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Juliana Ferreira", initials: "JF", title: "Research Associate", affiliation: "NYU Abu Dhabi", talkTitle: "Plant Genomics and Biodiversity Research in the UAE", biography: null, portrait: null, profileUrl: null },
  { name: "Dr. Tania Tahtouh", initials: "TT", title: "Assistant Professor of Biomedical Sciences", affiliation: "Abu Dhabi University", talkTitle: "AI-Powered Wellness: Tailored Dietary Support for Chronic Disease Management", biography: null, portrait: null, profileUrl: null },
];
