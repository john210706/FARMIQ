import React, { useState, useEffect, useMemo } from "react";
import {
  Bot, PhoneCall, PlayCircle, Sparkles, Send, ShieldAlert,
  BadgeCheck, X, Tractor, ShieldCheck, Wrench, Sprout, CheckCircle2, Info
} from "lucide-react";
import { machineryData } from "../data/machineryData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Video tutorials static data
const videoTutorialsData = [
  {
    id: "tut-001",
    title: "Tractor Operation & Deep Wet Puddling Masterclass",
    title_ta: "டிராக்டர் இயக்கம் & ஆழமான சேற்று உழவு (Puddling) பயிற்சி",
    category: "tractors",
    duration: "8:45 mins",
    level: "Beginner to Intermediate",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    description: "Step-by-step guide on operating 4WD tractors in wet clay soil during paddy land preparation.",
    description_ta: "நெல் நில தயாரிப்பில் 4WD டிராக்டர்களை களிமண் நிலங்களில் இயக்கும் செயல்முறை வழிகாட்டி.",
    recommendedMachineId: "mach-003",
    steps: [
      "Inspect dual tire pressure (12-14 PSI) and front ballast weights before entering flooded field.",
      "Engage 4WD mode and select Low Range L1/L2 gear for maximum traction and low wheel slip.",
      "Engage differential lock mechanism when traversing deep muddy patches to prevent axle spinning.",
      "Post-operation: Flush mud deposits from lower radiator mesh with clean water spray."
    ],
    steps_ta: [
      "வெள்ளம் சூழ்ந்த வயலுக்குள் நுழைவதற்கு முன் இரட்டை டயர் அழுத்தம் (12-14 PSI) மற்றும் முன் எடைகளை சரிபார்க்கவும்.",
      "அதிக இழுவை மற்றும் குறைந்த சக்கர நழுவலுக்கு 4WD பயன்முறையை இயக்கி, லோ ரேஞ்ச் L1/L2 கியரைத் தேர்ந்தெடுக்கவும்.",
      "ஆழமான சேற்றுப் பகுதிகளில் செல்லும்போது அச்சு சுழல்வதைத் தடுக்க டிஃபெரன்ஷியல் லாக் பொறிமுறையைப் பயன்படுத்தவும்.",
      "வேலை முடிந்த பின்: ரேடியேட்டர் கீழ் வலையில் படிந்துள்ள சேற்றை சுத்தமான நீரால் தெளித்துக் கழுவவும்."
    ],
    safetyNote: "Never disengage clutch on steep field slopes. Ensure PTO safety shield is locked.",
    safetyNote_ta: "செங்குத்தான வயல் சரிவுகளில் கிளட்சை விடுவிக்க வேண்டாம். PTO பாதுகாப்பு கவசம் பூட்டப்பட்டுள்ளதை உறுதிசெய்யவும்."
  },
  {
    id: "tut-002",
    title: "Rotavator Seedbed Calibration & Blade Inspection",
    title_ta: "ரோட்டவேட்டர் உழவு ஆழம் சீரமைப்பு & பிளேட் ஆய்வு",
    category: "tillage",
    duration: "6:30 mins",
    level: "Essential Safety Module",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    description: "Setting 7-foot gear-drive rotavator depth skids and PTO RPM for optimal fine soil tilth.",
    description_ta: "சிறந்த மண் நெகிழ்வுத்தன்மை பெற 7-அடி கியர்-டிரைவ் ரோட்டவேட்டர் ஸ்கிட்களை அமைத்தல்.",
    recommendedMachineId: "mach-004",
    steps: [
      "Align tractor 3-point hitch and attach PTO shaft ensuring spring locking pin clicks in place.",
      "Adjust side depth control skids to 4-6 inch tilling depth based on crop moisture requirement.",
      "Run tractor engine at 1800-2000 RPM to maintain consistent 540 RPM PTO shaft rotation.",
      "Inspect L-shaped boron steel blades for wear; replace worn blades in left/right balanced pairs."
    ],
    steps_ta: [
      "டிராக்டர் 3-பாயிண்ட் ஹிட்சை சீரமைத்து, ஸ்பிரிங் லாக்கிங் பின் பூட்டுவதை உறுதிசெய்து PTO ஷாஃப்ட்டை இணைக்கவும்.",
      "பயிரின் தேவைக்கேற்ப பக்கவாட்டு ஆழக் கட்டுப்பாட்டு ஸ்கிட்களை 4-6 அங்குல உழவு ஆழத்திற்கு அமைக்கவும்.",
      "சீரான 540 RPM PTO சுழற்சியைப் பராமரிக்க டிராக்டர் என்ஜினை 1800-2000 RPM இல் இயக்கவும்.",
      "எல்-வடிவ போரான் ஸ்டீல் பிளேட்களை ஆய்வு செய்யவும்; தேய்ந்த பிளேட்களை இடது/வலது சமநிலையுடன் மாற்றவும்."
    ],
    safetyNote: "Turn off engine and remove ignition key before clearing weeds wrapped around blade rotor.",
    safetyNote_ta: "பிளேட் ரோட்டரில் சுற்றியுள்ள களைகளை அகற்றுவதற்கு முன் என்ஜினை அணைத்து சாப்பியை எடுக்கவும்."
  },
  {
    id: "tut-003",
    title: "Paddy Combine Harvester Zero-Loss Field Setup",
    title_ta: "நெல் கம்பைன் அறுவடை இயந்திரம் - பூஜ்ஜிய சேத அமைப்புகள்",
    category: "harvesters",
    duration: "12:15 mins",
    level: "Advanced Operator Guide",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    description: "Calibrating cutter bar height, threshing drum clearance, and sieve airflow for moist paddy crops.",
    description_ta: "ஈரமான நெல் பயிர்களுக்கு கட்டர் பார் உயரம், கதிரடிக்கும் டிரம் இடைவெளி மற்றும் காற்றோட்டத்தை அமைத்தல்.",
    recommendedMachineId: "mach-005",
    steps: [
      "Set cutter bar height 2-3 inches above waterlogged soil surface to prevent mud ingestion.",
      "Adjust threshing cylinder speed to 700-750 RPM for soft wet paddy grains without cracking.",
      "Set winnowing fan speed and sieve opening for clean grain separation into grain tank.",
      "Engage auto-unloader auger to discharge harvested grain directly into field trolley."
    ],
    steps_ta: [
      "சேறு உறிஞ்சப்படுவதைத் தடுக்க கட்டர் பார் உயரத்தை நிலப்பரப்பிற்கு 2-3 அங்குலம் மேலே அமைக்கவும்.",
      "ஈரமான நெல் மணிகள் உடையாமல் இருக்க கதிரடிக்கும் டிரம்மின் வேகத்தை 700-750 RPM ஆக அமைக்கவும்.",
      "தானிய தொட்டிக்குள் சுத்தமான தானியம் பிரிய விசிறி வேகம் மற்றும் சல்லடை திறப்பை அமைக்கவும்.",
      "அறுவடை செய்யப்பட்ட தானியத்தை டிராலியில் வெளியேற்ற தானியங்கி அன்லோடர் ஆகரை இயக்கவும்."
    ],
    safetyNote: "Keep hands away from cutter bar reel. Maintain 10m safety perimeter around working harvester.",
    safetyNote_ta: "கட்டர் பார் ரீலிலிருந்து கைகளைத் தள்ளியே வைக்கவும். இயங்கும் அறுவடை இயந்திரத்தைச் சுற்றி 10மீ பாதுகாப்பு இடைவெளியைப் பராமரிக்கவும்."
  },
  {
    id: "tut-004",
    title: "Tractor Boom & Drone Spraying Precision Calibration",
    title_ta: "டிராக்டர் பூம் & ட்ரோன் தெளிப்பான் துல்லிய சீரமைப்பு",
    category: "sprayers",
    duration: "7:10 mins",
    level: "Crop Protection Guide",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    description: "Configuring 500L boom sprayers and agricultural drones for uniform pesticide coverage.",
    description_ta: "சீராக பூச்சிக்கொல்லி தெளிக்க 500லி பூம் தெளிப்பான்கள் மற்றும் விவசாய ட்ரோன்களை அமைத்தல்.",
    recommendedMachineId: "mach-012",
    steps: [
      "Inspect 500L poly tank inline suction filter and clean nozzle tip orifice.",
      "Set pressure regulator valve to 3.5 bar for fine droplet atomization across 12m boom width.",
      "Maintain constant tractor ground speed of 4.5 km/h for calculated application rate per acre.",
      "Flush entire pumping system with clean water immediately after completing spray run."
    ],
    steps_ta: [
      "500லி பாலி டேங்க் இன்லைன் வடிகட்டியை ஆய்வு செய்து நாசில் துளையை சுத்தம் செய்யவும்.",
      "12மீ பூம் அகலத்தில் நுண்ணிய சொட்டுத் தெளிப்பு பெற அழுத்த வால்வை 3.5 பாராக அமைக்கவும்.",
      "ஏக்கருக்கு கணக்கிடப்பட்ட தெளிப்பு அளவைப் பெற டிராக்டரை 4.5 கி.மீ/மணி மாறா வேகத்தில் இயக்கவும்.",
      "தெளிப்பு முடிந்தவுடன் உடனடியாக முழு பம்பிங் அமைப்பையும் சுத்தமான நீரால் கழுவவும்."
    ],
    safetyNote: "Wear full protective respirator mask, gloves, and boots during chemical mixing.",
    safetyNote_ta: "வேதிப்பொருட்களைக் கலக்கும்போது பாதுகாப்பு முகமூடி, கையுறைகள் மற்றும் காலணிகளை அணியவும்."
  },
  {
    id: "tut-005",
    title: "Laser Land Leveling for 35% Irrigation Water Savings",
    title_ta: "லேசர் நில சமன்படுத்தி - 35% நீர் சேமிப்பு தொழில்நுட்பம்",
    category: "tillage",
    duration: "9:20 mins",
    level: "Water Conservation Tech",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    description: "Setting up dual transmitter laser levelers to achieve perfectly flat seedbeds in Delta fields.",
    description_ta: "டெல்டா வயல்களில் நிலத்தை கச்சிதமாக சமன்படுத்த இரட்டை டிரான்ஸ்மிட்டர் லேசர் லெவலர்களை அமைத்தல்.",
    recommendedMachineId: "mach-010",
    steps: [
      "Setup rotary laser transmitter on heavy tripod at highest field corner elevation.",
      "Connect hydraulic control box on tractor to laser receiver mast mounted on leveler bucket.",
      "Execute initial high-spot scraper pass followed by dual cross-grid smoothing passes.",
      "Verify field grade variance within ±1 cm tolerance using laser survey rod."
    ],
    steps_ta: [
      "வயலின் மிக உயர்ந்த மூலையில் கனரக முப்போடில் ரோட்டரி லேசர் டிரான்ஸ்மிட்டரை அமைக்கவும்.",
      "டிராக்டரில் உள்ள ஹைட்ராலிக் கட்டுப்பாட்டு பெட்டியை லெவலர் பக்கெட்டில் பொருத்தப்பட்ட லேசர் ரிசீவருடன் இணைக்கவும்.",
      "ஆரம்ப மேடான பகுதிகளை செதுக்கி, பின் குறுக்கு கட்ட உழவு மூலம் சமன்படுத்தவும்.",
      "லேசர் சர்வே ராடைப் பயன்படுத்தி வயலின் சம அளவு ±1 செ.மீ சகிப்புத்தன்மைக்குள் உள்ளதா என சரிபார்க்கவும்."
    ],
    safetyNote: "Avoid looking directly into optical laser transmitter beam.",
    safetyNote_ta: "லேசர் டிரான்ஸ்மிட்டர் ஒளிகற்றையை நேரடியாகப் பார்ப்பதைத் தவிர்க்கவும்."
  },
  {
    id: "tut-006",
    title: "FarmIQ 100% Escrow Protection & Delivery Handover Protocol",
    title_ta: "FarmIQ 100% எஸ்க்ரோ பாதுகாப்பு & ஒப்படைப்பு நடைமுறை",
    category: "safety",
    duration: "4:15 mins",
    level: "Platform Security Guide",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    description: "How your 50% advance token is locked safely in bank escrow until on-farm machine inspection.",
    description_ta: "பண்ணையில் இயந்திர ஆய்வு முடியும் வரை உங்கள் 50% முன்பணம் எவ்வாறு எஸ்க்ரோ கணக்கில் பாதுகாப்பாக வைக்கப்படுகிறது.",
    recommendedMachineId: "mach-001",
    steps: [
      "Lock 50% advance token through UPI/Card/CSC Cash portal into FarmIQ Escrow.",
      "Track live GPS delivery unit as equipment partner arrives at your farm.",
      "Complete 5-point inspection checklist (Engine start, hydraulic lift, PTO rotation, tire wear, leaks).",
      "Approve digital handover code on driver app to release final payment to owner."
    ],
    steps_ta: [
      "UPI/கார்டு மூலம் 50% முன்பணத்தை FarmIQ எஸ்க்ரோ கணக்கில் பூட்டவும்.",
      "உபகரணக் கூட்டாளர் உங்கள் பண்ணைக்கு வரும் வரை நேரலை ஜிபிஎஸ் டிராக்கிங்கைப் பின்தொடரவும்.",
      "5-புள்ளி ஆய்வுப் பட்டியலை (என்ஜின் ஸ்டார்ட், ஹைட்ராலிக் லிப்ட், PTO சுழற்சி, டயர் தேய்மானம், கசிவுகள்) பூர்த்தி செய்யவும்.",
      "உரிமையாளருக்கு இறுதிப் பணத்தை விடுவிக்க டிரைவர் பயன்பாட்டில் டிஜிட்டல் ஒப்படைப்பு குறியீட்டை ஒப்புக்கொள்ளவும்."
    ],
    safetyNote: "If machinery fails inspection checklist, tap 'Request Field Replacement' for 45-min auto dispatch.",
    safetyNote_ta: "இயந்திரம் ஆய்வில் தேர்ச்சியடையாவிட்டால், 45 நிமிட அவசர மாற்றிற்கு 'Request Field Replacement' என்பதைத் தட்டவும்."
  }
];

