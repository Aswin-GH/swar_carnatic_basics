/**
 * Canonical, UI-agnostic curriculum records. The canvas, audio engine and
 * future print/PWA views all consume these same lesson rows.
 */

const rows = (notation) => notation.trim().split("\n").map((line) => line.trim()).filter(Boolean);
const laghuActions = ["Clap", "Little", "Ring", "Middle", "Index", "Little", "Ring", "Middle", "Index"];
const tala = (name, tamilName, jati, angas) => ({
  name,
  tamilName,
  jati,
  angas,
  beats: angas.reduce((sum, anga) => sum + anga.beats, 0),
  groups: angas.map((anga) => anga.beats),
  groupNames: angas.map((anga) => anga.name),
  actions: angas.flatMap((anga) => {
    if (anga.type === "laghu") return laghuActions.slice(0, anga.beats);
    if (anga.type === "drutam") return ["Clap", "Wave"];
    return ["Clap"];
  })
});
const laghu = (beats) => ({ type: "laghu", name: "Laghu", symbol: "|", beats });
const drutam = { type: "drutam", name: "Drutam", symbol: "O", beats: 2 };
const anudrutam = { type: "anudrutam", name: "Anudrutam", symbol: "U", beats: 1 };
const common = {
  authorId: "swar",
  schoolTracks: ["shared-core", "tamil", "karnataka"],
  ragaId: "mayamalavagowla",
  talaId: "adi",
  speeds: [1, 2, 4],
  scope: "core",
  sourceIds: ["tnjmfau-vocal-grades", "karnataka-examinations", "karnatik-beginners"]
};

const lesson = (sectionId, sequence, title, tamilTitle, description, notation, overrides = {}) => ({
  id: `${sectionId}-${String(sequence).padStart(2, "0")}`,
  sectionId, sequence, title, tamilTitle, description, ...common, ...overrides,
  notation: rows(notation).map((swaras, index) => ({
    id: `${sectionId}-${String(sequence).padStart(2, "0")}-line-${index + 1}`,
    label: `Line ${index + 1}`,
    tamilLabel: `வரி ${index + 1}`,
    swaras
  }))
});

