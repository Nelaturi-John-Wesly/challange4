import { TOOL_REGISTRY } from "./tools";
import { AssistantContext, AssistantLanguage, ToolExecutionResult } from "./types";

export interface MatchedIntent {
  toolName: string;
  params: Record<string, any>;
  confidence: number;
}

/**
 * Determines if a query is in Telugu, Hindi, or English based on script/keywords
 */
export function detectLanguage(text: string): AssistantLanguage {
  // Telugu Unicode block: 0C00–0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return "te-IN";
  }
  // Devanagari (Hindi) Unicode block: 0900–097F
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi-IN";
  }
  return "en-IN";
}

/**
 * Translates/formats standard replies into the user's active language
 */
export function localizeReply(
  result: ToolExecutionResult,
  targetLang: AssistantLanguage,
  intentName: string
): ToolExecutionResult {
  if (targetLang === "en-IN") return result;

  if (targetLang === "te-IN") {
    // Telugu Localizations
    const teReplies: Record<string, string> = {
      get_attendance: "మీ మొత్తం అటెండెన్స్ 86.4%. కంప్యూటర్ నెట్‌వర్క్స్ (72%) 75% కన్నా తక్కువ ఉంది. 75% చేరుకోవడానికి ఇంకా 3 క్లాసులు హాజరుకావాలి.",
      get_schedule: "మీ తదుపరి క్లాస్ డేటాబేస్ మేనేజ్‌మెంట్ సిస్టమ్స్ (DBMS) ఉదయం 09:00 గంటలకు రూమ్ 302 లో ఉంది.",
      campus_map: "లైబ్రరీ అకడమిక్ బ్లాక్ B లోని 2వ & 3వ అంతస్తులో ఉంది. స్కైవాక్ ద్వారా సులభంగా చేరుకోవచ్చు.",
      lms_explain: "డెడ్‌లాక్ అంటే రెండు లేదా అంతకంటే ఎక్కువ ప్రాసెస్‌లు ఒకదానికొకటి రిసోర్స్‌ల కోసం శాశ్వతంగా వేచి ఉండి ఆగిపోయే పరిస్థితి. 4 కాఫ్‌మ్యాన్ షరతులు: మ్యూచువల్ ఎక్స్‌క్లూజన్, హోల్డ్ అండ్ వెయిట్, నో ప్రీ-ఎంప్షన్, సర్క్యులర్ వెయిట్.",
      placement_insights: "ప్రస్తుతం CSE కోసం 4 ప్రముఖ కంపెనీలు (Google, Microsoft, Oracle, Accenture) రిక్రూట్‌మెంట్ నిర్వహిస్తున్నాయి.",
      study_plan: "మీ పరీక్షల కోసం వీక్లీ స్టడీ ప్లాన్ సిద్ధం చేయబడింది. అటెండెన్స్ రికవరీ కోసం కంప్యూటర్ నెట్‌వర్క్స్ కు ప్రాధాన్యత ఇవ్వబడింది.",
      order_cafeteria: "సెంట్రల్ క్యాంటీన్ లో ఫుడ్ ప్రీ-ఆర్డర్ కాన్ఫిగర్ చేయబడింది. దయచేసి ధృవీకరించండి.",
      join_club: "క్లబ్ లో చేరడానికి మీ దరఖాస్తు సిద్ధంగా ఉంది. దయచేసి కన్ఫర్మ్ చేయండి.",
      register_event: "హ్యాకథాన్ రిజిస్ట్రేషన్ మరియు డిజిటల్ క్యూఆర్ పాస్ జారీ చేయడానికి సిద్ధంగా ఉంది.",
      prefill_grievance: "మీ ఫిర్యాదు పత్రం సిద్ధం చేయబడింది. హెల్ప్ డెస్క్ లో సమీక్షించి సమర్పించవచ్చు.",
    };

    if (teReplies[intentName]) {
      return { ...result, replyText: teReplies[intentName] };
    }
    return { ...result, replyText: `[తెలుగు] ${result.replyText}` };
  }

  if (targetLang === "hi-IN") {
    // Hindi Localizations
    const hiReplies: Record<string, string> = {
      get_attendance: "आपकी कुल अटेंडेंस 86.4% है। कंप्यूटर नेटवर्क्स (72%) 75% की अनिवार्य सीमा से कम है। 75% तक पहुँचने के लिए आपको 3 और कक्षाएं लेनी होंगी।",
      get_schedule: "आपकी अगली क्लास डेटाबेस मैनेजमेंट सिस्टम्स (DBMS) सुबह 09:00 बजे रूम 302, एकेडमिक ब्लॉक B में है।",
      campus_map: "सेंट्रल डिजिटल लाइब्रेरी एकेडमिक ब्लॉक B की दूसरी और तीसरी मंजिल पर स्थित है।",
      lms_explain: "डेडलाक एक ऐसी स्थिति है जब दो या दो से अधिक प्रक्रियाएं एक-दूसरे द्वारा रोके गए संसाधनों के लिए हमेशा के लिए प्रतीक्षा करती रहती हैं।",
      placement_insights: "वर्तमान में CSE छात्रों के लिए Google, Microsoft, Oracle और Accenture जैसी 4 प्रमुख कंपनियां प्लेसमेंट ड्राइव आयोजित कर रही हैं।",
      study_plan: "आपकी आगामी परीक्षाओं के लिए संतुलित अध्ययन योजना तैयार की गई है।",
      order_cafeteria: "कैफेटेरिया प्री-ऑर्डर तैयार है। कृपया पुष्टि करें।",
      join_club: "क्लब की सदस्यता का आवेदन तैयार है। कृपया पुष्टि करें।",
      register_event: "हैकथॉन के लिए आपका डिजिटल क्यूआर पास जारी करने हेतु कृपया पुष्टि करें।",
      prefill_grievance: "आपकी शिकायत का प्रारूप तैयार हो गया है। हेल्प डेस्क पर इसकी समीक्षा करें।",
    };

    if (hiReplies[intentName]) {
      return { ...result, replyText: hiReplies[intentName] };
    }
    return { ...result, replyText: `[हिंदी] ${result.replyText}` };
  }

  return result;
}

