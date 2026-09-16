const express = require("express");
const router = express.Router();
const { prisma, MachineryStatus, genAI } = require("../config");
const { machineryResponse } = require("../utils/formatters");

// ─── Video tutorials catalog used for matching ────────────────────────────────
const VIDEO_TUTORIALS = [
  {
    id: "tut-001",
    category: "tractors",
    duration: "8:45 mins",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    keywords: ["tractor", "puddling", "4wd", "mud", "tillage", "video", "tutorial", "டிராக்டர்", "சேறு", "உழவு"],
    title: "Tractor Operation & Deep Wet Puddling Masterclass",
    title_ta: "டிராக்டர் இயக்கம் & ஆழமான சேற்று உழவு (Puddling) பயிற்சி",
    description: "Step-by-step guide on operating 4WD tractors in wet clay soil during paddy land preparation.",
    description_ta: "நெல் நில தயாரிப்பில் 4WD டிராக்டர்களை களிமண் நிலங்களில் இயக்கும் செயல்முறை வழிகாட்டி.",
  },
  {
    id: "tut-002",
    category: "tillage",
    duration: "6:30 mins",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    keywords: ["rotavator", "tillage", "blade", "tilth", "depth", "video", "tutorial", "ரோட்டவேட்டர்"],
    title: "Rotavator Seedbed Calibration & Blade Inspection",
    title_ta: "ரோட்டவேட்டர் உழவு ஆழம் சீரமைப்பு & பிளேட் ஆய்வு",
    description: "Setting 7-foot gear-drive rotavator depth skids and PTO RPM for optimal fine soil tilth.",
    description_ta: "சிறந்த மண் நெகிழ்வுத்தன்மை பெற 7-அடி கியர்-டிரைவ் ரோட்டவேட்டர் ஸ்கிட்களை அமைத்தல்.",
  },
  {
    id: "tut-003",
    category: "harvesters",
    duration: "12:15 mins",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    keywords: ["harvester", "combine", "harvest", "paddy harvest", "video", "tutorial", "அறுவடை"],
    title: "Paddy Combine Harvester Zero-Loss Field Setup",
    title_ta: "நெல் கம்பைன் அறுவடை இயந்திரம் - பூஜ்ஜிய சேத அமைப்புகள்",
    description: "Calibrating cutter bar height, threshing drum clearance, and sieve airflow for moist paddy crops.",
    description_ta: "ஈரமான நெல் பயிர்களுக்கு கட்டர் பார் உயரம், கதிரடிக்கும் டிரம் இடைவெளி மற்றும் காற்றோட்டத்தை அமைத்தல்.",
  },
  {
    id: "tut-004",
    category: "sprayers",
    duration: "7:10 mins",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    keywords: ["sprayer", "drone", "spray", "pesticide", "video", "tutorial", "தெளிப்பான்"],
    title: "Tractor Boom & Drone Spraying Precision Calibration",
    title_ta: "டிராக்டர் பூம் & ட்ரோன் தெளிப்பான் துல்லிய சீரமைப்பு",
    description: "Configuring 500L boom sprayers and agricultural drones for uniform pesticide coverage.",
    description_ta: "சீராக பூச்சிக்கொல்லி தெளிக்க 500லி பூம் தெளிப்பான்கள் மற்றும் விவசாய ட்ரோன்களை அமைத்தல்.",
  },
  {
    id: "tut-005",
    category: "tillage",
    duration: "9:20 mins",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    keywords: ["laser", "leveler", "leveling", "water", "video", "tutorial", "லேசர்"],
    title: "Laser Land Leveling for 35% Irrigation Water Savings",
    title_ta: "லேசர் நில சமன்படுத்தி - 35% நீர் சேமிப்பு தொழில்நுட்பம்",
    description: "Setting up dual transmitter laser levelers to achieve perfectly flat seedbeds in Delta fields.",
    description_ta: "டெல்டா வயல்களில் நிலத்தை கச்சிதமாக சமன்படுத்த இரட்டை டிரான்ஸ்மிட்டர் லேசர் லெவலர்களை அமைத்தல்.",
  },
  {
    id: "tut-006",
    category: "safety",
    duration: "4:15 mins",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    keywords: ["escrow", "advance", "safety", "payment", "video", "tutorial", "எஸ்க்ரோ"],
    title: "FarmIQ 100% Escrow Protection & Delivery Handover Protocol",
    title_ta: "FarmIQ 100% எஸ்க்ரோ பாதுகாப்பு & ஒப்படைப்பு நடைமுறை",
    description: "How your 50% advance token is locked safely in bank escrow until on-farm machine inspection.",
    description_ta: "பண்ணையில் இயந்திர ஆய்வு முடியும் வரை உங்கள் 50% முன்பணம் எவ்வாறு எஸ்க்ரோ கணக்கில் பாதுகாப்பாக வைக்கப்படுகிறது.",
  },
];