export const CURRICULUM_DB = {
  schemaVersion: 1,
  authors: {
    swar: { id: "swar", name: "Swar", tagline: "Music and More", role: "Curriculum author", logo: "./assets/swar-author.png" }
  },
  sources: {
    "tnjmfau-vocal-grades": {
      id: "tnjmfau-vocal-grades",
      title: "Carnatic Music Vocal Grade Examination Syllabus",
      publisher: "Tamil Nadu Dr. J. Jayalalithaa Music and Fine Arts University",
      url: "https://www.tnjjmfau.in/images/syllabus/Off_Campus/Grades/Vocal.pdf",
      role: "Scope: 14 Sarali, 9 Janta and 5 Melsthayi varisais in three speeds"
    },
    "karnataka-examinations": {
      id: "karnataka-examinations",
      title: "Karnataka Sangita Samvardhana examination syllabus",
      publisher: "World Music Conservatory",
      url: "https://wmc.net.in/Exam_Registration_Form/examination-form.html",
      role: "Karnataka-school terminology and foundation sequence"
    },
    "karnatik-beginners": {
      id: "karnatik-beginners",
      title: "Beginners' Lessons Notation",
      publisher: "karnATik",
      url: "https://www.karnatik.com/beginners.pdf",
      role: "Notation reference; teacher/pathāntaram review remains authoritative"
    }
  },
  schoolTracks: {
    "shared-core": { name: "Shared foundation", tamilName: "பொதுவான அடித்தளம்" },
    tamil: { name: "Tamil learning path", tamilName: "தமிழ் கற்றல் முறை" },
    karnataka: { name: "Karnataka learning path", tamilName: "கர்நாடக கற்றல் முறை" }
  },
  ragas: {
    mayamalavagowla: { name: "Māyāmāḷavagowla", tamilName: "மாயாமாளவகௌள", intervals: { S: 0, R: 1, G: 4, M: 5, P: 7, D: 8, N: 11 }, swaras: "S R₁ G₃ M₁ P D₁ N₃ S" },
    shankarabharanam: { name: "Śaṅkarābharaṇam", tamilName: "சங்கராபரணம்", intervals: { S: 0, R: 2, G: 4, M: 5, P: 7, D: 9, N: 11 }, swaras: "S R₂ G₃ M₁ P D₂ N₃ S" },
    kharaharapriya: { name: "Kharaharapriya", tamilName: "கரஹரப்ரியா", intervals: { S: 0, R: 2, G: 3, M: 5, P: 7, D: 9, N: 10 }, swaras: "S R₂ G₂ M₁ P D₂ N₂ S" },
    kalyani: { name: "Kalyāṇi", tamilName: "கல்யாணி", intervals: { S: 0, R: 2, G: 4, M: 6, P: 7, D: 9, N: 11 }, swaras: "S R₂ G₃ M₂ P D₂ N₃ S" }
  },
  talas: {
    adi: tala("Ādi", "ஆதி", "Chaturasra", [laghu(4), drutam, drutam]),
    "dhruva-c4": tala("Chaturasra-jāti Dhruva", "சதுஸ்ர ஜாதி துருவ", "Chaturasra", [laghu(4), drutam, laghu(4), laghu(4)]),
    "matya-c4": tala("Chaturasra-jāti Matya", "சதுஸ்ர ஜாதி மத்ய", "Chaturasra", [laghu(4), drutam, laghu(4)]),
    "rupaka-c4": tala("Chaturasra-jāti Rupaka", "சதுஸ்ர ஜாதி ரூபக", "Chaturasra", [drutam, laghu(4)]),
    "jhampa-misra": tala("Misra-jāti Jhampa", "மிஸ்ர ஜாதி ஜம்ப", "Misra", [laghu(7), anudrutam, drutam]),
    "triputa-tisra": tala("Tisra-jāti Triputa", "திஸ்ர ஜாதி திரிபுட", "Tisra", [laghu(3), drutam, drutam]),
    "ata-khanda": tala("Khanda-jāti Ata", "கண்ட ஜாதி அட", "Khanda", [laghu(5), laghu(5), drutam, drutam]),
    "eka-c4": tala("Chaturasra-jāti Eka", "சதுஸ்ர ஜாதி ஏக", "Chaturasra", [laghu(4)])
  },
  sections: [
    { id: "sarali", order: 1, title: "Sarali varisai", tamilTitle: "சரளி வரிசை", description: "Simple ascending and descending swara patterns" },
    { id: "janta", order: 2, title: "Janta varisai", tamilTitle: "ஜண்டை வரிசை", description: "Paired swaras for clarity and strength" },
    { id: "sthaayi", order: 3, title: "Melsthayi varisai", tamilTitle: "மேல்ஸ்தாயி வரிசை", description: "Upper-octave reach and return" },
    { id: "dhatu", order: 4, title: "Dhatu varisai", tamilTitle: "தாட்டு வரிசை", description: "Skipping and crossing swara patterns" },
    { id: "keezh-sthaayi", order: 5, title: "Keezh / Mandra sthayi", tamilTitle: "கீழ்ஸ்தாயி வரிசை", description: "Lower-octave reach and return" },
    { id: "alankaram", order: 6, title: "Alankarams", tamilTitle: "அலங்காரங்கள்", description: "Patterns through the sapta tāḷas" },
    { id: "geetham", order: 7, title: "Geethams", tamilTitle: "கீதங்கள்", description: "Simple melodies with swara and sāhitya", status: "next" }
  ],
  lessons: [
    lesson("sarali", 1, "The complete scale", "முழு ஸ்வர வரிசை", "A clear ascent and descent through the octave.", `
      s r g m | p d | n S ||
      S n d p | m g | r s ||`),
    lesson("sarali", 2, "Return to Sa", "ஸ-விற்குத் திரும்புதல்", "Two-swara turns return gently to the tonic.", `
      s r - s r - | s r | g m ||
      s r g m | p d | n S ||
      S n - S n - | S n | d p ||
      S n d p | m g | r s ||`),
    lesson("sarali", 3, "Three-note turns", "மூன்று ஸ்வரச் சுற்றுகள்", "Three neighbouring swaras form each turn.", `
      s r g - s | r g - | s r ||
      s r g m | p d | n S ||
      S n d - S | n d - | S n ||
      S n d p | m g | r s ||`),
    lesson("sarali", 4, "Four-note turns", "நான்கு ஸ்வரச் சுற்றுகள்", "Four-swara phrases settle into the scale.", `
      s r g m - | s r | g m - ||
      s r g m | p d | n S ||
      S n d p - | S n | d p - ||
      S n d p | m g | r s ||`),
    lesson("sarali", 5, "Rest on Pa and Ma", "ப மற்றும் ம-வில் நீட்டல்", "Held notes introduce spacious phrasing.", `
      s r g m | p , | s r ||
      s r g m | p d | n S ||
      S n d p | m , | S n ||
      S n d p | m g | r s ||`),
    lesson("sarali", 6, "Reach Dha", "த வரை செல்லுதல்", "The phrase reaches Dha before returning.", `
      s r g m | p d - | s r ||
      s r g m | p d | n S ||
      S n d p | m g - | S n ||
      S n d p | m g | r s ||`),
    lesson("sarali", 7, "Rest on Ni and Ri", "நி மற்றும் ரி-வில் நீட்டல்", "A measured pause completes the first sequence family.", `
      s r g m | p d | n , ||
      s r g m | p d | n S ||
      S n d p | m g | r , ||
      S n d p | m g | r s ||`),
    lesson("sarali", 8, "Turn around Pa", "ப-வைச் சுற்றி திரும்புதல்", "A compact descending turn sits inside the ascent.", `
      s r g m | p m | g r ||
      s r g m | p d | n S ||
      S n d p | m p | d n ||
      S n d p | m g | r s ||`),
    lesson("sarali", 9, "Crossing turns", "கடக்கும் ஸ்வரச் சுற்றுகள்", "Neighbouring turns begin to cross the scale.", `
      s r g m | p m | d p ||
      s r g m | p d | n S ||
      S n d p | m p | g m ||
      S n d p | m g | r s ||`),
    lesson("sarali", 10, "The Pa centre", "ப மையம்", "Pa becomes a calm centre for a longer phrase.", `
      s r g m | p , | g m ||
      p , , , | p , | , , ||
      g m p d | n d | p m ||
      g m p - g | m g | r s ||`),
    lesson("sarali", 11, "Upper Sa descent", "மேல் ஸ-விலிருந்து இறங்குதல்", "A descending opening joins the familiar return.", `
      S , n d | n , | d p ||
      d , p m | p , | p , ||
      g m p d | n d | p m ||
      g m p - g | m g | r s ||`),
    lesson("sarali", 12, "Repeated upper notes", "மேல் ஸ்வர இரட்டிப்புகள்", "Repeated swaras add clarity to the descent.", `
      S S n d | n n | d p ||
      d d p m | p , | p , ||
      g m p d | n d | p m ||
      g m p - g | m g | r s ||`),
    lesson("sarali", 13, "Curved movement", "வளைந்த ஸ்வர இயக்கம்", "Turning shapes prepare the ear for wider movement.", `
      s r g r | g , | g m ||
      p m p , | d p | d , ||
      m p d p | d n | d p ||
      m p d p | m g | r s ||`),
    lesson("sarali", 14, "Balanced cadence", "சமநிலை நிறைவு", "Held and repeated swaras close the Sarali set.", `
      s r g m | p , | p , ||
      d d p , | m m | p , ||
      d n S , | S n | d p ||
      S n d p | m g | r s ||`),

    lesson("janta", 1, "Double every swara", "ஒவ்வொரு ஸ்வரமும் இருமுறை", "Paired swaras rise steadily to upper Sa.", `
      s s r r | g g | m m ||
      p p d d | n n | S S ||`),
    lesson("janta", 2, "Pairs in motion", "நகரும் இரட்டை ஸ்வரங்கள்", "Each paired group begins one step higher, then returns.", `
      s s r r | g g | m m ||
      r r g g | m m | p p ||
      g g m m | p p | d d ||
      m m p p | d d | n n ||
      p p d d | n n | S S ||
      S S n n | d d | p p ||
      n n d d | p p | m m ||
      d d p p | m m | g g ||
      p p m m | g g | r r ||
      m m g g | r r | s s ||`),
    lesson("janta", 3, "Turn and continue", "திரும்பி தொடருதல்", "Every step briefly turns before moving onward.", `
      s s r r | g g | r r ||
      s s r r | g g | m m ||
      r r g g | m m | g g ||
      r r g g | m m | p p ||
      g g m m | p p | m m ||
      g g m m | p p | d d ||
      m m p p | d d | p p ||
      m m p p | d d | n n ||
      p p d d | n n | d d ||
      p p d d | n n | S S ||
      S S n n | d d | n n ||
      S S n n | d d | p p ||
      n n d d | p p | d d ||
      n n d d | p p | m m ||
      d d p p | m m | p p ||
      d d p p | m m | g g ||
      p p m m | g g | m m ||
      p p m m | g g | r r ||
      m m g g | r r | g g ||
      m m g g | r r | s s ||`),
    lesson("janta", 4, "Anchored pairs", "நிலைபெற்ற இரட்டைகள்", "A held anchor introduces each moving pair.", `
      s s r - s | s r | s r ||
      s s r r | g g | m m ||
      r r g - r | r g | r g ||
      r r g g | m m | p p ||
      g g m - g | g m | g m ||
      g g m m | p p | d d ||
      m m p - m | m p | m p ||
      m m p p | d d | n n ||
      p p d - p | p d | p d ||
      p p d d | n n | S S ||
      S S n - S | S n | S n ||
      S S n n | d d | p p ||
      n n d - n | n d | n d ||
      n n d d | p p | m m ||
      d d p - d | d p | d p ||
      d d p p | m m | g g ||
      p p m - p | p m | p m ||
      p p m m | g g | r r ||
      m m g - m | m g | m g ||
      m m g g | r r | s s ||`),
    lesson("janta", 5, "Leap and answer", "தாவலும் பதிலும்", "Each repeated group opens into a short answering turn.", `
      s s r r | g - s | r g ||
      s s r r | g g | m m ||
      r r g g | m - r | g m ||
      r r g g | m m | p p ||
      g g m m | p - g | m p ||
      g g m m | p p | d d ||
      m m p p | d - m | p d ||
      m m p p | d d | n n ||
      p p d d | n - p | d n ||
      p p d d | n n | S S ||
      S S n n | d - S | n d ||
      S S n n | d d | p p ||
      n n d d | p - n | d p ||
      n n d d | p p | m m ||
      d d p p | m - d | p m ||
      d d p p | m m | g g ||
      p p m m | g - p | m g ||
      p p m m | g g | r r ||
      m m g g | r - m | g r ||
      m m g g | r r | s s ||`),
    lesson("janta", 6, "Pairs with space", "இடைவெளியுள்ள இரட்டைகள்", "Held notes make the repeated swaras more spacious.", `
      s s , r | r , | g g ||
      s s r r | g g | m m ||
      r r , g | g , | m m ||
      r r g g | m m | p p ||
      g g , m | m , | p p ||
      g g m m | p p | d d ||
      m m , p | p , | d d ||
      m m p p | d d | n n ||
      p p , d | d , | n n ||
      p p d d | n n | S S ||
      S S , n | n , | d d ||
      S S n n | d d | p p ||
      n n , d | d , | p p ||
      n n d d | p p | m m ||
      d d , p | p , | m m ||
      d d p p | m m | g g ||
      p p , m | m , | g g ||
      p p m m | g g | r r ||
      m m , g | g , | r r ||
      m m g g | r r | s s ||`),
    lesson("janta", 7, "Offset pairs", "இடம்மாறிய இரட்டைகள்", "The pair shifts across the beat before resolving.", `
      s , s r | , r | g g ||
      s s r r | g g | m m ||
      r , r g | , g | m m ||
      r r g g | m m | p p ||
      g , g m | , m | p p ||
      g g m m | p p | d d ||
      m , m p | , p | d d ||
      m m p p | d d | n n ||
      p , p d | , d | n n ||
      p p d d | n n | S S ||
      S , S n | , n | d d ||
      S S n n | d d | p p ||
      n , n d | , d | p p ||
      n n d d | p p | m m ||
      d , d p | , p | m m ||
      d d p p | m m | g g ||
      p , p m | , m | g g ||
      p p m m | g g | r r ||
      m , m g | , g | r r ||
      m m g g | r r | s s ||`),
    lesson("janta", 8, "Triple lead-in", "மூன்று ஸ்வரத் தொடக்கம்", "Three repeated notes lead into each paired phrase.", `
      s s s r | r r | g g ||
      s s r r | g g | m m ||
      r r r g | g g | m m ||
      r r g g | m m | p p ||
      g g g m | m m | p p ||
      g g m m | p p | d d ||
      m m m p | p p | d d ||
      m m p p | d d | n n ||
      p p p d | d d | n n ||
      p p d d | n n | S S ||
      S S S n | n n | d d ||
      S S n n | d d | p p ||
      n n n d | d d | p p ||
      n n d d | p p | m m ||
      d d d p | p p | m m ||
      d d p p | m m | g g ||
      p p p m | m m | g g ||
      p p m m | g g | r r ||
      m m m g | g g | r r ||
      m m g g | r r | s s ||`),
    lesson("janta", 9, "Open and return", "திறந்து திரும்புதல்", "A spacious opening gesture answers each paired line.", `
      s , r g | , - s | r g ||
      s s r r | g g | m m ||
      r , g m | , - r | g m ||
      r r g g | m m | p p ||
      g , m p | , - g | m p ||
      g g m m | p p | d d ||
      m , p d | , - m | p d ||
      m m p p | d d | n n ||
      p , d n | , - p | d n ||
      p p d d | n n | S S ||
      S , n d | , - S | n d ||
      S S n n | d d | p p ||
      n , d p | , - n | d p ||
      n n d d | p p | m m ||
      d , p m | , - d | p m ||
      d d p p | m m | g g ||
      p , m g | , - p | m g ||
      p p m m | g g | r r ||
      m , g r | , - m | g r ||
      m m g g | r r | s s ||`),

    lesson("sthaayi", 1, "Meet upper Ri", "மேல் ரி அறிமுகம்", "Rise through upper Sa to Ri, then return steadily.", `
      s r g m | p d | n S ||
      S , , , | S , | , , ||
      d n S R | S n | d p ||
      S n d p | m g | r s ||`),
    lesson("sthaayi", 2, "Turn around upper Ri", "மேல் ரி சுற்று", "Upper Sa and Ri form the first extended turn.", `
      s r g m | p d | n S ||
      S , , , | S , | , , ||
      d n S R | S S | R S ||
      S R - S n | d p | m p ||
      d n S R | S n | d p ||
      S n d p | m g | r s ||`),
    lesson("sthaayi", 3, "Reach upper Ga", "மேல் க வரை செல்லுதல்", "The upper-octave phrase expands through Ga.", `
      s r g m | p d | n S ||
      S , , , | S , | , , ||
      d n S R | G R | S R ||
      S R - S n | d p | m p ||
      d n S R | S S | R S ||
      S R - S n | d p | m p ||
      d n S R | S n | d p ||
      S n d p | m g | r s ||`),
    lesson("sthaayi", 4, "Reach upper Ma", "மேல் ம வரை செல்லுதல்", "The sequence climbs one step further to upper Ma.", `
      s r g m | p d | n S ||
      S , , , | S , | , , ||
      d n S R | G M | G R ||
      S R - S n | d p | m p ||
      d n S R | G R | S R ||
      S R - S n | d p | m p ||
      d n S R | S S | R S ||
      S R - S n | d p | m p ||
      d n S R | S n | d p ||
      S n d p | m g | r s ||`),
    lesson("sthaayi", 5, "Reach upper Pa", "மேல் ப வரை செல்லுதல்", "Complete the set by reaching upper Pa and returning home.", `
      s r g m | p d | n S ||
      S , , , | S , | , , ||
      d n S R | G M | P M ||
      G R - S n | d p | m p ||
      d n S R | G M | G R ||
      S R - S n | d p | m p ||
      d n S R | G R | S R ||
      S R - S n | d p | m p ||
      d n S R | S S | R S ||
      S R - S n | d p | m p ||
      d n S R | S n | d p ||
      S n d p | m g | r s ||`),

    lesson("dhatu", 1, "Wide double-note leaps", "தாவும் இரட்டை ஸ்வரங்கள்", "Paired swaras skip outward, then answer with a steady line.", `
      s s m m | r r | g g ||
      s s r r | g g | m m ||
      r r p p | g g | m m ||
      r r g g | m m | p p ||
      g g d d | m m | p p ||
      g g m m | p p | d d ||
      m m n n | p p | d d ||
      m m p p | d d | n n ||
      p p S S | d d | n n ||
      p p d d | n n | S S ||
      S S p p | n n | d d ||
      S S n n | d d | p p ||
      n n m m | d d | p p ||
      n n d d | p p | m m ||
      d d g g | p p | m m ||
      d d p p | m m | g g ||
      p p r r | m m | g g ||
      p p m m | g g | r r ||
      m m s s | g g | r r ||
      m m g g | r r | s s ||`),
    lesson("dhatu", 2, "Interlocking turns", "பின்னிய ஸ்வரச் சுற்றுகள்", "Crossing four-note shapes move up and down the octave.", `
      s m g m | r g | s r ||
      s g r g | s r | g m ||
      r p m p | g m | r g ||
      r m g m | r g | m p ||
      g d p d | m p | g m ||
      g p m p | g m | p d ||
      m n d n | p d | m p ||
      m d p d | m p | d n ||
      p S n S | d n | p d ||
      p n d n | p d | n S ||
      S p d p | n d | S n ||
      S d n d | S n | d p ||
      n m p m | d p | n d ||
      n p d p | n d | p m ||
      d g m g | p m | d p ||
      d m p m | d p | m g ||
      p r g r | m g | p m ||
      p g m g | p m | g r ||
      m s r s | g r | m g ||
      m r g r | m g | r s ||`),
    lesson("dhatu", 3, "Extended crossing sequence", "விரிவான தாட்டு வரிசை", "An extended reference sequence with tighter crossing motion.", `
      s r s g | r g | r m ||
      s m g r | s r | g m ||
      r g r m | g m | g p ||
      r p m g | r g | m p ||
      g m g p | m p | m d ||
      g d p m | g m | p d ||
      m p m d | p d | p n ||
      m n d p | m p | d n ||
      p d p n | d n | d S ||
      p S n d | p d | n S ||
      S n S d | n d | n p ||
      S p d n | S n | d p ||
      n d n p | d p | d m ||
      n m p d | n d | p m ||
      d p d m | p m | p g ||
      d g m p | d p | m g ||
      p m p g | m g | m r ||
      p r g m | p m | g r ||
      m g m r | g r | g s ||
      m s r g | m g | r s ||`, {
        scope: "extended",
        sourceIds: ["karnatik-beginners"]
      }),

    lesson("keezh-sthaayi", 1, "Touch lower Ni", "கீழ் நி அறிமுகம்", "Descend gently below Sa to lower Ni, then return through the middle octave.", `
      S n d p | m g | r s ||
      s , , , | s , | , , ||
      g r s n. | s r | g m ||
      s r g m | p d | n S ||`),
    lesson("keezh-sthaayi", 2, "Turn around lower Ni", "கீழ் நி சுற்று", "A short turn steadies the voice around lower Ni and middle Sa.", `
      S n d p | m g | r s ||
      s , , , | s , | , , ||
      g r s n. | s s | n. s ||
      s n. s r | g m | p m ||
      g r s n. | s r | g m ||
      s r g m | p d | n S ||`),
    lesson("keezh-sthaayi", 3, "Reach lower Dha", "கீழ் த வரை", "Extend the same balanced pattern down to lower Dha.", `
      S n d p | m g | r s ||
      s , , , | s , | , , ||
      g r s n. | d n. | s n. ||
      s n. s r | g m | p m ||
      g r s n. | s s | n. s ||
      s n. s r | g m | p m ||
      g r s n. | s r | g m ||
      s r g m | p d | n S ||`),
    lesson("keezh-sthaayi", 4, "Reach lower Pa", "கீழ் ப வரை", "Travel down to lower Pa and climb back without breaking the line.", `
      S n d p | m g | r s ||
      s , , , | s , | , , ||
      g r s n. | d p. | d n. ||
      s n. s r | g m | p m ||
      g r s n. | d n. | s n. ||
      s n. s r | g m | p m ||
      g r s n. | s s | n. s ||
      s n. s r | g m | p m ||
      g r s n. | s r | g m ||
      s r g m | p d | n S ||`),
    lesson("keezh-sthaayi", 5, "Reach lower Ma", "கீழ் ம வரை", "Complete the lower-octave set by reaching lower Ma and returning to upper Sa.", `
      S n d p | m g | r s ||
      s , , , | s , | , , ||
      g r s n. | d p. | m. p. ||
      d n. s r | g m | p m ||
      g r s n. | d p. | d n. ||
      s n. s r | g m | p m ||
      g r s n. | d n. | s n. ||
      s n. s r | g m | p m ||
      g r s n. | s s | n. s ||
      s n. s r | g m | p m ||
      g r s n. | s r | g m ||
      s r g m | p d | n S ||`),

    lesson("alankaram", 1, "Dhruva tāḷa", "துருவ தாளம்", "Fourteen beats shaped as laghu, drutam, laghu, laghu.", `
      s r g m | g r | s r g r | s r g m ||
      r g m p | m g | r g m g | r g m p ||
      g m p d | p m | g m p m | g m p d ||
      m p d n | d p | m p d p | m p d n ||
      p d n S | n d | p d n d | p d n S ||
      S n d p | d n | S n d n | S n d p ||
      n d p m | p d | n d p d | n d p m ||
      d p m g | m p | d p m p | d p m g ||
      p m g r | g m | p m g m | p m g r ||
      m g r s | r g | m g r g | m g r s ||`, { talaId: "dhruva-c4" }),
    lesson("alankaram", 2, "Matya tāḷa", "மத்ய தாளம்", "Ten beats shaped as laghu, drutam, laghu.", `
      s r g r | s r | s r g m ||
      r g m g | r g | r g m p ||
      g m p m | g m | g m p d ||
      m p d p | m p | m p d n ||
      p d n d | p d | p d n S ||
      S n d n | S n | S n d p ||
      n d p d | n d | n d p m ||
      d p m p | d p | d p m g ||
      p m g m | p m | p m g r ||
      m g r g | m g | m g r s ||`, { talaId: "matya-c4" }),
    lesson("alankaram", 3, "Rupaka tāḷa", "ரூபக தாளம்", "Six beats shaped as drutam followed by laghu.", `
      s r | s r g m ||
      r g | r g m p ||
      g m | g m p d ||
      m p | m p d n ||
      p d | p d n S ||
      S n | S n d p ||
      n d | n d p m ||
      d p | d p m g ||
      p m | p m g r ||
      m g | m g r s ||`, { talaId: "rupaka-c4" }),
    lesson("alankaram", 4, "Misra Jhampa tāḷa", "மிஸ்ர ஜம்ப தாளம்", "Ten beats shaped as a seven-count laghu, anudrutam and drutam.", `
      s r g s r s r | g | m , ||
      r g m r g r g | m | p , ||
      g m p g m g m | p | d , ||
      m p d m p m p | d | n , ||
      p d n p d p d | n | S , ||
      S n d S n S n | d | p , ||
      n d p n d n d | p | m , ||
      d p m d p d p | m | g , ||
      p m g p m p m | g | r , ||
      m g r m g m g | r | s , ||`, { talaId: "jhampa-misra" }),
    lesson("alankaram", 5, "Tisra Triputa tāḷa", "திஸ்ர திரிபுட தாளம்", "Seven beats shaped as a three-count laghu and two drutams.", `
      s r g | s r | g m ||
      r g m | r g | m p ||
      g m p | g m | p d ||
      m p d | m p | d n ||
      p d n | p d | n S ||
      S n d | S n | d p ||
      n d p | n d | p m ||
      d p m | d p | m g ||
      p m g | p m | g r ||
      m g r | m g | r s ||`, { talaId: "triputa-tisra" }),
    lesson("alankaram", 6, "Khanda Ata tāḷa", "கண்ட அட தாளம்", "Fourteen beats shaped as two five-count laghus and two drutams.", `
      s r , g , | s , r g , | m , | m , ||
      r g , m , | r , g m , | p , | p , ||
      g m , p , | g , m p , | d , | d , ||
      m p , d , | m , p d , | n , | n , ||
      p d , n , | p , d n , | S , | S , ||
      S n , d , | S , n d , | p , | p , ||
      n d , p , | n , d p , | m , | m , ||
      d p , m , | d , p m , | g , | g , ||
      p m , g , | p , m g , | r , | r , ||
      m g , r , | m , g r , | s , | s , ||`, { talaId: "ata-khanda" }),
    lesson("alankaram", 7, "Eka tāḷa", "ஏக தாளம்", "A compact four-beat chaturasra laghu.", `
      s r g m ||
      r g m p ||
      g m p d ||
      m p d n ||
      p d n S ||
      S n d p ||
      n d p m ||
      d p m g ||
      p m g r ||
      m g r s ||`, { talaId: "eka-c4" })
  ]
};