function getTutorialTitle(tut, lang) {
  if (lang === "ta" && tut.title_ta) return tut.title_ta;
  return tut.title;
}

function getTutorialDesc(tut, lang) {
  if (lang === "ta" && tut.description_ta) return tut.description_ta;
  return tut.description;
}

function getTutorialSafety(tut, lang) {
  if (lang === "ta" && tut.safetyNote_ta) return tut.safetyNote_ta;
  return tut.safetyNote;
}

function getTutorialSteps(tut, lang) {
  if (lang === "ta" && tut.steps_ta) return tut.steps_ta;
  return tut.steps;
}

function matchedMachineName(machineId) {
  const m = machineryData.find(x => x.id === machineId);
  return m ? m.name : "Verified Machinery";
}

/**
 * RICH BOT RESPONSE FORMATTER
 * Parses raw AI text containing bullet sections into structured, beautifully styled JSX cards with custom icons!
 */
export function FormattedBotMessage({ text, navigateTo }) {
  if (!text) return null;

  // 1. Separate DB Machinery section if present
  const dbMarkerRegex = /(?:🌾|🚜)?\s*\*\*(?:DB-Assisted Machinery Availability|Machinery Availability|தரவுத்தள இயந்திர பரிந்துரைகள் \(DB-Assisted\)|டேட்டாபேஸ்|DB-Assisted)\*\*[:\n]*/i;
  
  let mainPart = text;
  let dbPart = "";

  const dbMatch = text.match(dbMarkerRegex);
  if (dbMatch) {
    const splitIndex = dbMatch.index;
    mainPart = text.slice(0, splitIndex).trim();
    dbPart = text.slice(splitIndex + dbMatch[0].length).trim();
  }

  // 2. Parse mainPart into structured blocks
  const lines = mainPart.split("\n");
  const blocks = [];

  const sectionRegex = /^(?:[•\-*]|\d+\.|\#+)?\s*\*\*([^*:]+)\*\*[:\s]+([\s\S]+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(sectionRegex);
    if (match) {
      const title = match[1].trim();
      const content = match[2].trim();
      blocks.push({ type: "card", title, content });
    } else {
      if (/^[•\-*]\s+/.test(line)) {
        const content = line.replace(/^[•\-*]\s+/, "").trim();
        const innerMatch = content.match(/^\*\*([^*:]+)\*\*[:\s]+([\s\S]+)$/);
        if (innerMatch) {
          blocks.push({ type: "card", title: innerMatch[1].trim(), content: innerMatch[2].trim() });
        } else {
          blocks.push({ type: "bullet", content });
        }
      } else {
        blocks.push({ type: "text", content: line });
      }
    }
  }

  const getSectionIcon = (titleStr) => {
    const t = titleStr.toLowerCase();
    if (t.includes("power") || t.includes("drive") || t.includes("hp") || t.includes("டிராக்டர்") || t.includes("குதிரைத்திறன்")) 
      return <Tractor size={18} style={{ color: "#15803D" }} />;
    if (t.includes("gear") || t.includes("transmission") || t.includes("கியர்") || t.includes("hitch")) 
      return <Wrench size={18} style={{ color: "#D97706" }} />;
    if (t.includes("tire") || t.includes("pressure") || t.includes("attachment") || t.includes("டயர்") || t.includes("அழுத்தம்")) 
      return <Info size={18} style={{ color: "#2563EB" }} />;
    if (t.includes("maintenance") || t.includes("post-work") || t.includes("radiator") || t.includes("பராமரிப்பு") || t.includes("சுத்தம்")) 
      return <CheckCircle2 size={18} style={{ color: "#059669" }} />;
    if (t.includes("symptoms") || t.includes("chemical") || t.includes("pest") || t.includes("spray") || t.includes("மருந்து")) 
      return <Sprout size={18} style={{ color: "#7C3AED" }} />;
    return <Sparkles size={18} style={{ color: "#16A34A" }} />;
  };

  const dbItems = dbPart
    ? dbPart.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {blocks.map((block, idx) => {
        if (block.type === "text") {
          return (
            <p key={idx} style={{ margin: 0, fontWeight: 500, fontSize: "13.5px", lineHeight: "1.5", color: "var(--slate-800)" }}>
              {block.content.replace(/\*\*([^*]+)\*\*/g, "$1")}
            </p>
          );
        }

        if (block.type === "card") {
          return (
            <div
              key={idx}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "12px 14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div style={{ background: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon(block.title)}
                </div>
                <strong style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A" }}>
                  {block.title}
                </strong>
              </div>
              <p style={{ fontSize: "12.5px", color: "#334155", lineHeight: "1.55", margin: 0, paddingLeft: "2px" }}>
                {block.content.replace(/\*\*([^*]+)\*\*/g, "$1")}
              </p>
            </div>
          );
        }

        if (block.type === "bullet") {
          return (
            <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: "#334155", paddingLeft: "4px" }}>
              <span style={{ color: "var(--primary-600)", fontWeight: "bold" }}>•</span>
              <span>{block.content.replace(/\*\*([^*]+)\*\*/g, "$1")}</span>
            </div>
          );
        }

        return null;
      })}

      {/* DB MACHINERY CARD */}
      {dbPart && (
        <div
          style={{
            marginTop: "6px",
            background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
            border: "1px solid #A7F3D0",
            borderRadius: "12px",
            padding: "14px 16px",
            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.08)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Sprout size={18} style={{ color: "#059669" }} />
            <strong style={{ fontSize: "13.5px", color: "#065F46" }}>🌾 DB-Assisted Machinery Availability</strong>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {dbItems.map((itemLine, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5" }}>
                <span style={{ fontSize: "12.5px", color: "#064E3B", fontWeight: 500 }}>
                  {itemLine.replace(/^[•\-*]\s*/, "")}
                </span>
                {navigateTo && (
                  <button
                    onClick={() => navigateTo("machines")}
                    style={{ background: "#059669", color: "#ffffff", border: "none", padding: "4px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportScreen({ language, navigateTo, t }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: t.botGreeting
      }
    ]);
  }, [language, t]);

  const quickPrompts = useMemo(() => {
    if (language === 'ta') {
      return [
        "🚜 சேற்று உழவுக்கு (Puddling) டிராக்டர் எவ்வாறு தேர்வு செய்வது?",
        "🎥 டிராக்டர் சேற்று உழவு வீடியோ வழிகாட்டி கோருக",
        "🌾 ரோட்டவேட்டர் ஆழம் சீரமைப்பு முறைகள்",
        "🎥 ரோட்டவேட்டர் அமைப்பிற்கான வீடியோ வழிகாட்டி",
        "🛡️ 50% அட்வான்ஸ் எஸ்க்ரோ பாதுகாப்பது எவ்வாறு?",
        "🐛 நெல் இலைச்சுருட்டுப் புழு மேலாண்மை ஆலோசனை",
        "🛠️ டிராக்டர் என்ஜின் வெப்பமடைவது ஏன்?"
      ];
    }
    return [
      "🚜 How to select tractor for wet clay puddling?",
      "🎥 Request Video Guide for Tractor Puddling",
      "🌾 Rotavator depth calibration instructions",
      "🎥 Request Video Guide for Rotavator Setup",
      "🛡️ How 50% advance escrow protects my payment",
      "🐛 Paddy leaf folder pest control advice",
      "🛠️ Why is my diesel tractor engine overheating?"
    ];
  }, [language]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isThinking) return;

    const userMsg = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.reply || t.botReplyDefault,
            tutorials: data.tutorialRecommendations || []
          }
        ]);
      } else {
        throw new Error("API request failed");
      }
    } catch {
      // Offline Local Fallback
      setTimeout(() => {
        let reply = t.botReplyDefault;
        let tutorialRecs = [];
        const lower = text.toLowerCase();
        const isVideoReq = lower.includes("video") || lower.includes("tutorial") || lower.includes("guide") || lower.includes("watch") || lower.includes("demo") || lower.includes("வீடியோ");

        const dbAssistedTractorStr = language === "ta"
          ? "\n\n🌾 **தரவுத்தள இயந்திர பரிந்துரைகள் (DB-Assisted)**:\n• Kubota MU4501 E-CDIS (45 HP 4WD) @ ₹1,400/மணி\n• Swaraj 855 FE (52 HP 4WD) @ ₹1,480/மணி\n• Mahindra 575 DI XP Plus (47 HP) @ ₹1,250/மணி"
          : "\n\n🌾 **DB-Assisted Machinery Availability**:\nBased on live inventory in Thanjavur:\n• Kubota MU4501 E-CDIS (45 HP 4WD) @ ₹1,400/hr\n• Swaraj 855 FE (52 HP 4WD) @ ₹1,480/hr\n• Mahindra 575 DI XP Plus (47 HP) @ ₹1,250/hr";

        const dbAssistedSprayerStr = language === "ta"
          ? "\n\n🌾 **தரவுத்தள இயந்திர பரிந்துரைகள் (DB-Assisted)**:\n• Agri-Drone Spraying System 16L @ ₹1,800/மணி (1 ஏக்கர் 7 நிமிடத்தில்)\n• Aspee Tractor Boom Sprayer 500L @ ₹650/மணி"
          : "\n\n🌾 **DB-Assisted Machinery Availability**:\nAvailable precision spraying units in Thanjavur:\n• Agri-Drone Spraying System 16L @ ₹1,800/hr (1 acre in 7 mins)\n• Aspee Tractor Boom Sprayer 500L @ ₹650/hr";

        if (lower.includes("puddling") || lower.includes("wet clay") || (lower.includes("tractor") && lower.includes("select")) || lower.includes("சேறு")) {
          reply = language === "ta"
            ? "ஈரமான களிமண் நில உழவுக்கு (Puddling) டிராக்டரைத் தேர்ந்தெடுப்பதற்கான வழிகாட்டுதல்:\n• **குதிரைத்திறன் & இயக்கம்**: டெல்டா களிமண் நிலங்களில் வாகனம் சேற்றில் சிக்காமல் இருக்க 45 HP முதல் 55 HP வரையிலான 4WD டிராக்டர்கள் மிகவும் உகந்தது.\n• **கியர் தேர்வு**: அதிக இழுவைத்திறன் பெற குறைந்த வேகத்தில் (Low Range L1 அல்லது L2 கியர்) இயக்கவும்.\n• **டயர் அழுத்தம்**: டயர் அழுத்தத்தை 12-14 PSI ஆகக் குறைப்பது டயரின் பிடிப்புத்தன்மையை அதிகரிக்கும்.\n• **ரேடியேட்டர் பராமரிப்பு**: வேலை முடிந்ததும் ரேடியேட்டர் வலைகளில் உள்ள சேற்றை சுத்தமான நீரால் கழுவவும்." + dbAssistedTractorStr
            : "To select a tractor for wet clay puddling:\n• **Power & Drive**: 45 to 55 HP with 4WD is ideal for heavy wetland puddling in Delta clay soil to prevent wheel slippage and bogging down.\n• **Gear Selection**: Use Low Range (L1 or L2 gear) to maintain maximum engine torque at low ground speed.\n• **Tire Pressure & Attachments**: Lower rear tire pressure to 12-14 PSI for a wider traction footprint, or use cage wheels in deep mud. Engage differential lock if trapped in mud.\n• **Post-Work Maintenance**: Flush mud from radiator fins with clean water spray post-operation to prevent engine overheating." + dbAssistedTractorStr;
          if (isVideoReq) tutorialRecs = videoTutorialsData.filter(v => v.id === "tut-001");
        } else if (lower.includes("rotavator") || lower.includes("tillage") || lower.includes("ரோட்டவேட்டர்")) {
          reply = language === "ta"
            ? "ரோட்டவேட்டர் நில தயாரிப்பு வழிகாட்டுதல்:\n• **இணைப்பு**: டிராக்டர் 3-பாயிண்ட் ஹிட்ச் மற்றும் PTO ஷாஃப்ட்டை சரியாகப் பூட்டவும்.\n• **ஆழம் சீரமைப்பு**: பக்கவாட்டு ஆழக் கட்டுப்பாட்டு ஸ்கிட்களை 4-6 அங்குல உழவு ஆழத்திற்கு அமைக்கவும்.\n• **PTO சுழற்சி**: டிராக்டர் என்ஜினை 1800-2000 RPM இல் இயக்கி 540 RPM PTO வேகத்தை பராமரிக்கவும்." + "\n\n🌾 **தரவுத்தள இயந்திர பரிந்துரைகள் (DB-Assisted)**:\n• Shaktiman Semi-Champion Rotavator (7ft) @ ₹750/மணி\n• Laser Land Leveler Dual Transmitter @ ₹950/மணி"
            : "Rotavator Seedbed Preparation Guidance:\n• **Hitch & PTO Setup**: Mount 3-point hitch securely and check PTO shaft spring locking pin.\n• **Depth Calibration**: Set side depth control skids to 4-6 inches based on crop tilth requirements.\n• **RPM Maintenance**: Run tractor engine at 1800-2000 RPM to maintain 540 RPM standard PTO shaft speed.\n• **Blade Inspection**: Inspect L-shaped boron steel blades for wear; replace worn blades in balanced pairs." + "\n\n🌾 **DB-Assisted Machinery Availability**:\n• Shaktiman Semi-Champion Rotavator (7ft) @ ₹750/hr\n• Laser Land Leveler Dual Transmitter @ ₹950/hr";
          if (isVideoReq) tutorialRecs = videoTutorialsData.filter(v => v.id === "tut-002");
        } else if (lower.includes("pest") || lower.includes("leaf") || lower.includes("disease")) {
          reply = language === "ta"
            ? "நெல் இலைச்சுருட்டுப் புழு (Leaf Folder) மேலாண்மை வழிகாட்டுதல்:\n• **வேதிப்பொருள் தெளிப்பு**: ஏக்கருக்கு 60 மி.லி குளோரான்ட்ரனிலிப்ரோல் (Chlorantraniliprole 18.5% SC) 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்." + dbAssistedSprayerStr
            : "Paddy Leaf Folder (Cnaphalocrocis medinalis) Control Advice:\n• **Symptoms**: Caterpillars roll leaves longitudinally and feed inside, producing white transparent streaks.\n• **Chemical Control**: Spray Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Flubendiamide 39.35% SC @ 20 ml/acre diluted in 200 liters of water per acre." + dbAssistedSprayerStr;
          if (isVideoReq) tutorialRecs = videoTutorialsData.filter(v => v.id === "tut-004");
        } else if (lower.includes("escrow") || lower.includes("advance") || lower.includes("எஸ்க்ரோ")) {
          reply = t.botReplyEscrow;
          if (isVideoReq) tutorialRecs = videoTutorialsData.filter(v => v.id === "tut-006");
        } else if (isVideoReq) {
          reply = language === "ta"
            ? "கீழே கொடுக்கப்பட்டுள்ள வீடியோ வழிகாட்டிகள் மற்றும் வயல்வெளி இயக்க கையேடுகளைப் பார்க்கலாம்:"
            : "You can request and watch step-by-step video tutorials and field operating guides below:";
          tutorialRecs = videoTutorialsData.slice(0, 2);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: reply,
            tutorials: tutorialRecs
          }
        ]);
      }, 500);
    } finally {
      setIsThinking(false);
    }
  };

  const filteredTutorials = useMemo(() => {
    if (activeCategory === "all") return videoTutorialsData;
    return videoTutorialsData.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const toggleStep = (stepIdx) => {
    setCheckedSteps(prev => ({ ...prev, [stepIdx]: !prev[stepIdx] }));
  };

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.supportSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.supportHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>
          {t.supportDescription}
        </p>
      </div>

      {/* THREE HELP CHANNELS */}
      <div className="help-grid-pro">
        <div className="help-card-pro">
          <div className="help-card-icon"><Bot size={22} /></div>
          <h4>{t.aiBotChannelTitle}</h4>
          <p>{t.aiBotChannelDesc}</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>{t.aiBotChannelBadge}</span>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon"><PhoneCall size={22} /></div>
          <h4>{t.helplineChannelTitle}</h4>
          <p>{t.helplineChannelDesc}</p>
          <a href="tel:18001234567" style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>
            {t.helplineChannelLink}
          </a>
        </div>

        <div className="help-card-pro">
          <div className="help-card-icon"><PlayCircle size={22} /></div>
          <h4>{t.tutorialsChannelTitle}</h4>
          <p>{t.tutorialsChannelDesc}</p>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--primary-700)" }}>{t.tutorialsChannelBadge}</span>
        </div>
      </div>

      {/* CHAT CONTAINER (GEMINI AI + DB RAG) */}
      <div className="chat-container-pro">
        <div className="chat-header-pro">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px", display: "flex" }}>
              <Bot size={20} style={{ color: "var(--white)" }} />
            </div>
            <div>
              <strong style={{ fontSize: "14px", display: "block", color: "var(--white)" }}>{t.aiAssistantTitle}</strong>
              <small style={{ fontSize: "11px", color: "var(--primary-200)" }}>
                {isThinking
                  ? (language === 'ta' ? "Gemini AI & தரவுத்தள தேடல் செயலில் உள்ளது..." : "Gemini AI & DB Query Active...")
                  : (language === 'ta' ? "Gemini AI + நேரலை DB RAG இணைக்கப்பட்டுள்ளது" : "Gemini AI + Live DB RAG Connected")}
              </small>
            </div>
          </div>
          <span className="badge-live" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
            <Sparkles size={12} /> Gemini Powered
          </span>
        </div>

        <div className="chat-body-pro">
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div
                style={{
                  background: msg.sender === "user" ? "var(--primary-700)" : "var(--white)",
                  color: msg.sender === "user" ? "var(--white)" : "var(--slate-800)",
                  border: msg.sender === "user" ? "none" : "1px solid var(--slate-200)",
                  padding: "14px 18px",
                  borderRadius: msg.sender === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  boxShadow: "var(--shadow-xs)"
                }}
              >
                {msg.sender === "bot" ? (
                  <FormattedBotMessage text={msg.text} navigateTo={navigateTo} />
                ) : (
                  msg.text
                )}
              </div>

              {/* INLINE VIDEO TUTORIAL BUTTONS */}
              {msg.tutorials && msg.tutorials.length > 0 && (
                <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {msg.tutorials.map((tut) => {
                    const fullTutorial = videoTutorialsData.find(v => v.id === tut.id) || tut;
                    const tutTitle = getTutorialTitle(fullTutorial, language);
                    const isExpanded = msg.activeTutorialId === fullTutorial.id;

                    return (
                      <div key={tut.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <button
                          className="chat-video-trigger-btn"
                          onClick={() => {
                            setMessages(prevMsgs => prevMsgs.map(m => {
                              if (m.id === msg.id) {
                                return {
                                  ...m,
                                  activeTutorialId: isExpanded ? null : fullTutorial.id
                                };
                              }
                              return m;
                            }));
                          }}
                        >
                          <PlayCircle size={14} />
                          <span>
                            {isExpanded
                              ? (language === 'ta' ? `▼ வீடியோ வழிகாட்டியை மறைக்க: ${tutTitle}` : `▼ Collapse Video Guide: ${tutTitle}`)
                              : (language === 'ta' ? `🎥 வீடியோ வழிகாட்டியைப் பார்க்க: ${tutTitle}` : `🎥 Watch Video Guide: ${tutTitle}`)}
                          </span>
                        </button>

                        {/* FULL RICH INLINE VIDEO GUIDE */}
                        {isExpanded && (() => {
                          const tutDesc = getTutorialDesc(fullTutorial, language);
                          const tutSafety = getTutorialSafety(fullTutorial, language);
                          const tutSteps = getTutorialSteps(fullTutorial, language);

                          return (
                            <div className="chat-inline-video-guide">
                              <div className="chat-inline-player">
                                <img src={fullTutorial.image} alt={tutTitle} />
                                <div className="chat-inline-player-overlay">
                                  <span className="video-badge-verified">
                                    <BadgeCheck size={14} /> {language === 'ta' ? 'TNAU சான்றளிக்கப்பட்ட தொகுதி' : 'Verified TNAU Module'}
                                  </span>
                                  <div className="video-player-controls" style={{ padding: 0 }}>
                                    <button className="play-btn-circle" style={{ background: "none", border: "none", cursor: "pointer" }}>
                                      <PlayCircle size={28} />
                                    </button>
                                    <div className="video-progress-bar">
                                      <div className="video-progress-fill" style={{ width: "45%" }} />
                                    </div>
                                    <span className="video-time">{fullTutorial.duration}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="chat-inline-header">
                                <span className="tutorial-level-tag">{fullTutorial.level}</span>
                                <h4>{tutTitle}</h4>
                                <p>{tutDesc}</p>
                              </div>

                              <div className="chat-inline-body">
                                {tutSafety && (
                                  <div className="safety-alert-box" style={{ margin: "8px 0 12px" }}>
                                    <ShieldAlert size={18} style={{ color: "#D97706", flexShrink: 0 }} />
                                    <div>
                                      <strong style={{ fontSize: "12px", color: "#92400E", display: "block" }}>
                                        {language === 'ta' ? 'பாதுகாப்பு தணிக்கை நெறிமுறை' : 'Safety Audit Protocol'}
                                      </strong>
                                      <span style={{ fontSize: "12px", color: "#B45309" }}>{tutSafety}</span>
                                    </div>
                                  </div>
                                )}

                                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "10px 0 8px" }}>
                                  {language === 'ta' ? '📋 படி-படியாக வயல்வெளி இயக்க சரிபார்ப்புப் பட்டியல்:' : '📋 Step-by-Step Field Operating Checklist:'}
                                </h4>
                                <div className="checklist-group" style={{ marginBottom: "12px" }}>
                                  {tutSteps.map((stepText, stepIdx) => {
                                    const stepKey = `${fullTutorial.id}_${stepIdx}`;
                                    const isDone = !!(msg.checkedSteps && msg.checkedSteps[stepKey]);
                                    return (
                                      <label key={stepIdx} className={`checklist-item ${isDone ? "checked" : ""}`}>
                                        <input
                                          type="checkbox"
                                          checked={isDone}
                                          onChange={() => {
                                            setMessages(prevMsgs => prevMsgs.map(m => {
                                              if (m.id === msg.id) {
                                                const updatedChecked = { ...(m.checkedSteps || {}), [stepKey]: !isDone };
                                                return { ...m, checkedSteps: updatedChecked };
                                              }
                                              return m;
                                            }));
                                          }}
                                        />
                                        <span className="checklist-num">{stepIdx + 1}</span>
                                        <span className="checklist-text">{stepText}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                <button
                                  className="chat-inline-close-btn"
                                  onClick={() => {
                                    setMessages(prevMsgs => prevMsgs.map(m => {
                                      if (m.id === msg.id) return { ...m, activeTutorialId: null };
                                      return m;
                                    }));
                                  }}
                                >
                                  <X size={14} />
                                  <span>{language === 'ta' ? 'வீடியோ வழிகாட்டியை மூடு' : 'Close Video Guide'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="thinking-bubble">
              <Sparkles size={14} className="spin-icon" style={{ color: "var(--primary-600)" }} />
              <span>{language === 'ta' ? 'Gemini AI விவசாய தகவல்களை பகுப்பாய்வு செய்கிறது...' : 'Gemini AI is analyzing agricultural context & querying database...'}</span>
            </div>
          )}

          {/* QUICK PROMPTS */}
          <div className="quick-prompts-row" style={{ marginTop: "12px" }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="quick-prompt-btn"
                onClick={() => handleSend(prompt)}
                disabled={isThinking}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-footer-pro">
          <input
            type="text"
            placeholder={t.askAssistantPlaceholder}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isThinking}
          />
          <button className="btn-primary" onClick={() => handleSend()} disabled={isThinking}>
            <Send size={15} />
            <span>{language === 'ta' ? 'அனுப்புக' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* VIDEO GUIDES CATALOG */}
      <section style={{ marginTop: "40px" }}>
        <div className="section-header" style={{ marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700 }}>
              {language === 'ta' ? '🎥 விவசாய இயந்திர வீடியோ பயிற்சிகள் & இயக்க கையேடுகள்' : '🎥 Machinery Video Guides & Operating Tutorials'}
            </h3>
            <p style={{ color: "var(--slate-500)", fontSize: "13px" }}>
              {language === 'ta' ? 'பாதுகாப்பு நெறிமுறைகள், உபகரண சீரமைப்பு மற்றும் வயல்வெளி இயக்கங்கள் குறித்த சரிபார்க்கப்பட்ட வீடியோ தொகுதிகள்' : 'Verified video modules on safety protocols, implement calibration, and field operations'}
            </p>
          </div>
        </div>

        <div className="tutorial-categories">
          {[
            { id: "all", label: language === 'ta' ? "அனைத்து வழிகாட்டிகள்" : "All Guides" },
            { id: "tractors", label: language === 'ta' ? "டிராக்டர்கள் & சேற்று உழவு" : "Tractors & Puddling" },
            { id: "tillage", label: language === 'ta' ? "ரோட்டவேட்டர்கள் & நில லெவலர்" : "Rotavators & Levelers" },
            { id: "harvesters", label: language === 'ta' ? "அறுவடை இயந்திரங்கள்" : "Combine Harvesters" },
            { id: "sprayers", label: language === 'ta' ? "தெளிப்பான்கள் & ட்ரோன்கள்" : "Boom & Drone Sprayers" },
            { id: "safety", label: language === 'ta' ? "எஸ்க்ரோ & பாதுகாப்பு விதிகள்" : "Escrow & Safety Rules" }
          ].map(cat => (
            <button
              key={cat.id}
              className={`tutorial-cat-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="tutorial-grid">
          {filteredTutorials.map((tut) => {
            const tutTitle = getTutorialTitle(tut, language);
            const tutDesc = getTutorialDesc(tut, language);
            const tutSteps = getTutorialSteps(tut, language);

            return (
              <article key={tut.id} className="tutorial-card">
                <div className="tutorial-thumb-box">
                  <img src={tut.image} alt={tutTitle} />
                  <div className="tutorial-play-overlay">
                    <PlayCircle size={44} style={{ color: "#fff", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }} />
                  </div>
                  <span className="tutorial-duration">{tut.duration}</span>
                </div>
                <div className="tutorial-card-content">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span className="tutorial-level-tag">{tut.level}</span>
                    <span style={{ fontSize: "11px", color: "var(--primary-700)", fontWeight: 600 }}>{tutSteps.length} {language === 'ta' ? 'படிகள்' : 'Steps'}</span>
                  </div>
                  <h4 className="tutorial-title">{tutTitle}</h4>
                  <p className="tutorial-desc">{tutDesc}</p>
                  <button
                    className="btn-secondary"
                    style={{ width: "100%", marginTop: "12px", justifyContent: "center", fontSize: "12px" }}
                    onClick={() => {
                      setSelectedTutorial(tut);
                      setCheckedSteps({});
                    }}
                  >
                    <PlayCircle size={14} /> {language === 'ta' ? 'வீடியோ பயிற்சி & சரிபார்ப்புப் பட்டியலைப் பார்க்க' : 'Watch Tutorial & Operating Checklist'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* TUTORIAL MODAL OVERLAY */}
      {selectedTutorial && (
        <div className="modal-backdrop" onClick={() => setSelectedTutorial(null)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedTutorial(null)}>
              <X size={20} />
            </button>

            <div className="video-player-frame">
              <img src={selectedTutorial.image} alt={getTutorialTitle(selectedTutorial, language)} />
              <div className="video-player-controls">
                <button className="play-btn-circle">
                  <PlayCircle size={28} />
                </button>
                <div className="video-progress-bar">
                  <div className="video-progress-fill" style={{ width: "45%" }} />
                </div>
                <span className="video-time">{selectedTutorial.duration}</span>
              </div>
              <span className="video-badge-verified">
                <BadgeCheck size={14} /> {language === 'ta' ? 'TNAU சான்றளிக்கப்பட்ட தொகுதி' : 'Verified TNAU Module'}
              </span>
            </div>

            <div className="tutorial-modal-body">
              <span className="tutorial-level-tag">{selectedTutorial.level}</span>
              <h3>{getTutorialTitle(selectedTutorial, language)}</h3>
              <p style={{ color: "var(--slate-600)", fontSize: "13px", margin: "6px 0 16px" }}>
                {getTutorialDesc(selectedTutorial, language)}
              </p>

              {getTutorialSafety(selectedTutorial, language) && (
                <div className="safety-alert-box">
                  <ShieldAlert size={18} style={{ color: "#D97706", flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "12px", color: "#92400E", display: "block" }}>
                      {language === 'ta' ? 'பாதுகாப்பு தணிக்கை நெறிமுறை' : 'Safety Audit Protocol'}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#B45309" }}>{getTutorialSafety(selectedTutorial, language)}</span>
                  </div>
                </div>
              )}

              <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "16px 0 10px" }}>
                {language === 'ta' ? '📋 படி-படியாக வயல்வெளி இயக்க சரிபார்ப்புப் பட்டியல்:' : '📋 Step-by-Step Field Operating Checklist:'}
              </h4>
              <div className="checklist-group">
                {getTutorialSteps(selectedTutorial, language).map((stepText, idx) => {
                  const isDone = !!checkedSteps[idx];
                  return (
                    <label key={idx} className={`checklist-item ${isDone ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleStep(idx)}
                      />
                      <span className="checklist-num">{idx + 1}</span>
                      <span className="checklist-text">{stepText}</span>
                    </label>
                  );
                })}
              </div>

              <div className="tutorial-modal-footer">
                <button
                  className="btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    const matchedMachine = machineryData.find(m => m.id === selectedTutorial.recommendedMachineId) || machineryData[0];
                    setSelectedTutorial(null);
                    navigateTo("booking", matchedMachine);
                  }}
                >
                  <Tractor size={18} /> {language === 'ta' ? 'இந்த இயக்கத்திற்கான இயந்திரத்தை முன்பதிவு செய்ய' : 'Reserve Equipment for This Operation'} ({matchedMachineName(selectedTutorial.recommendedMachineId)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
