export interface Person {
  name: string;
  initials: string;
  title: string | null;
  academicTitle?: string;
  affiliation: string | null;
  biography: string | null;
  portrait: string | null;
  profileUrl: string | null;
}

export interface Speaker extends Person {
  talkTitle: string | null;
  role: 'Keynote Speaker' | 'Speaker' | 'Panel Discussion';
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
    "The programme is subject to change. The guest of honour and selected-speaker assignments remain subject to confirmation.",
  introduction:
    "SHIFRA brings students, researchers, and invited guests together to explore the intersection of genomics and artificial intelligence. The symposium creates a shared space for scientific exchange across disciplines and career stages.",
  story:
    "Named after the Arabic word for “code”, SHIFRA connects the code of life with the code of computation. Scientific talks and discussions explore how biological insight and computational methods can inform one another.",
  community:
    "Poster presentations and one-minute pitches give emerging researchers a place to share their work and receive feedback. Informal conversations make room for new connections and future collaborations across our growing genomics and AI community.",
  contactEmail: "hala.alsaleh@mbzuai.ac.ae" as string | null,
  banner: {
    image: "images/shifra-banner-wide.webp" as string | null,
    mobileImage: "images/shifra-banner-branded.webp",
    alt: "SHIFRA — UAE Genomics & AI Symposium, with the English and Arabic wordmark over genomics artwork featuring a neural human silhouette, DNA, insects, and a plant",
  },
  poster: {
    image: "images/shifra-poster-v3.webp" as string | null,
    alt: "SHIFRA UAE Genomics and AI Symposium poster, 27 November 2026, 8:30 AM to 4:15 PM, MBZUAI Lecture Halls 1 & 2, with a registration QR code and student organisers Hala Alsaleh and Haotian Tang",
    download: "downloads/SHIFRA_Poster_V3.pdf" as string | null,
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
    title: "Founder",
    academicTitle: "MSc Student · MBZUAI",
    affiliation: null,
    biography: null,
    portrait: "images/committee/hala-alsaleh.webp",
    profileUrl: null,
  },
  {
    name: "Haotian Tang",
    initials: "HT",
    title: "Co-founder",
    academicTitle: "PhD Student · MBZUAI",
    affiliation: null,
    biography: null,
    portrait: "images/committee/haotian-tang.webp",
    profileUrl: null,
  },
  {
    name: "Eduardo Beltrame",
    initials: "EB",
    title: "Director of Education",
    academicTitle: "Assistant Professor",
    affiliation: "MBZUAI",
    biography: null,
    portrait: "images/committee/eduardo-beltrame.webp",
    profileUrl: null,
  },
];