// ─── Fallback reply builder ───────────────────────────────────────────────────
function buildFallbackReply(userText, language, dbSummaryText) {
  const lower = userText.toLowerCase();

  if (lower.includes("puddling") || lower.includes("wet clay") || (lower.includes("tractor") && lower.includes("select"))) {
    return language === "ta"
      ? "ஈரமான களிமண் நில உழவுக்கு (Puddling) டிராக்டரைத் தேர்ந்தெடுப்பதற்கான வழிகாட்டுதல்:\n• **குதிரைத்திறன் & இயக்கம்**: டெல்டா களிமண் நிலங்களில் வாகனம் சேற்றில் சிக்காமல் இருக்க 45 HP முதல் 55 HP வரையிலான 4WD டிராக்டர்கள் மிகவும் உகந்தது.\n• **கியர் தேர்வு**: அதிக இழுவைத்திறன் பெற குறைந்த வேகத்தில் (Low Range L1 அல்லது L2 கியர்) இயக்கவும்.\n• **டயர் அழுத்தம்**: டயர் அழுத்தத்தை 12-14 PSI ஆகக் குறைப்பது டயரின் பிடிப்புத்தன்மையை அதிகரிக்கும்.\n• **ரேடியேட்டர் பராமரிப்பு**: வேலை முடிந்ததும் ரேடியேட்டர் வலைகளில் உள்ள சேற்றை சுத்தமான நீரால் கழுவவும்." + dbSummaryText
      : "To select a tractor for wet clay puddling:\n• **Power & Drive**: 45 to 55 HP with 4WD is ideal for heavy wetland puddling in Delta clay soil to prevent wheel slippage and bogging down.\n• **Gear Selection**: Use Low Range (L1 or L2 gear) to maintain maximum engine torque at low ground speed.\n• **Tire Pressure & Attachments**: Lower rear tire pressure to 12-14 PSI for a wider traction footprint, or use cage wheels in deep mud. Engage differential lock if trapped in mud.\n• **Post-Work Maintenance**: Flush mud from radiator fins with clean water spray post-operation to prevent engine overheating." + dbSummaryText;
  }

  if (lower.includes("pest") || lower.includes("leaf folder") || lower.includes("leaf")) {
    return language === "ta"
      ? "நெல் இலைச்சுருட்டுப் புழு (Leaf Folder) மேலாண்மை வழிகாட்டுதல்:\n• **வேதிப்பொருள் தெளிப்பு**: ஏக்கருக்கு 60 மி.லி குளோரான்ட்ரனிலிப்ரோல் (Chlorantraniliprole 18.5% SC) 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்." + dbSummaryText
      : "Paddy Leaf Folder (Cnaphalocrocis medinalis) Control Advice:\n• **Symptoms**: Caterpillars roll leaves longitudinally and feed inside, producing white transparent streaks.\n• **Chemical Control**: Spray Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Flubendiamide 39.35% SC @ 20 ml/acre diluted in 200 liters of water per acre.\n• **Application Technique**: Use tractor boom sprayers or agricultural spraying drones for uniform canopy penetration during early morning or late evening.\n• **Cultural Control**: Set up light traps (1 trap/acre) and release Trichogramma chilonis egg parasitoids @ 20,000/acre." + dbSummaryText;
  }

  if (lower.includes("rotavator") || lower.includes("tillage")) {
    return language === "ta"
      ? "ரோட்டவேட்டர் நில தயாரிப்பு வழிகாட்டுதல்:\n• **இணைப்பு**: டிராக்டர் 3-பாயிண்ட் ஹிட்ச் மற்றும் PTO ஷாஃப்ட்டை சரியாகப் பூட்டவும்.\n• **ஆழம் சீரமைப்பு**: பக்கவாட்டு ஆழக் கட்டுப்பாட்டு ஸ்கிட்களை 4-6 அங்குல உழவு ஆழத்திற்கு அமைக்கவும்.\n• **PTO சுழற்சி**: டிராக்டர் என்ஜினை 1800-2000 RPM இல் இயக்கி 540 RPM PTO வேகத்தை பராமரிக்கவும்." + dbSummaryText
      : "Rotavator Seedbed Preparation Guidance:\n• **Hitch & PTO Setup**: Mount 3-point hitch securely and check PTO shaft spring locking pin.\n• **Depth Calibration**: Set side depth control skids to 4-6 inches based on crop tilth requirements.\n• **RPM Maintenance**: Run tractor engine at 1800-2000 RPM to maintain 540 RPM standard PTO shaft speed.\n• **Blade Inspection**: Inspect L-shaped boron steel blades for wear; replace worn blades in balanced pairs." + dbSummaryText;
  }

  if (lower.includes("overheat") || lower.includes("temp") || lower.includes("engine")) {
    return "Tractor Engine Overheating Troubleshooting:\n• **Radiator Mesh**: Mud and straw debris clog radiator cooling fins during field work. Flush fins with clean water spray from front to back.\n• **Coolant & Fan Belt**: Check coolant reservoir tank level and inspect fan belt tension (10-15mm deflection).\n• **Engine Oil & Air Filter**: Check engine oil dipstick and inspect air filter element for dust blockage." + dbSummaryText;
  }

  if (lower.includes("escrow") || lower.includes("advance") || lower.includes("எஸ்க்ரோ") || lower.includes("एस्क्रो")) {
    return language === "ta"
      ? "FarmIQ எஸ்க்ரோ பாதுகாப்பு எவ்வாறு செயல்படுகிறது:\n• **50% முன்பணம்**: நீங்கள் முன்பதிவு செய்யும்போது முன்பணம் வங்கி உத்தரவாதக் கணக்கில் பாதுகாப்பாக வைக்கப்படும்.\n• **வயல்வெளி ஆய்வு**: இயந்திரம் உங்கள் பண்ணைக்கு வந்து 5-புள்ளி ஆய்வை நீங்கள் ஒப்புக்கொண்ட பின்னரே உரிமையாளருக்கு பணம் விடுவிக்கப்படும்.\n• **அவசர மாற்று**: இயந்திரம் ஆய்வில் தோல்வியடைந்தால் 45 நிமிடங்களில் மாற்று இயந்திரம் அனுப்பப்படும்." + dbSummaryText
      : "FarmIQ 100% Escrow Protection Protocol:\n• **50% Advance Token**: Held in a bank-guaranteed escrow account when you reserve equipment.\n• **On-Farm Inspection**: The machinery owner receives payment ONLY after the equipment arrives at your farm and you approve the inspection checklist.\n• **Replacement Guarantee**: Full refund or 45-minute emergency backup dispatch if equipment fails inspection." + dbSummaryText;
  }

  return language === "ta"
    ? "வணக்கம்! நான் உங்கள் FarmIQ AI விவசாய உதவியாளர். பயிர் மேலாண்மை, பூச்சி கட்டுப்பாடு, டிராக்டர் தேர்வு மற்றும் எஸ்க்ரோ பாதுகாப்பு பற்றிய கேள்விகளுக்கு பதிலளிக்க தயார்." + dbSummaryText
    : "Hello! I am your FarmIQ AI Agri-Assistant. I provide expert guidance on crop care, machinery selection, operating protocols, and escrow protection." + dbSummaryText;
}

