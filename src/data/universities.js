// University Database for Teacher ID Cards
// Based on student-card-generator data - US schools only for SheerID verification

export const UNIVERSITIES = [
    {
        name: "Pennsylvania State University-Main Campus",
        shortName: "Penn State",
        domain: "psu.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/psu.png",
        color: "#041E42",
        address: "University Park, PA 16802, USA",
        departments: ["Computer Science", "Engineering", "Business", "Education", "Agriculture"]
    },
    {
        name: "Massachusetts Institute of Technology",
        shortName: "MIT",
        domain: "mit.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/mit_official.svg",
        color: "#A31F34",
        address: "77 Massachusetts Ave, Cambridge, MA 02139, USA",
        departments: ["Computer Science", "Mechanical Engineering", "Physics", "Mathematics", "Electrical Engineering"]
    },
    {
        name: "Harvard University",
        shortName: "Harvard",
        domain: "harvard.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/harvard.svg",
        color: "#A51C30",
        address: "Cambridge, MA 02138, USA",
        departments: ["Law", "Medicine", "Business", "Political Science", "Economics"]
    },
    {
        name: "Stanford University",
        shortName: "Stanford",
        domain: "stanford.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/stanford.svg",
        color: "#8C1515",
        address: "450 Serra Mall, Stanford, CA 94305, USA",
        departments: ["Computer Science", "Engineering", "Business", "Law", "Medicine"]
    },
    {
        name: "University of California, Berkeley",
        shortName: "UC Berkeley",
        domain: "berkeley.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/berkeley.svg",
        color: "#003262",
        address: "Berkeley, CA 94720, USA",
        departments: ["Computer Science", "Economics", "Engineering", "Business", "Political Science"]
    },
    {
        name: "Yale University",
        shortName: "Yale",
        domain: "yale.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/yale.svg",
        color: "#00356B",
        address: "New Haven, CT 06520, USA",
        departments: ["Law", "History", "Economics", "Political Science", "Psychology"]
    },
    {
        name: "Princeton University",
        shortName: "Princeton",
        domain: "princeton.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/princeton.png",
        color: "#FF6600",
        address: "Princeton, NJ 08544, USA",
        departments: ["Mathematics", "Physics", "Economics", "Computer Science", "Public Policy"]
    },
    {
        name: "Columbia University",
        shortName: "Columbia",
        domain: "columbia.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/columbia.png",
        color: "#B9D9EB",
        address: "116th St & Broadway, New York, NY 10027, USA",
        departments: ["Business", "Law", "Journalism", "Medicine", "International Relations"]
    },
    {
        name: "New York University",
        shortName: "NYU",
        domain: "nyu.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/nyu.png",
        color: "#57068C",
        address: "70 Washington Square S, New York, NY 10012, USA",
        departments: ["Business", "Film", "Law", "Arts", "Media"]
    },
    {
        name: "University of California, Los Angeles",
        shortName: "UCLA",
        domain: "ucla.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/ucla.png",
        color: "#2774AE",
        address: "Los Angeles, CA 90095, USA",
        departments: ["Film", "Business", "Engineering", "Medicine", "Psychology"]
    },
    {
        name: "University of Chicago",
        shortName: "UChicago",
        domain: "uchicago.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/uchicago.png",
        color: "#800000",
        address: "5801 S Ellis Ave, Chicago, IL 60637, USA",
        departments: ["Economics", "Law", "Business", "Physics", "Political Science"]
    },
    {
        name: "Duke University",
        shortName: "Duke",
        domain: "duke.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/duke.png",
        color: "#003087",
        address: "Durham, NC 27708, USA",
        departments: ["Medicine", "Business", "Law", "Engineering", "Public Policy"]
    },
    {
        name: "Cornell University",
        shortName: "Cornell",
        domain: "cornell.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/cornell.png",
        color: "#B31B1B",
        address: "Ithaca, NY 14850, USA",
        departments: ["Engineering", "Hotel Administration", "Agriculture", "Business", "Computer Science"]
    },
    {
        name: "Northwestern University",
        shortName: "Northwestern",
        domain: "northwestern.edu",
        logo: "https://thanhnguyxn.github.io/student-card-generator/img/logos/northwestern.png",
        color: "#4E2A84",
        address: "Evanston, IL 60208, USA",
        departments: ["Journalism", "Business", "Engineering", "Law", "Medicine"]
    }
];

// Get random university
export function getRandomUniversity() {
    return UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
}

// Get university by index (for deterministic selection based on hash)
export function getUniversityByIndex(index) {
    return UNIVERSITIES[index % UNIVERSITIES.length];
}

// Get university by name
export function getUniversityByName(name) {
    return UNIVERSITIES.find(u => u.name === name || u.shortName === name) || UNIVERSITIES[0];
}

// Get university index from hash (deterministic based on name)
export function getUniversityFromHash(hashString) {
    const hash = hashString.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return UNIVERSITIES[hash % UNIVERSITIES.length];
}

export default UNIVERSITIES;
