import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

const COUNTRY_NAME_MAP = {
  'United States of America': 'United States',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  "People's Republic of China": 'China',
  'Federal Republic of Germany': 'Germany',
  'Kingdom of Spain': 'Spain',
  'French Republic': 'France',
  'Federative Republic of Brazil': 'Brazil',
  'Russian Federation': 'Russia',
  'Republic of India': 'India',
  'Commonwealth of Australia': 'Australia',
  'Federal Republic of Nigeria': 'Nigeria',
};

const DIALECT_DATA = {
  'United States': {
    region: 'North America',
    primaryDialects: ['General American', 'Southern American', 'New England', 'AAVE', 'Chicano English'],
    overview: 'American English spans dozens of regional dialects shaped by immigration waves, geography, and cultural history — from the drawled vowels of the Deep South to the dropped r\'s of Boston.',
    timeline: [
      { year: '1600s', era: 'Colonial', accent: 'en-GB', description: 'Early settlers brought diverse British dialects. Rhotic /r/ was common everywhere, and vowel sounds closely mirrored Elizabethan English.', sample: 'Good morrow, how dost thou fare this fine day, neighbour?' },
      { year: '1700s', era: 'Revolutionary', accent: 'en-US', description: 'American identity carved out distinct speech patterns. Non-rhotic prestige forms emerged in Boston and New York, mirroring fashionable London speech.', sample: 'We hold these truths to be self-evident.' },
      { year: '1800s', era: 'Westward Expansion', accent: 'en-US', description: 'Pioneer migration levelled dialects in the Midwest. Southern drawl solidified. Great immigrant waves shaped northern city speech.', sample: 'I reckon we ought to head west come spring, partner.' },
      { year: '1930s', era: 'Radio & Great Migration', accent: 'en-US', description: 'Radio began homogenising speech toward a neutral "General American." The Great Migration carried AAVE northward into industrial cities.', sample: "We're heading downtown to catch a picture show tonight." },
      { year: '2000s', era: 'Digital Age', accent: 'en-US', description: 'Internet culture accelerated dialect mixing. The cot–caught merger spread widely. Valley English features like uptalk became national.', sample: "I'm literally going to text you about this later, okay?" },
    ],
  },
  'United Kingdom': {
    region: 'Europe',
    primaryDialects: ['Received Pronunciation', 'Cockney', 'Geordie', 'Scouse', 'Scottish English', 'Welsh English'],
    overview: 'British English is among the most dialect-dense in the world — a two-hour train ride can cross four mutually-distinct accent zones.',
    timeline: [
      { year: '1400s', era: 'Middle English', accent: 'en-GB', description: 'Chaucer\'s English. The Great Vowel Shift had just begun, dramatically raising long vowels. Strong regional variation across every county.', sample: 'Whan that Aprill with his shoures soote the droghte of March hath perced.' },
      { year: '1600s', era: 'Shakespearean', accent: 'en-GB', description: 'Early Modern English post-Vowel Shift. Still fully rhotic. "Was" rhymed with "grass." Theatre helped standardise written forms.', sample: 'To be or not to be, that is the question.' },
      { year: '1800s', era: 'Victorian', accent: 'en-GB', description: 'Received Pronunciation crystallised as the prestige accent of the educated elite. Working-class city dialects — Cockney, Brummie — diverged sharply.', sample: 'It was the best of times, it was the worst of times.' },
      { year: '1930s', era: 'BBC English', accent: 'en-GB', description: 'The BBC mandated RP as the broadcast standard, cementing class-based accent distinctions across the nation.', sample: 'This is the BBC Home Service. Good evening.' },
      { year: '2000s', era: 'Contemporary', accent: 'en-GB', description: 'Estuary English spread from London outward. Multicultural London English emerged from Jamaican Creole and Bengali influences. RP in retreat.', sample: "Alright mate, you coming out tonight or what?" },
    ],
  },
  'France': {
    region: 'Europe',
    primaryDialects: ['Standard French', 'Meridional (Southern)', 'Alsatian French', 'Breton French', 'Parisian Argot'],
    overview: 'French divides historically into the langue d\'oïl of the north and langue d\'oc of the south, with the Académie française policing the written standard since 1635.',
    timeline: [
      { year: '800s', era: 'Old French', accent: 'fr-FR', description: 'Emerging from Vulgar Latin after Roman collapse. Two-case noun system. Northern and southern dialects already diverging around the Loire.', sample: 'La Chanson de Roland — chantons les prouesses.' },
      { year: '1400s', era: 'Middle French', accent: 'fr-FR', description: 'Parisian dialect rising as political centre. Scribes began standardising spelling. Nasal vowels developing.', sample: 'Je suis venu, j\'ai vu, j\'ai vaincu.' },
      { year: '1600s', era: 'Classical Age', accent: 'fr-FR', description: 'Académie française founded 1635. Molière\'s prose fixed literary norms. Regional languages actively suppressed at court.', sample: "L'État, c'est moi, dit le roi." },
      { year: '1800s', era: 'Revolutionary', accent: 'fr-FR', description: 'The Republic promoted French as the language of liberty. Breton, Occitan and Alsatian declared threats to national unity.', sample: 'Liberté, égalité, fraternité — notre devise.' },
      { year: '2000s', era: 'Contemporary', accent: 'fr-FR', description: 'Verlan back-slang widespread among youth. English loanwords cause Académie alarm. Regional languages quietly reviving online.', sample: "C'est trop cool, carrément! Laisse tomber." },
    ],
  },
  'Germany': {
    region: 'Europe',
    primaryDialects: ['Standard German (Hochdeutsch)', 'Bavarian', 'Saxon', 'Low German', 'Swabian', 'Cologne Kölsch'],
    overview: 'German splits along the Benrath and Speyer lines — the Second Consonant Shift that separated High from Low German over a thousand years ago is still audible today.',
    timeline: [
      { year: '750s', era: 'Old High German', accent: 'de-DE', description: 'The Second Sound Shift transformed /p/ → /pf/ and /t/ → /ts/ in southern dialects, creating the fundamental High/Low divide.', sample: 'Ih bin einaz kindes barn.' },
      { year: '1200s', era: 'Middle High German', accent: 'de-DE', description: 'Courtly Minnesang poetry from the Rhine and Danube regions. Walther von der Vogelweide standardised literary forms.', sample: 'Under der linden an der heide.' },
      { year: '1500s', era: 'Luther\'s Bible', accent: 'de-DE', description: 'Luther\'s 1522 Bible translation unified written German across Protestant lands, drawing on the Upper Saxon chancery tradition.', sample: 'Am Anfang schuf Gott Himmel und Erde.' },
      { year: '1800s', era: 'Romantic', accent: 'de-DE', description: 'Grimm brothers documented folk dialects. National consciousness made Hochdeutsch a political project of German unification.', sample: 'Es war einmal ein König, der hatte drei Töchter.' },
      { year: '2000s', era: 'Contemporary', accent: 'de-DE', description: 'Hochdeutsch dominates media but Bavarian remains proudly local. Kiezdeutsch — a Turkish-German contact dialect — emerged in Berlin.', sample: 'Alter, das ist voll krass, ey!' },
    ],
  },
  'Spain': {
    region: 'Europe',
    primaryDialects: ['Castilian Spanish', 'Andalusian', 'Canarian', 'Extremaduran', 'Murcian'],
    overview: 'The famous Castilian /θ/ (ceceo) and the seseo of Andalusia and Latin America represent the most audible split in the Spanish-speaking world.',
    timeline: [
      { year: '1000s', era: 'Old Castilian', accent: 'es-ES', description: 'Castilian emerging from Vulgar Latin with heavy Arabic substrate influence — over 4,000 Spanish words derive from Arabic.', sample: 'En el nombre de Dios, el Cid cabalga.' },
      { year: '1400s', era: 'Late Medieval', accent: 'es-ES', description: 'Reconquista completed. Columbus sailed with Andalusian sailors whose seseo (no /θ/) spread across Latin America.', sample: 'Las Indias están descubiertas.' },
      { year: '1600s', era: 'Golden Age', accent: 'es-ES', description: 'Cervantes and Lope de Vega. The /θ/ vs /s/ distinction became fully established in northern Castile as a prestige feature.', sample: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme.' },
      { year: '1800s', era: 'Modern', accent: 'es-ES', description: 'Real Academia Española formalised standards. Latin American variants drifted further from Peninsular norms after independence.', sample: 'La lengua es la patria de los españoles.' },
      { year: '2000s', era: 'Contemporary', accent: 'es-ES', description: 'Yeísmo (merging ll and y) now nearly universal. Spanglish booming in US. Andalusian losing final consonants at speed.', sample: '¿Tío, qué pasó? Yo flipé en colores.' },
    ],
  },
  'India': {
    region: 'South Asia',
    primaryDialects: ['Indian English', 'Hindi-English (Hinglish)', 'Tamil English', 'Bengali English', 'Marathi English'],
    overview: 'India\'s 22 official languages and hundreds of dialects create uniquely flavoured English varieties, with retroflex consonants and syllable-timed rhythm as shared hallmarks.',
    timeline: [
      { year: '1600s', era: 'Pre-Colonial', accent: 'hi-IN', description: 'Sanskrit classical tradition alongside vibrant vernaculars: Braj Bhasha, Awadhi, Maithili. Persian dominant at Mughal courts.', sample: 'Namaste. Ram Ram. Adab arz hai.' },
      { year: '1800s', era: 'Colonial', accent: 'en-IN', description: 'Macaulay\'s 1835 Minute mandated English education. Babu English emerged — formal, florid, overly literal.', sample: 'I am doing the needful at the earliest.' },
      { year: '1900s', era: 'Independence', accent: 'en-IN', description: 'Indian English gained legitimacy as its own standard. Retroflex /ṭ ḍ/ and short clipped vowels became defining features.', sample: 'Jai Hind! India is a great nation.' },
      { year: '1990s', era: 'IT Boom', accent: 'en-IN', description: 'Bangalore and Hyderabad call centres normalised educated urban Indian English globally. Code-switching with Hindi exploded.', sample: 'Please revert back at the earliest, it is very urgent.' },
      { year: '2000s', era: 'Contemporary', accent: 'en-IN', description: 'Hinglish — Hindi/English mix — dominates urban youth culture, Bollywood, and social media. Pure English now a marked register.', sample: "Yaar, let's do this na? Ekdum solid plan hai." },
    ],
  },
  'Australia': {
    region: 'Oceania',
    primaryDialects: ['General Australian', 'Broad Australian (Strine)', 'Cultivated Australian', 'Aboriginal English', 'Australian Creoles'],
    overview: 'Australian English remarkably homogenised within a single generation of the first convict settlements — children of speakers from dozens of British dialects converged on one accent.',
    timeline: [
      { year: '1788', era: 'First Fleet', accent: 'en-AU', description: 'Convicts and marines from London, Ireland, and regional Britain mixed their dialects. Cockney and Irish English were the most influential.', sample: "Crikey, what a strange and sunburnt land this is." },
      { year: '1800s', era: 'Settlement', accent: 'en-AU', description: 'Colonial-born children — "currency lads and lasses" — levelled their parents\' dialects into a new, distinct accent within decades.', sample: "We're heading out into the bush, mate." },
      { year: '1900s', era: 'Federation', accent: 'en-AU', description: 'Federation in 1901 sparked national identity. The Broad "Strine" accent was fully developed: diphthong shifts, intrusive /j/, flat /æ/.', sample: "G'day mate, how ya going?" },
      { year: '1950s', era: 'Post-War', accent: 'en-AU', description: 'Mass migration from Mediterranean Europe and Asia began diversifying urban accents. "Wog" English emerged in Melbourne and Sydney.', sample: "She'll be right, no dramas, good on ya." },
      { year: '2000s', era: 'Contemporary', accent: 'en-AU', description: 'High Rising Terminal (question intonation on statements) normalised. Multicultural Australian English growing in cities. American media influence strong.', sample: "That's absolutely heaps good, I reckon." },
    ],
  },
  'Brazil': {
    region: 'South America',
    primaryDialects: ['Paulistano (São Paulo)', 'Carioca (Rio)', 'Nordestino', 'Gaúcho (South)', 'Caipira (Interior)'],
    overview: 'Brazilian Portuguese diverged sharply from European Portuguese through contact with hundreds of Tupi-Guaraní languages and millions of enslaved Africans.',
    timeline: [
      { year: '1500s', era: 'Colonial Contact', accent: 'pt-BR', description: 'Portuguese colonisers mixed with Tupi-speaking peoples. Língua Geral — a simplified Tupi — became the common language of the interior for two centuries.', sample: 'Brasil, terra de Santa Cruz e de muitas maravilhas.' },
      { year: '1700s', era: 'Gold Rush', accent: 'pt-BR', description: 'Gold and diamond rushes in Minas Gerais drew massive internal migration, mixing dialects. African enslaved peoples dramatically shaped Bahian Portuguese.', sample: 'O ouro de Minas é riqueza do Brasil.' },
      { year: '1800s', era: 'Empire', accent: 'pt-BR', description: 'Nasal vowels weakened compared to European Portuguese. Open vowels in unstressed syllables. Distinctive vocalic system emerged.', sample: 'Independência ou morte!' },
      { year: '1900s', era: 'Republic', accent: 'pt-BR', description: 'Radio spread Paulistano as the prestige variety. Carioca accent dominated early cinema. Bossa Nova globalised Brazilian speech rhythms.', sample: 'Saudades do Brasil, saudades, saudades...' },
      { year: '2000s', era: 'Contemporary', accent: 'pt-BR', description: 'Funk carioca and axé music spread new slang nationally. Nordestino accent gained cultural prestige. Internet equalised regional variation.', sample: 'Caramba, que saudade! Tá ligado, mano?' },
    ],
  },
  'Japan': {
    region: 'East Asia',
    primaryDialects: ['Standard Japanese (Hyōjungo)', 'Kansai-ben (Osaka/Kyoto)', 'Tohoku dialect', 'Hakata dialect', 'Okinawan Japanese'],
    overview: 'Japanese dialects differ in pitch accent, vocabulary, and grammar — Tokyo\'s flat accent vs the Kyoto-Osaka pitch system represent two ancient traditions still alive today.',
    timeline: [
      { year: '700s', era: 'Old Japanese', accent: 'ja-JP', description: 'Eight vowel system. Complex consonant clusters since lost. Court poetry in the Man\'yōshū captured the earliest attested Japanese phonology.', sample: '春過ぎて夏来たるらし白妙の — Haru sugite natsu kitarurarashi.' },
      { year: '1200s', era: 'Medieval', accent: 'ja-JP', description: 'Kyoto dialect as the prestige standard. Samurai class developed its own registers. Buddhist Sanskrit loanwords reshaped vocabulary.', sample: '祇園精舎の鐘の声 — Gion shōja no kane no koe.' },
      { year: '1600s', era: 'Edo Period', accent: 'ja-JP', description: 'Edo (Tokyo) dialect rising with the Tokugawa shogunate. Kabuki theatre and ukiyo-e shaped a distinctive eastern urban speech style.', sample: '古池や蛙飛び込む水の音 — Furuike ya kawazu tobikomu.' },
      { year: '1868', era: 'Meiji Modernisation', accent: 'ja-JP', description: 'Hyōjungo standardised based on educated Tokyo speech. New vocabulary flooded in from English, German, and French.', sample: '文明開化 — Bunmei kaika. Civilisation and enlightenment.' },
      { year: '2000s', era: 'Contemporary', accent: 'ja-JP', description: 'Tokyo standard dominant in media. Kansai-ben maintains prestige in comedy. Youth language (Gyaru-go, then internet slang) reshapes registers.', sample: 'なんでやねん！ — Nande yanen! (Classic Osaka comeback)' },
    ],
  },
  'Nigeria': {
    region: 'West Africa',
    primaryDialects: ['Nigerian English', 'Yoruba English', 'Igbo English', 'Hausa English', 'Nigerian Pidgin (Naija)'],
    overview: 'With over 500 languages, Nigeria built its national identity around Nigerian English and Nigerian Pidgin — both now recognised as fully legitimate linguistic systems.',
    timeline: [
      { year: '1800s', era: 'Pre-Colonial', accent: 'en-NG', description: 'Yoruba, Igbo, and Hausa kingdoms with rich oral traditions. Atlantic trade pidgin emerging along the coast.', sample: 'E go better. Na God dey help man.' },
      { year: '1900s', era: 'Colonial', accent: 'en-NG', description: 'British colonial schools taught Standard English. Mission-educated elites developed a formal register. Pidgin spread among labourers.', sample: 'Things fall apart; the centre cannot hold.' },
      { year: '1960s', era: 'Independence', accent: 'en-NG', description: 'Nigerian English emerged as a distinct variety with tonal intonation from Yoruba/Igbo, short clipped vowels, and unique vocabulary.', sample: 'Nigeria, we hail thee, our own dear native land.' },
      { year: '1980s', era: 'Fela & Afrobeat', accent: 'en-NG', description: 'Fela Kuti\'s Pidgin lyrics built pan-Nigerian working-class identity. "Naija" Pidgin became a badge of authentic national selfhood.', sample: 'Suffering and smiling. Water no get enemy.' },
      { year: '2000s', era: 'Contemporary', accent: 'en-NG', description: 'Nollywood exports Nigerian English globally. Afrobeats vocabulary — "sabi", "japa", "e don do" — entered the global lexicon.', sample: 'E don do! E don red! Japa now now!' },
    ],
  },
  'Russia': {
    region: 'Eastern Europe',
    primaryDialects: ['Standard Russian (Moscow)', 'Northern Russian (okanye)', 'Southern Russian (akanye)', 'Siberian Russian', 'St Petersburg dialect'],
    overview: 'Russian dialects split along the okanye (northern, pronouncing unstressed /o/ fully) and akanye (southern and standard, reducing /o/ to /a/) divide.',
    timeline: [
      { year: '900s', era: 'Old Church Slavonic', accent: 'ru-RU', description: 'Cyrillic alphabet introduced by Saints Cyril and Methodius. Old East Slavic diverging from Common Slavic. Norse (Varangian) loanwords entering.', sample: 'В начале было Слово — V nachale bylo Slovo.' },
      { year: '1300s', era: 'Moscow Rising', accent: 'ru-RU', description: 'Moscow dialect gaining prestige as political centre. Tatar loanwords flooded in after Mongol period. Akanye spreading southward.', sample: 'Слово о полку Игореве — Slovo o polku Igoreve.' },
      { year: '1700s', era: 'Petrine Reform', accent: 'ru-RU', description: 'Peter the Great\'s westernisation flooded Russian with Dutch, German, and French loanwords. New secular alphabet introduced.', sample: 'Россия — часть Европы. Россия должна идти вперёд.' },
      { year: '1800s', era: 'Pushkin\'s Standard', accent: 'ru-RU', description: 'Pushkin established the modern literary standard. French-influenced aristocratic speech contrasted with the people\'s spoken tongue.', sample: 'Я вас любил: любовь ещё, быть может... — Ya vas lyubil.' },
      { year: '2000s', era: 'Contemporary', accent: 'ru-RU', description: 'Padonkaffsky internet jargon deliberately misspelled words as youth rebellion. English tech loanwords. Soviet register surviving in bureaucracy.', sample: 'Всё норм, братан! Красавчик, жги! — Vsyo norm, bratan!' },
    ],
  },
  'China': {
    region: 'East Asia',
    primaryDialects: ['Mandarin (Putonghua)', 'Cantonese (Yue)', 'Shanghainese (Wu)', 'Hokkien (Min Nan)', 'Hakka'],
    overview: 'China\'s language varieties are so distinct that Cantonese and Mandarin are mutually unintelligible — yet a shared writing system has united the country in literacy for over two thousand years.',
    timeline: [
      { year: '1000 BCE', era: 'Classical Chinese', accent: 'zh-CN', description: 'Classical written Chinese (Wenyan). Old Chinese had rich consonant clusters, no tones as we know them. Confucian texts set the literary standard.', sample: '學而時習之，不亦說乎？ — Xué ér shí xí zhī, bù yì yuè hū?' },
      { year: '600s', era: 'Tang Dynasty', accent: 'zh-CN', description: 'Middle Chinese. Four tones developed. Tang poetry culture demanded precise tonal prosody. Chang\'an (Xi\'an) dialect as prestige form.', sample: '床前明月光，疑是地上霜 — Chuáng qián míng yuè guāng.' },
      { year: '1200s', era: 'Yuan Dynasty', accent: 'zh-CN', description: 'Proto-Mandarin spreading from the north under Mongol patronage. Yuan drama (zaju) written in Early Mandarin.', sample: '元曲四大家 — Yuán qǔ sì dàjiā.' },
      { year: '1900s', era: 'Republican Era', accent: 'zh-CN', description: 'Putonghua (Standard Mandarin) based on Beijing pronunciation formalised as national standard. Literacy campaigns promoted it nationwide.', sample: '中华人民共和国成立了！Zhōnghuá rénmín gònghéguó chénglì le!' },
      { year: '2000s', era: 'Contemporary', accent: 'zh-CN', description: 'Putonghua dominant through schooling and media. Cantonese fighting for survival in Hong Kong. Internet slang ("666", "yyds") created new written registers.', sample: '666，太厉害了！YYDS！— Liùliùliù, tài lìhài le!' },
    ],
  },
};

const PANEL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;800&display=swap');
  @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes glow { 0%,100% { box-shadow:0 0 6px rgba(167,139,250,0.4); } 50% { box-shadow:0 0 14px rgba(167,139,250,0.9); } }
  .dialect-panel { animation: slideIn 0.32s cubic-bezier(0.22,1,0.36,1); }
  .dialect-panel::-webkit-scrollbar { width:5px; }
  .dialect-panel::-webkit-scrollbar-track { background:#0a0812; }
  .dialect-panel::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.45); border-radius:3px; }
  .d-tag { background:rgba(124,58,237,0.18); border:1px solid rgba(124,58,237,0.4); color:#c4b5fd; padding:3px 9px; border-radius:10px; font-size:10.5px; display:inline-block; margin:3px 2px; font-family:'Space Mono',monospace; }
  .era-dot { width:11px; height:11px; border-radius:50%; background:#3b1f6e; border:1.5px solid rgba(124,58,237,0.5); cursor:pointer; transition:all 0.2s; flex-shrink:0; }
  .era-dot.active { background:#a78bfa; border-color:#a78bfa; transform:scale(1.35); animation: glow 2s infinite; }
  .era-dot:hover:not(.active) { background:#7c3aed; border-color:#a78bfa; }
  .speak-btn { background:linear-gradient(135deg,#7c3aed 0%,#4c1d95 100%); border:none; color:#f0eee8; padding:11px 0; border-radius:9px; cursor:pointer; font-family:'Space Mono',monospace; font-size:12px; transition:all 0.2s; width:100%; letter-spacing:0.5px; }
  .speak-btn:hover:not(:disabled) { background:linear-gradient(135deg,#8b5cf6,#6d28d9); transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,58,237,0.4); }
  .speak-btn:disabled { opacity:0.55; cursor:not-allowed; }
  .close-btn { position:absolute; top:14px; right:14px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); color:#c4b5fd; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; z-index:2; padding:0; line-height:1; }
  .close-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }
  .era-nav-btn { flex:1; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.28); color:#c4b5fd; padding:9px 0; border-radius:8px; cursor:pointer; font-family:'Space Mono',monospace; font-size:11px; transition:all 0.2s; }
  .era-nav-btn:hover:not(:disabled) { background:rgba(124,58,237,0.25); }
  .era-nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
  input[type=range].tl-slider { -webkit-appearance:none; width:100%; height:3px; background:rgba(124,58,237,0.25); border-radius:2px; outline:none; cursor:pointer; }
  input[type=range].tl-slider::-webkit-slider-thumb { -webkit-appearance:none; width:15px; height:15px; background:linear-gradient(135deg,#7c3aed,#a78bfa); border-radius:50%; cursor:pointer; border:2px solid #1a1030; box-shadow:0 0 6px rgba(167,139,250,0.5); }
  .hint-pill { position:fixed; bottom:26px; left:50%; transform:translateX(-50%); background:rgba(10,8,18,0.82); color:rgba(196,181,253,0.9); padding:9px 22px; border-radius:20px; font-family:'Space Mono',monospace; font-size:11.5px; pointer-events:none; border:1px solid rgba(124,58,237,0.35); backdrop-filter:blur(8px); white-space:nowrap; }
`;

function DialectMap() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const selectedIdRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const dialectInfo = selectedCountry ? (DIALECT_DATA[selectedCountry] ?? null) : null;
  const currentEra = dialectInfo?.timeline[timelineIndex] ?? null;
  const totalEras = dialectInfo?.timeline.length ?? 0;

  const clearSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const speakSample = useCallback(() => {
    if (!currentEra || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentEra.sample);
    utter.lang = currentEra.accent;
    utter.rate = 0.82;
    utter.pitch = 1.0;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [currentEra]);

  const goEra = useCallback((delta) => {
    clearSpeech();
    setTimelineIndex(prev => Math.max(0, Math.min(totalEras - 1, prev + delta)));
  }, [clearSpeech, totalEras]);

  const setEra = useCallback((i) => {
    clearSpeech();
    setTimelineIndex(i);
  }, [clearSpeech]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2RyNjY0IiwiYSI6ImNtbTNnemljNjAwb3cycXF5Y2VuZGNoamwifQ.OcRTxaB1n23tj98mtjnKCw';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [10, 20],
      zoom: 2,
      projection: 'globe',
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current.on('style.load', () => {
      mapRef.current.setFog({ color: 'rgba(10,8,18,0.9)', 'high-color': '#1a1030', 'horizon-blend': 0.06 });

      mapRef.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
        promoteId: { country_boundaries: 'iso_3166_1_alpha_3' },
      });

      mapRef.current.addLayer({
        id: 'country-fills',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        filter: ['==', ['get', 'worldview'], 'all'],
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 'rgba(124,58,237,0.55)',
            ['boolean', ['feature-state', 'hovered'], false], 'rgba(124,58,237,0.22)',
            'rgba(80,80,160,0.08)',
          ],
          'fill-opacity': 1,
        },
      });

      mapRef.current.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        filter: ['==', ['get', 'worldview'], 'all'],
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 'rgba(167,139,250,0.75)',
            'rgba(100,100,200,0.22)',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 1.8,
            0.35,
          ],
        },
      });

      const setHover = (id, val) => {
        if (id == null) return;
        mapRef.current.setFeatureState(
          { source: 'countries', sourceLayer: 'country_boundaries', id },
          { hovered: val }
        );
      };

      const setSelected = (id, val) => {
        if (id == null) return;
        mapRef.current.setFeatureState(
          { source: 'countries', sourceLayer: 'country_boundaries', id },
          { selected: val }
        );
      };

      mapRef.current.on('mousemove', 'country-fills', (e) => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
        if (!e.features.length) return;
        if (hoveredIdRef.current !== e.features[0].id) {
          setHover(hoveredIdRef.current, false);
          hoveredIdRef.current = e.features[0].id;
          setHover(hoveredIdRef.current, true);
        }
      });

      mapRef.current.on('mouseleave', 'country-fills', () => {
        mapRef.current.getCanvas().style.cursor = '';
        setHover(hoveredIdRef.current, false);
        hoveredIdRef.current = null;
      });

      mapRef.current.on('click', 'country-fills', (e) => {
        if (!e.features.length) return;
        const feat = e.features[0];
        const rawName = feat.properties.name_en || feat.properties.iso_3166_1 || 'Unknown';
        const name = COUNTRY_NAME_MAP[rawName] || rawName;
        const fid = feat.id;

        setSelected(selectedIdRef.current, false);
        selectedIdRef.current = fid;
        setSelected(selectedIdRef.current, true);

        window.speechSynthesis?.cancel();
        setSelectedCountry(name);
        setTimelineIndex(0);
        setIsSpeaking(false);

        mapRef.current.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          zoom: Math.max(mapRef.current.getZoom(), 3.5),
          speed: 0.75,
        });
      });
    });

    return () => {
      window.speechSynthesis?.cancel();
      mapRef.current?.remove();
    };
  }, []);

  const closePanel = useCallback(() => {
    if (selectedIdRef.current != null && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: 'countries', sourceLayer: 'country_boundaries', id: selectedIdRef.current },
        { selected: false }
      );
      selectedIdRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setSelectedCountry(null);
    setIsSpeaking(false);
  }, []);

  const s = {
    panel: {
      position: 'fixed', top: 0, right: 0, width: '370px', height: '100vh',
      background: 'linear-gradient(180deg,#0f0a1e 0%,#130d24 60%,#0f0a1e 100%)',
      borderLeft: '1px solid rgba(124,58,237,0.28)',
      overflowY: 'auto', padding: '22px 20px 28px', color: '#f0eee8',
      fontFamily: "'Space Mono',monospace", zIndex: 1000,
      boxShadow: '-10px 0 50px rgba(0,0,0,0.7)',
    },
    label: { fontSize: '9.5px', color: '#7a7a8c', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '6px' },
    divider: { borderTop: '1px solid rgba(124,58,237,0.18)', margin: '18px 0' },
    eraBox: {
      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.28)',
      borderRadius: '12px', padding: '16px', marginBottom: '14px',
    },
    sampleBox: {
      background: 'rgba(0,0,0,0.35)', borderLeft: '3px solid #7c3aed',
      borderRadius: '0 8px 8px 0', padding: '11px 14px', margin: '12px 0',
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <style>{PANEL_CSS}</style>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />

      {!selectedCountry && (
        <div className="hint-pill">Click any country to explore its dialects &amp; accent history</div>
      )}

      {selectedCountry && (
        <div className="dialect-panel" style={s.panel}>
          <button className="close-btn" onClick={closePanel} title="Close">×</button>

          {dialectInfo ? (
            <>
              {/* ── Header ── */}
              <div style={{ paddingRight: '28px', marginBottom: '18px' }}>
                <div style={s.label}>{dialectInfo.region}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '21px', lineHeight: 1.2, color: '#f0eee8' }}>
                  {selectedCountry}
                </div>
                <div style={{ width: '36px', height: '2px', background: 'linear-gradient(90deg,#7c3aed,transparent)', marginTop: '10px' }} />
              </div>

              {/* ── Dialect Tags ── */}
              <div style={{ marginBottom: '16px' }}>
                <div style={s.label}>Primary Dialects</div>
                {dialectInfo.primaryDialects.map(d => <span key={d} className="d-tag">{d}</span>)}
              </div>

              {/* ── Overview ── */}
              <p style={{ fontSize: '11.5px', color: '#9090a8', lineHeight: '1.75', marginBottom: '0', paddingLeft: '11px', borderLeft: '2px solid rgba(124,58,237,0.35)' }}>
                {dialectInfo.overview}
              </p>

              <div style={s.divider} />

              {/* ── Timeline ── */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ ...s.label, marginBottom: '14px' }}>Accent Evolution Timeline</div>

                {/* Dot track */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {dialectInfo.timeline.map((t, i) => (
                    <React.Fragment key={i}>
                      <div
                        className={`era-dot${i === timelineIndex ? ' active' : ''}`}
                        onClick={() => setEra(i)}
                        title={`${t.era} · ${t.year}`}
                      />
                      {i < totalEras - 1 && (
                        <div style={{
                          flex: 1, height: '2px', transition: 'background 0.3s',
                          background: i < timelineIndex ? 'rgba(124,58,237,0.65)' : 'rgba(124,58,237,0.15)',
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Year labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  {dialectInfo.timeline.map((t, i) => (
                    <span
                      key={i}
                      onClick={() => setEra(i)}
                      style={{ fontSize: '9px', cursor: 'pointer', textAlign: 'center', transition: 'color 0.2s', color: i === timelineIndex ? '#a78bfa' : '#5a5a70' }}
                    >
                      {t.year}
                    </span>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  className="tl-slider"
                  min={0}
                  max={totalEras - 1}
                  value={timelineIndex}
                  onChange={e => setEra(Number(e.target.value))}
                />
              </div>

              {/* ── Current Era card ── */}
              {currentEra && (
                <div style={s.eraBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '17px', color: '#a78bfa' }}>{currentEra.era}</div>
                      <div style={{ fontSize: '10px', color: '#7a7a8c', marginTop: '1px' }}>{currentEra.year}</div>
                    </div>
                    <div style={{ background: 'rgba(124,58,237,0.28)', borderRadius: '6px', padding: '3px 8px', fontSize: '9.5px', color: '#c4b5fd', fontFamily: 'monospace' }}>
                      {currentEra.accent}
                    </div>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#9090a8', lineHeight: '1.75', marginBottom: '0' }}>
                    {currentEra.description}
                  </p>

                  {/* Sample phrase */}
                  <div style={s.sampleBox}>
                    <div style={s.label}>Sample Phrase</div>
                    <div style={{ fontSize: '12.5px', color: '#e0ddf0', fontStyle: 'italic', lineHeight: '1.55', marginTop: '4px' }}>
                      "{currentEra.sample}"
                    </div>
                  </div>

                  <button className="speak-btn" onClick={speakSample} disabled={isSpeaking}>
                    {isSpeaking
                      ? <span style={{ animation: 'pulse 1.1s infinite', display: 'inline-block' }}>◉ Speaking…</span>
                      : '▶  Hear Pronunciation'}
                  </button>
                </div>
              )}

              {/* ── Era navigation ── */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="era-nav-btn" onClick={() => goEra(-1)} disabled={timelineIndex === 0}>← Prev Era</button>
                <button className="era-nav-btn" onClick={() => goEra(1)} disabled={timelineIndex === totalEras - 1}>Next Era →</button>
              </div>
            </>
          ) : (
            /* ── No data fallback ── */
            <div style={{ paddingRight: '28px' }}>
              <div style={s.label}>Dialect Explorer</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '21px', color: '#f0eee8', marginBottom: '20px' }}>{selectedCountry}</div>
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.22)', borderRadius: '12px', padding: '22px', textAlign: 'center' }}>
                <div style={{ fontSize: '30px', marginBottom: '12px' }}>🗺️</div>
                <p style={{ fontSize: '12px', color: '#9090a8', lineHeight: '1.75' }}>
                  Detailed dialect data for <strong style={{ color: '#c4b5fd' }}>{selectedCountry}</strong> isn't available yet.
                </p>
                <p style={{ fontSize: '10.5px', color: '#7a7a8c', marginTop: '10px' }}>
                  Try: USA · UK · France · Germany · Spain · India · Australia · Brazil · Japan · Nigeria · Russia · China
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DialectMap;