// Speaker roster approved on 23 November; Daniel Sanchez identified on 24 November 2026.
// Shadab Khan and Boulbaba Ben Amor are not speaking.
export const speakers: Speaker[] = [
  {
    name: 'Dr. Shahrukh Hashmi', initials: 'SH', role: 'Keynote Speaker',
    title: 'Director of Research', affiliation: 'Department of Health – Abu Dhabi',
    biography: null, portrait: 'images/speakers/shahrukh-hashmi.webp',
    profileUrl: 'https://www.linkedin.com/in/shahrukh-hashmi-7ba60027/',
    talkTitle: 'The Future of Scientific Research and Precision Medicine in the UAE',
  },
  {
    name: 'Dr. Budour Alkaf', initials: 'BA', role: 'Speaker',
    title: 'Senior Bioinformatician', affiliation: 'M42 Healthcare', biography: null,
    portrait: 'images/speakers/budour-alkaf.jpg',
    profileUrl: 'https://www.linkedin.com/in/budour-alkaf-phd-87aa4284/',
    talkTitle: 'The Emirati Genome Program Enables Population-wide Penetrance Estimation and Novel Discovery for Inherited Retinal Disease',
  },
  {
    name: 'Dr. Shalini Behl', initials: 'SB', role: 'Speaker',
    title: 'Senior Research Scientist', affiliation: 'M42 Healthcare', biography: null,
    portrait: 'images/speakers/shalini-behl.jpg',
    profileUrl: 'https://www.linkedin.com/in/shalini-behl-b30a0b46/',
    talkTitle: 'Cancer Genomics and Genetic Risk Stratification in the United Arab Emirates',
  },
  {
    name: 'Dr. Daniel Sanchez', initials: 'DS', role: 'Speaker',
    title: 'Senior Bioinformatician', affiliation: 'M42 Healthcare', biography: null,
    portrait: 'images/speakers/daniel-sanchez-2026.png',
    profileUrl: 'https://www.linkedin.com/in/daniel-mat%C3%ADas/',
    talkTitle: 'Precision Medicine for Breast Cancer in the UAE: Making Genomic Risk Actionable with AI',
  },
  {
    name: 'Mohammad Amaan Sayeed', initials: 'MS', role: 'Speaker',
    title: null, affiliation: 'Inception42', biography: null,
    portrait: 'images/speakers/mohammad-amaan-sayeed.png',
    profileUrl: 'https://www.linkedin.com/in/mohammad-amaan29/',
    talkTitle: 'From the Emirati Genome to AI-Driven Precision Medicine: The Future of Healthcare in the UAE',
  },
  {
    name: 'Dr. Thyago Cardoso', initials: 'TC', role: 'Speaker',
    title: 'Manager, Commercial Research and Development', affiliation: 'M42 Healthcare', biography: null,
    portrait: 'images/speakers/thyago-cardoso.jpg',
    profileUrl: 'https://www.linkedin.com/in/dr-thyago-cardoso-7181741b3/',
    talkTitle: 'Plant Genome Sequencing to Safeguard Native UAE Species',
  },
  {
    name: 'Hala Alsaleh', initials: 'HA', role: 'Speaker',
    title: 'MSc Student', affiliation: 'MBZUAI', biography: null,
    portrait: 'images/committee/hala-alsaleh.webp', profileUrl: null,
    talkTitle: 'UAE Sports Genomics: A Pioneering Study of Genetic Markers Associated with Athletic Performance, Strength, Endurance, and Injury Risk',
  },
  {
    name: 'Dr. Tania Tahtouh', initials: 'TT', role: 'Speaker',
    title: 'Assistant Professor of Biomedical Sciences', affiliation: 'Abu Dhabi University', biography: null,
    portrait: 'images/speakers/tania-tahtouh.jpg',
    profileUrl: 'https://www.linkedin.com/in/tania-tahtouh-ph-d-fhea-2b5a5826/',
    talkTitle: 'AI-Powered Wellness: Tailored Dietary Support for Chronic Disease Management',
  },
  {
    name: 'Dr. Nancy ElNaker', initials: 'NE', role: 'Speaker',
    title: 'Senior Applied Scientist', affiliation: 'Inception42', biography: null,
    portrait: 'images/speakers/nancy-elnaker-2026.jpg',
    profileUrl: 'https://www.linkedin.com/in/dr-nancy-a-elnaker-phd-6794b450/',
    talkTitle: 'When Plants Become Medicine: From Genetic Engineering to Nanotechnology and AI',
  },
  {
    name: 'Dr. Juliana Ferreira', initials: 'JF', role: 'Speaker',
    title: 'Research Associate', affiliation: 'NYU Abu Dhabi', biography: null,
    portrait: 'images/speakers/juliana-ferreira-original-2026.png',
    profileUrl: 'https://www.linkedin.com/in/juliana-ferreira-6238a7a0/',
    talkTitle: 'Plant Genomics and Biodiversity Research in the UAE',
  },
  {
    name: 'Prof. Mohammed Ghazal', initials: 'MG', role: 'Panel Discussion',
    title: null, affiliation: 'Abu Dhabi University', biography: null,
    portrait: 'images/speakers/mohammed-ghazal.webp',
    profileUrl: 'https://www.linkedin.com/in/mohammed-ghazal-60291475/',
    talkTitle: null,
  },
];