/**
 * Robust Multilingual Pattern & Keyword Matcher
 */
export async function matchOfflineIntent(
  query: string,
  context: AssistantContext
): Promise<ToolExecutionResult | null> {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  const detectedLang = detectLanguage(query);
  const effectiveLang = context.language || detectedLang;

  // 1. ATTENDANCE INTENTS
  if (
    clean.includes("attendance") ||
    clean.includes("below 75") ||
    clean.includes("absent") ||
    clean.includes("present") ||
    clean.includes("హాజరు") ||
    clean.includes("అటెండెన్స్") ||
    clean.includes("उपस्थिति") ||
    clean.includes("अटेंडेंस")
  ) {
    const res = await TOOL_REGISTRY.get_attendance.handler({}, context);
    return localizeReply(res, effectiveLang, "get_attendance");
  }

  // 2. TIMETABLE & SCHEDULE INTENTS
  if (
    clean.includes("next class") ||
    clean.includes("schedule") ||
    clean.includes("timetable") ||
    clean.includes("lecture") ||
    clean.includes("తదుపరి క్లాస్") ||
    clean.includes("టైమ్‌టేబుల్") ||
    clean.includes("अगली क्लास") ||
    clean.includes("टाइमटेबल")
  ) {
    const res = await TOOL_REGISTRY.get_schedule.handler({}, context);
    return localizeReply(res, effectiveLang, "get_schedule");
  }

  // 3. CAMPUS MAP & DIRECTIONS INTENTS
  if (
    clean.includes("where is") ||
    clean.includes("map") ||
    clean.includes("location") ||
    clean.includes("directions") ||
    clean.includes("library") ||
    clean.includes("ఎక్కడ ఉంది") ||
    clean.includes("లైబ్రరీ") ||
    clean.includes("कहाँ है") ||
    clean.includes("लाइब्रेरी")
  ) {
    let place = "library";
    if (clean.includes("cafeteria") || clean.includes("canteen") || clean.includes("food")) place = "cafeteria";
    if (clean.includes("lab")) place = "lab";
    if (clean.includes("audi")) place = "auditorium";
    const res = await TOOL_REGISTRY.campus_map.handler({ place }, context);
    return localizeReply(res, effectiveLang, "campus_map");
  }

  // 4. DEADLOCK / NORMALIZATION EXPLAINER
  if (
    clean.includes("explain") ||
    clean.includes("deadlock") ||
    clean.includes("normalization") ||
    clean.includes("what is") ||
    clean.includes("డెడ్‌లాక్") ||
    clean.includes("అంటే ఏమిటి") ||
    clean.includes("डेडलाक") ||
    clean.includes("क्या होता है")
  ) {
    let concept = "deadlock";
    if (clean.includes("normaliz")) concept = "normalization";
    const res = await TOOL_REGISTRY.lms_explain.handler({ concept }, context);
    return localizeReply(res, effectiveLang, "lms_explain");
  }

  // 5. QUIZ INTENTS
  if (
    clean.includes("quiz") ||
    clean.includes("questions on") ||
    clean.includes("test me") ||
    clean.includes("క్విజ్") ||
    clean.includes("क्विज़")
  ) {
    const topic = clean.includes("os") ? "Operating Systems" : "Database Management Systems (DBMS)";
    const res = await TOOL_REGISTRY.lms_quiz.handler({ topic }, context);
    return localizeReply(res, effectiveLang, "lms_quiz");
  }

  // 6. STUDY PLAN INTENTS
  if (
    clean.includes("study plan") ||
    clean.includes("plan my exams") ||
    clean.includes("revision") ||
    clean.includes("స్టడీ ప్లాన్") ||
    clean.includes("अध्ययन योजना")
  ) {
    const res = await TOOL_REGISTRY.study_plan.handler({}, context);
    return localizeReply(res, effectiveLang, "study_plan");
  }

  // 7. PLACEMENTS & JOBS INTENTS
  if (
    clean.includes("placement") ||
    clean.includes("hiring") ||
    clean.includes("companies") ||
    clean.includes("resume") ||
    clean.includes("కంపెనీలు") ||
    clean.includes("ప్లేస్‌మెంట్") ||
    clean.includes("कंपनियाँ") ||
    clean.includes("प्लेसमेंट")
  ) {
    const res = await TOOL_REGISTRY.placement_insights.handler({ department: "CSE" }, context);
    return localizeReply(res, effectiveLang, "placement_insights");
  }

  // 8. CAMPUS GIGS INTENTS
  if (
    clean.includes("gig") ||
    clean.includes("part-time") ||
    clean.includes("freelance") ||
    clean.includes("earning") ||
    clean.includes("గిగ్స్") ||
    clean.includes("गिग्स")
  ) {
    if (clean.includes("apply") || clean.includes("join")) {
      const res = await TOOL_REGISTRY.apply_gig.handler({ gigTitle: "Python Lab Assistant" }, context);
      return localizeReply(res, effectiveLang, "apply_gig");
    }
    const res = await TOOL_REGISTRY.navigate.handler({ target: "/gigs" }, context);
    return localizeReply(res, effectiveLang, "navigate");
  }

  // 9. EVENTS & HACKATHONS INTENTS
  if (
    clean.includes("hackathon") ||
    clean.includes("event") ||
    clean.includes("fest") ||
    clean.includes("హ్యాకథాన్") ||
    clean.includes("हैकथॉन")
  ) {
    if (clean.includes("register") || clean.includes("join")) {
      const res = await TOOL_REGISTRY.register_event.handler({ eventName: "National AI Hackathon 2026" }, context);
      return localizeReply(res, effectiveLang, "register_event");
    }
    const res = await TOOL_REGISTRY.search_portal.handler({ query: "hackathon" }, context);
    return localizeReply(res, effectiveLang, "search_portal");
  }

  // 10. CLUBS INTENTS
  if (
    clean.includes("club") ||
    clean.includes("robotics") ||
    clean.includes("coding") ||
    clean.includes("క్లబ్") ||
    clean.includes("क्लब")
  ) {
    if (clean.includes("join") || clean.includes("register")) {
      const res = await TOOL_REGISTRY.join_club.handler({ clubName: "Robotics Club" }, context);
      return localizeReply(res, effectiveLang, "join_club");
    }
    const res = await TOOL_REGISTRY.navigate.handler({ target: "/clubs" }, context);
    return localizeReply(res, effectiveLang, "navigate");
  }

  // 11. CAFETERIA INTENTS
  if (
    clean.includes("dosa") ||
    clean.includes("coffee") ||
    clean.includes("sandwich") ||
    clean.includes("order") ||
    clean.includes("food") ||
    clean.includes("కాఫీ") ||
    clean.includes("దోస") ||
    clean.includes("कॉफी") ||
    clean.includes("डोसा")
  ) {
    let items = "Masala Dosa & Filter Coffee";
    if (clean.includes("sandwich")) items = "Grilled Sandwich & Cold Coffee";
    const res = await TOOL_REGISTRY.order_cafeteria.handler({ items }, context);
    return localizeReply(res, effectiveLang, "order_cafeteria");
  }

  // 12. GRIEVANCE / HELP DESK INTENTS
  if (
    clean.includes("grievance") ||
    clean.includes("complaint") ||
    clean.includes("not working") ||
    clean.includes("fan") ||
    clean.includes("wifi") ||
    clean.includes("ఫిర్యాదు") ||
    clean.includes("शिकायत")
  ) {
    const res = await TOOL_REGISTRY.prefill_grievance.handler(
      {
        title: clean.includes("wifi") ? "Library Wi-Fi Connectivity Drop" : "Classroom Facility Maintenance",
        category: "Infrastructure & Wi-Fi",
        description: query,
      },
      context
    );
    return localizeReply(res, effectiveLang, "prefill_grievance");
  }

  // 13. NAVIGATION (OPEN / GO TO)
  if (
    clean.includes("open") ||
    clean.includes("go to") ||
    clean.includes("take me to") ||
    clean.includes("show me") ||
    clean.includes("ఓపెన్") ||
    clean.includes("खोलो")
  ) {
    const res = await TOOL_REGISTRY.navigate.handler({ target: clean }, context);
    return localizeReply(res, effectiveLang, "navigate");
  }

  // 14. ADMIN OR FACULTY SPECIFIC
  if (clean.includes("platform stats") || clean.includes("approvals") || clean.includes("admin")) {
    const res = await TOOL_REGISTRY.admin_platform_stats.handler({}, context);
    return localizeReply(res, effectiveLang, "admin_platform_stats");
  }

  if (clean.includes("below 65") || clean.includes("students with low attendance")) {
    const res = await TOOL_REGISTRY.faculty_attendance_alert.handler({}, context);
    return localizeReply(res, effectiveLang, "faculty_attendance_alert");
  }

  // 15. DEFAULT FALLBACK: GLOBAL PORTAL SEARCH
  const res = await TOOL_REGISTRY.search_portal.handler({ query: clean }, context);
  return localizeReply(res, effectiveLang, "search_portal");
}