// ─── Route ────────────────────────────────────────────────────────────────────

/** POST /api/ai/chat — Gemini AI + DB RAG + smart fallback */
router.post("/ai/chat", async (req, res, next) => {
  try {
    const userText = String(req.body.message || "").trim();
    const language = String(req.body.language || "en").toLowerCase();
    if (!userText) return res.status(400).json({ error: "Message is required" });

    // ── 1. DB Machinery Context (RAG) ─────────────────────────────────────────
    let matchingMachines = [];
    try {
      const allMachines = await prisma.machinery.findMany({
        where: { status: MachineryStatus.AVAILABLE },
        include: { owner: { select: { id: true, accountId: true, fullName: true, phone: true } } },
        take: 16,
      });

      const lowerQuery = userText.toLowerCase();
      matchingMachines = allMachines.filter((m) => {
        const text = `${m.name} ${m.brand} ${m.category} ${m.description} ${m.location}`.toLowerCase();
        if (lowerQuery.includes("tractor") || lowerQuery.includes("டிராக்டர்") || lowerQuery.includes("ट्रैक्टर"))
          return m.category.toUpperCase() === "TRACTOR";
        if (lowerQuery.includes("harvester") || lowerQuery.includes("அறுவடை") || lowerQuery.includes("हार्वेस्टर"))
          return m.category.toUpperCase() === "HARVESTER";
        if (lowerQuery.includes("rotavator") || lowerQuery.includes("tillage") || lowerQuery.includes("ரோட்டவேட்டர்"))
          return m.category.toUpperCase() === "TILLAGE";
        if (lowerQuery.includes("sprayer") || lowerQuery.includes("drone") || lowerQuery.includes("தெளிப்பான்"))
          return m.category.toUpperCase() === "SPRAYER";
        if (lowerQuery.includes("transplanter") || lowerQuery.includes("பயிர நடவு"))
          return m.category.toUpperCase() === "TRANSPLANTER";
        if (lowerQuery.includes("paddy") || lowerQuery.includes("நெல்") || lowerQuery.includes("धान"))
          return m.category.toUpperCase() === "HARVESTER" || m.category.toUpperCase() === "TRANSPLANTER" || m.horsepower >= 45;
        return (
          text.includes(lowerQuery) ||
          lowerQuery.split(" ").some((word) => word.length > 3 && text.includes(word))
        );
      });

      if (!matchingMachines.length && (lowerQuery.includes("machinery") || lowerQuery.includes("equipment") || lowerQuery.includes("rent") || lowerQuery.includes("வாடகை"))) {
        matchingMachines = allMachines.slice(0, 3);
      }
    } catch (err) {
      console.warn("Notice: Prisma machinery fetch skipped:", err.message);
    }

    const machineContextStr = matchingMachines
      .map(
        (m) =>
          `- ${m.name} (${m.brand}): HP ${m.horsepower || "N/A"}, Price ₹${m.pricePerHour}/hr or ₹${m.pricePerDay}/day, Location: ${m.location || "Thanjavur"}, Category: ${m.category}`
      )
      .join("\n");

    // ── 2. DB summary string for fallback / append ────────────────────────────
    let dbSummaryText = "";
    if (matchingMachines.length > 0) {
      const machineItemsStr = matchingMachines
        .slice(0, 3)
        .map(
          (m) =>
            `• ${m.name} (${m.horsepower ? m.horsepower + " HP" : m.brand}) @ ₹${Number(m.pricePerHour)}/hr (${m.location || "Thanjavur"})`
        )
        .join("\n");

      dbSummaryText =
        language === "ta"
          ? `\n\n🌾 **தரவுத்தள இயந்திர பரிந்துரைகள் (DB-Assisted)**:\n${machineItemsStr}`
          : language === "hi"
          ? `\n\n🌾 **डेटाबेस मशीनरी सिफारिशें (DB-Assisted)**:\n${machineItemsStr}`
          : `\n\n🌾 **DB-Assisted Machinery Availability**:\nBased on live inventory in Thanjavur, matching verified equipment ready for dispatch:\n${machineItemsStr}`;
    }

    // ── 3. Gemini API call ────────────────────────────────────────────────────
    let botReply = "";
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = `You are FarmIQ AI Agri-Assistant, an expert agronomist and farm equipment advisor serving farmers in Tamil Nadu and India.
Respond in the language requested by user (Language code: ${language}).
Keep responses clear, helpful, encouraging, and practical for farmers.

CRITICAL RESPONSE STRUCTURE:
1. Provide a comprehensive, detailed, expert agricultural and technical answer FIRST for the farmer's question (e.g. crop care steps, chemical dosages, tractor HP selection, tire pressure, gear selection, or troubleshooting steps).
2. At the end of your response, if DB Machinery Inventory Context is available below, append a section titled "🌾 **DB-Assisted Machinery Availability**" naturally listing matching verified equipment from our database with HP, rental rates, and location.

DB Machinery Inventory Context:
${machineContextStr || "No specific database machines filtered for this query."}`;

        const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${userText}`);
        botReply = result.response.text();
      } catch (err) {
        console.warn("Gemini API call failed, using fallback engine:", err.message);
      }
    }

    // ── 4. Smart Fallback ─────────────────────────────────────────────────────
    if (!botReply) {
      botReply = buildFallbackReply(userText, language, dbSummaryText);
    }

    // ── 5. Video tutorials matching ───────────────────────────────────────────
    const lowerQuery = userText.toLowerCase();
    const isVideoRequested =
      lowerQuery.includes("video") ||
      lowerQuery.includes("tutorial") ||
      lowerQuery.includes("guide") ||
      lowerQuery.includes("watch") ||
      lowerQuery.includes("demo") ||
      lowerQuery.includes("வீடியோ") ||
      lowerQuery.includes("वीडियो");

    let matchingTutorials = VIDEO_TUTORIALS.filter((t) =>
      t.keywords.some((kw) => lowerQuery.includes(kw))
    );
    if (isVideoRequested && !matchingTutorials.length) {
      matchingTutorials = VIDEO_TUTORIALS.slice(0, 2);
    }

    res.json({
      reply: botReply,
      machineryRecommendations: matchingMachines.map((m) => machineryResponse(m)),
      tutorialRecommendations: matchingTutorials,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
