import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from './supabaseClient';

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

// Color per endangerment level — the "Sonic Bloom" palette
const ENDANGERMENT_COLORS = {
  safe:                   '#f5a623',  // vibrant gold  — active dialect
  vulnerable:             '#a78bfa',  // fading purple — mostly elderly speakers
  definitely_endangered:  '#8b5cf6',
  severely_endangered:    '#7c3aed',
  critically_endangered:  '#c4b5fd',
  extinct:                '#e6e6f0',  // ghostly white — historical archive
  unknown:                '#f5a623',
};

// Hardcoded sample recordings — replace / extend with real DB data later
const SAMPLE_RECORDINGS = [
  // Africa
  { id: 1,  language: 'Yoruba',            location: 'Ibadan, Nigeria',           lat: 7.3775,   lng: 3.9470,   endangerment: 'safe' },
  { id: 2,  language: 'Naija Pidgin',      location: 'Lagos, Nigeria',            lat: 6.5244,   lng: 3.3792,   endangerment: 'safe' },
  { id: 3,  language: 'Igbo',              location: 'Onitsha, Nigeria',          lat: 6.1667,   lng: 6.7833,   endangerment: 'safe' },
  { id: 4,  language: 'Efik',              location: 'Calabar, Nigeria',          lat: 4.9517,   lng: 8.3220,   endangerment: 'definitely_endangered' },
  { id: 5,  language: 'Amharic',           location: 'Addis Ababa, Ethiopia',     lat: 9.0250,   lng: 38.7469,  endangerment: 'safe' },
  { id: 6,  language: 'Tigrinya',          location: 'Mekelle, Ethiopia',         lat: 13.4967,  lng: 39.4769,  endangerment: 'vulnerable' },
  { id: 7,  language: 'Oromo',             location: 'Jimma, Ethiopia',           lat: 7.6667,   lng: 36.8333,  endangerment: 'safe' },
  // South & Southeast Asia
  { id: 8,  language: 'Hinglish',          location: 'Mumbai, India',             lat: 19.0760,  lng: 72.8777,  endangerment: 'safe' },
  { id: 9,  language: 'Kashmiri',          location: 'Srinagar, India',           lat: 34.0837,  lng: 74.7973,  endangerment: 'definitely_endangered' },
  { id: 10, language: 'Tamil',             location: 'Chennai, India',            lat: 13.0827,  lng: 80.2707,  endangerment: 'safe' },
  { id: 11, language: 'Punjabi',           location: 'Amritsar, India',           lat: 31.6340,  lng: 74.8723,  endangerment: 'safe' },
  { id: 12, language: 'Javanese',          location: 'Yogyakarta, Indonesia',     lat: -7.7956,  lng: 110.3695, endangerment: 'vulnerable' },
  { id: 13, language: 'Batak Toba',        location: 'Medan, Indonesia',          lat: 3.5952,   lng: 98.6722,  endangerment: 'definitely_endangered' },
  // East Asia
  { id: 14, language: 'Cantonese',         location: 'Guangzhou, China',          lat: 23.1291,  lng: 113.2644, endangerment: 'vulnerable' },
  { id: 15, language: 'Shanghainese',      location: 'Shanghai, China',           lat: 31.2304,  lng: 121.4737, endangerment: 'definitely_endangered' },
  { id: 16, language: 'Kansai-ben',        location: 'Osaka, Japan',              lat: 34.6937,  lng: 135.5023, endangerment: 'safe' },
  { id: 17, language: 'Tohoku dialect',    location: 'Sendai, Japan',             lat: 38.2688,  lng: 140.8721, endangerment: 'definitely_endangered' },
  { id: 18, language: 'Okinawan',          location: 'Naha, Japan',               lat: 26.2124,  lng: 127.6809, endangerment: 'critically_endangered' },
  // Europe
  { id: 19, language: 'Scottish Gaelic',   location: 'Inverness, Scotland',       lat: 57.4778,  lng: -4.2247,  endangerment: 'severely_endangered' },
  { id: 20, language: 'Welsh',             location: 'Bangor, Wales',             lat: 53.2274,  lng: -4.1293,  endangerment: 'vulnerable' },
  { id: 21, language: 'Cornish',           location: 'Penzance, England',         lat: 50.1187,  lng: -5.5374,  endangerment: 'extinct' },
  { id: 22, language: 'Basque',            location: 'San Sebastián, Spain',      lat: 43.3183,  lng: -1.9812,  endangerment: 'vulnerable' },
  { id: 23, language: 'Sicilian',          location: 'Palermo, Italy',            lat: 38.1157,  lng: 13.3615,  endangerment: 'definitely_endangered' },
  { id: 24, language: 'Geordie',           location: 'Newcastle, England',        lat: 54.9783,  lng: -1.6178,  endangerment: 'safe' },
  // Americas
  { id: 25, language: 'Yucatec Maya',      location: 'Mérida, Mexico',            lat: 20.9674,  lng: -89.5926, endangerment: 'definitely_endangered' },
  { id: 26, language: 'Classical Nahuatl', location: 'Cholula, Mexico',           lat: 19.0634,  lng: -98.3023, endangerment: 'extinct' },
  { id: 27, language: 'Carioca Portuguese',location: 'Rio de Janeiro, Brazil',    lat: -22.9068, lng: -43.1729, endangerment: 'safe' },
  { id: 28, language: 'Nordestino Portuguese', location: 'Salvador, Brazil',      lat: -12.9714, lng: -38.5014, endangerment: 'safe' },
  { id: 29, language: 'Costeño Spanish',   location: 'Barranquilla, Colombia',    lat: 10.9639,  lng: -74.7964, endangerment: 'safe' },
  // Oceania
  { id: 30, language: 'Tok Pisin',         location: 'Port Moresby, PNG',         lat: -9.4438,  lng: 147.1803, endangerment: 'safe' },
  { id: 31, language: 'Hiri Motu',         location: 'Bereina, PNG',              lat: -8.6000,  lng: 146.4833, endangerment: 'extinct' },
  // Middle East / North Africa
  { id: 32, language: 'Egyptian Arabic',   location: 'Cairo, Egypt',              lat: 30.0444,  lng: 31.2357,  endangerment: 'safe' },
  { id: 33, language: 'Saidi Arabic',      location: 'Luxor, Egypt',              lat: 25.6872,  lng: 32.6396,  endangerment: 'vulnerable' },
  // Russia
  { id: 34, language: 'Tatar',             location: 'Kazan, Russia',             lat: 55.7879,  lng: 49.1233,  endangerment: 'definitely_endangered' },
  { id: 35, language: 'Siberian Russian',  location: 'Novosibirsk, Russia',       lat: 55.0084,  lng: 82.9357,  endangerment: 'safe' },

  // ── Placeholder pins — full linguistic data, no audio yet ──────────────────
  // Africa
  { id: 101, language: 'Zulu',              location: 'Durban, South Africa',       lat: -29.8587, lng: 31.0218,  endangerment: 'safe',                  speakers: 12100000, hasAudio: false, description: 'The most widely spoken Bantu language in South Africa. Its click consonants, borrowed from Khoisan neighbours, give Zulu one of the richest sound inventories on Earth.' },
  { id: 102, language: 'Xhosa',             location: 'East London, South Africa',  lat: -32.9858, lng: 27.8635,  endangerment: 'safe',                  speakers: 8200000,  hasAudio: false, description: "Nelson Mandela's mother tongue. Xhosa's three distinct click consonants — dental, lateral, and palatal — mark it as one of the world's most phonologically complex languages." },
  { id: 103, language: 'Swahili',           location: 'Dar es Salaam, Tanzania',    lat: -6.7924,  lng: 39.2083,  endangerment: 'safe',                  speakers: 200000000,hasAudio: false, description: 'The lingua franca of East Africa for centuries. A Bantu tongue enriched by Arabic, Persian, and Portuguese — the word "safari" is Swahili for "journey."' },
  { id: 104, language: 'Wolof',             location: 'Dakar, Senegal',             lat: 14.7167,  lng: -17.4677, endangerment: 'safe',                  speakers: 5000000,  hasAudio: false, description: 'De facto national language of Senegal, spoken by over 90% of the population as first or second tongue. Known for its elaborate pronouns reflecting social hierarchy.' },
  { id: 105, language: 'Akan (Twi)',        location: 'Kumasi, Ghana',              lat: 6.6885,   lng: -1.6244,  endangerment: 'safe',                  speakers: 9000000,  hasAudio: false, description: 'Heart language of the Ashanti Kingdom. An Akan proverb says: "When the fool is told a proverb, its meaning has to be explained to him." Proverb-speech is the mark of wisdom here.' },
  { id: 106, language: 'Kinyarwanda',       location: 'Kigali, Rwanda',             lat: -1.9403,  lng: 29.8739,  endangerment: 'safe',                  speakers: 9800000,  hasAudio: false, description: "Rwanda is Africa's most linguistically unified country — virtually every citizen speaks the same indigenous language, a remarkable case of monolingualism without colonially imposed uniformity." },
  { id: 107, language: 'Lingala',           location: 'Kinshasa, DRC',              lat: -4.3317,  lng: 15.3139,  endangerment: 'safe',                  speakers: 2000000,  hasAudio: false, description: 'Born as a trade pidgin on the Congo River, Lingala became the language of Congolese rumba and soukous — music that electrified the world from the dance halls of Kinshasa.' },
  { id: 108, language: 'Bambara',           location: 'Bamako, Mali',               lat: 12.6392,  lng: -8.0029,  endangerment: 'safe',                  speakers: 3000000,  hasAudio: false, description: 'The trade language of the Niger River bend. Its oral traditions preserve the history of the Mali and Songhai empires in epic griot poetry — living archives sung from memory.' },
  { id: 109, language: 'Somali',            location: 'Mogadishu, Somalia',         lat: 2.0469,   lng: 45.3182,  endangerment: 'safe',                  speakers: 21800000, hasAudio: false, description: 'A language with one of the richest oral poetry traditions on Earth. Competitive verse-battle (gabay) is as serious as sport here — waged between clans, warlords, and generations.' },
  { id: 110, language: 'Shona',             location: 'Harare, Zimbabwe',           lat: -17.8252, lng: 31.0335,  endangerment: 'safe',                  speakers: 14200000, hasAudio: false, description: 'Descending from the builders of Great Zimbabwe\'s stone walls, Shona carries the heritage of the Munhumutapa empire in its tones, proverbs, and sacred spirit medium traditions.' },
  { id: 111, language: 'Malagasy',          location: 'Antananarivo, Madagascar',   lat: -18.9137, lng: 47.5361,  endangerment: 'safe',                  speakers: 25000000, hasAudio: false, description: "Madagascar's language is not African but Austronesian — Malagasy speakers arrived by outrigger canoe from Borneo over 1,500 years ago, crossing 6,000 kilometres of open ocean." },
  { id: 112, language: 'Tamazight (Berber)',location: 'Agadir, Morocco',            lat: 30.4278,  lng: -9.5981,  endangerment: 'vulnerable',            speakers: 8000000,  hasAudio: false, description: 'The indigenous language of North Africa, spoken for over 4,000 years before Arabic arrived. Written in the ancient Tifinagh script, Tamazight is experiencing a fragile revival.' },
  { id: 113, language: 'Fula (Fulfulde)',   location: 'Fouta Djalon, Guinea',       lat: 11.3678,  lng: -12.3631, endangerment: 'safe',                  speakers: 40000000, hasAudio: false, description: 'Spread across a belt from Senegal to Sudan by pastoral Fulani nomads — one of Africa\'s most geographically dispersed languages, a diaspora written in livestock trails.' },
  { id: 114, language: 'Dogon',             location: 'Bandiagara Escarpment, Mali',lat: 14.3476,  lng: -3.6103,  endangerment: 'vulnerable',            speakers: 800000,   hasAudio: false, description: 'Perched in ancient cliff-dwellings above the Sahara, Dogon people preserved a language of such cosmological complexity that their star knowledge still baffles modern astronomers.' },
  { id: 115, language: 'Hadza',             location: 'Lake Eyasi, Tanzania',       lat: -3.6761,  lng: 35.0683,  endangerment: 'critically_endangered', speakers: 1300,     hasAudio: false, description: 'One of the last click-language hunter-gatherer tongues with no known relatives — Hadza may be a linguistic survivor from humanity\'s earliest days in the Rift Valley. Fewer than 1,300 speakers.' },
  { id: 116, language: "Ju|'hoansi (!Kung)",location: 'Tsumkwe, Namibia',           lat: -19.6400, lng: 20.4900,  endangerment: 'vulnerable',            speakers: 14000,    hasAudio: false, description: 'With four distinct click consonants and a territory spanning Namibia and Botswana, the Ju|\'hoansi carry 10,000 years of hunter-gatherer ecological knowledge in their language.' },
  { id: 117, language: 'Dinka',             location: 'Juba, South Sudan',          lat: 4.8594,   lng: 31.5713,  endangerment: 'safe',                  speakers: 4500000,  hasAudio: false, description: 'The most widely spoken language of South Sudan. Dinka has an elaborate tonal system — a single syllable spoken in four different tones carries four entirely unrelated meanings.' },
  // Middle East / Caucasus
  { id: 118, language: 'Kurdish (Kurmanji)',location: 'Diyarbakır, Turkey',         lat: 37.9114,  lng: 40.2351,  endangerment: 'vulnerable',            speakers: 15000000, hasAudio: false, description: 'The most spoken language without a state. Spread across Turkey, Iraq, Iran, and Syria, Kurdish survived decades of school bans and broadcasting prohibitions yet thrives in its mountain homeland.' },
  { id: 119, language: 'Armenian',          location: 'Yerevan, Armenia',           lat: 40.1872,  lng: 44.5152,  endangerment: 'safe',                  speakers: 3500000,  hasAudio: false, description: 'An entire branch of the Indo-European family occupied by a single language. Armenian survived the 1915 genocide that killed 1.5 million of its speakers, preserved in diaspora communities worldwide.' },
  { id: 120, language: 'Georgian',          location: 'Tbilisi, Georgia',           lat: 41.6938,  lng: 44.8015,  endangerment: 'safe',                  speakers: 3700000,  hasAudio: false, description: 'One of the world\'s oldest literary languages with its own unique script created in the 5th century. Notable for consonant clusters: "gvprtskvnis" means "he peels it" — 8 consonants, no vowels.' },
  { id: 121, language: 'Pashto',            location: 'Kandahar, Afghanistan',      lat: 31.6130,  lng: 65.7100,  endangerment: 'safe',                  speakers: 60000000, hasAudio: false, description: 'The language of the Pashtunwali tribal code. Pashto poetry — from ancient war epics to romantic verses — is recited from memory at every gathering across Afghanistan and Pakistan.' },
  // South Asia
  { id: 122, language: 'Nepali',            location: 'Kathmandu, Nepal',           lat: 27.7172,  lng: 85.3240,  endangerment: 'safe',                  speakers: 17000000, hasAudio: false, description: 'The official language of Nepal, spoken in the shadow of the Himalayas. Nepali is the lingua franca for over 120 indigenous ethnic groups across one of the world\'s most linguistically diverse nations.' },
  { id: 123, language: 'Sinhala',           location: 'Colombo, Sri Lanka',         lat: 6.9271,   lng: 79.8612,  endangerment: 'safe',                  speakers: 17000000, hasAudio: false, description: 'An Indo-Aryan outlier in a Dravidian sea, Sinhala developed in remarkable isolation on the island of Sri Lanka. Its ancient Pali Buddhist literary tradition stretches back over 2,000 years.' },
  { id: 124, language: 'Telugu',            location: 'Hyderabad, India',           lat: 17.3850,  lng: 78.4867,  endangerment: 'safe',                  speakers: 82000000, hasAudio: false, description: 'The "Italian of the East" — linguists gave Telugu this nickname for its melodic quality, where almost every word ends in a vowel. Classical poetry from the Vijayanagara Empire still moves audiences today.' },
  { id: 125, language: 'Tibetan',           location: 'Lhasa, Tibet',               lat: 29.6520,  lng: 91.1172,  endangerment: 'definitely_endangered', speakers: 1200000,  hasAudio: false, description: 'The vessel of Vajrayana Buddhism, Tibetan preserves a medical, philosophical, and astronomical tradition 1,300 years deep. Inside Tibet, Mandarin systematically displaces it in schools.' },
  { id: 126, language: 'Uyghur',            location: 'Kashgar, China',             lat: 39.4707,  lng: 75.9897,  endangerment: 'vulnerable',            speakers: 12000000, hasAudio: false, description: 'A Turkic language with a rich Silk Road literary heritage — muqam music, oral epic, Uyghur Kingdom manuscripts. Now facing severe transmission challenges in Xinjiang.' },
  // East Asia
  { id: 127, language: 'Mongolian',         location: 'Ulaanbaatar, Mongolia',      lat: 47.8864,  lng: 106.9057, endangerment: 'safe',                  speakers: 5200000,  hasAudio: false, description: 'The language that once commanded an empire from Korea to Vienna. Written Mongolian, read vertically in its classical script, is a 900-year unbroken literary tradition still alive in Inner Mongolia.' },
  { id: 128, language: 'Ainu',              location: 'Nibutani, Japan',            lat: 42.5640,  lng: 142.1280, endangerment: 'critically_endangered', speakers: 10,       hasAudio: false, description: 'The indigenous language of Hokkaido with no known relatives anywhere on Earth. In 2019 Japan officially recognised Ainu people as indigenous — but only ~10 fluent elders remain. Each funeral is a library burning.' },
  { id: 129, language: 'Manchu',            location: 'Shenyang, China',            lat: 41.7968,  lng: 123.4328, endangerment: 'critically_endangered', speakers: 20,       hasAudio: false, description: 'Once the imperial tongue of the Qing Dynasty — 200 years of Chinese imperial edicts, court records, and military commands. Fewer than 20 fluent speakers survive, all elderly, in one remote village.' },
  { id: 130, language: 'Naxi (Dongba)',     location: 'Lijiang, China',             lat: 26.8721,  lng: 100.2299, endangerment: 'definitely_endangered', speakers: 300000,   hasAudio: false, description: "The Naxi Dongba script is the world's only pictographic writing system still in active use. Naxi priests chant cosmological texts in a ceremonial register different from everyday speech." },
  // Southeast Asia
  { id: 131, language: 'Burmese',           location: 'Yangon, Myanmar',            lat: 16.8661,  lng: 96.1951,  endangerment: 'safe',                  speakers: 33000000, hasAudio: false, description: 'A Sino-Tibetan language with a circular script from the Brahmic family. The formal written language and colloquial spoken Burmese differ so starkly that scholars classify it as diglossia.' },
  { id: 132, language: 'Khmer',             location: 'Phnom Penh, Cambodia',       lat: 11.5564,  lng: 104.9282, endangerment: 'safe',                  speakers: 16000000, hasAudio: false, description: 'The oldest written language in Southeast Asia, with inscriptions from 611 CE. Khmer built Angkor Wat and encoded its hydraulic engineering knowledge in stone inscriptions that still resist full translation.' },
  { id: 133, language: 'Tagalog',           location: 'Manila, Philippines',        lat: 14.5995,  lng: 120.9842, endangerment: 'safe',                  speakers: 28000000, hasAudio: false, description: 'The basis of Filipino, spoken across 7,641 islands. Tagalog has six different verbal inflections to specify the semantic role of the most prominent participant in a sentence — a grammatical precision few languages match.' },
  { id: 134, language: 'Balinese',          location: 'Ubud, Bali',                 lat: -8.5069,  lng: 115.2625, endangerment: 'vulnerable',            speakers: 3300000,  hasAudio: false, description: 'A language with elaborate speech levels — you speak entirely differently to a king, an equal, or a servant. Balinese classical literature, gamelan, and shadow theatre are encoded in its ceremonial register.' },
  // Americas
  { id: 135, language: 'Quechua',           location: 'Cusco, Peru',                lat: -13.5320, lng: -71.9675, endangerment: 'vulnerable',            speakers: 8000000,  hasAudio: false, description: 'The tongue of the Inca Empire, spread across 4,000 km of South America by runners who memorised census data encoded in knotted strings (quipu). Today 8 million speakers keep it alive across the Andes.' },
  { id: 136, language: 'Aymara',            location: 'La Paz, Bolivia',            lat: -16.5000, lng: -68.1193, endangerment: 'definitely_endangered', speakers: 2200000,  hasAudio: false, description: 'Spoken beside Lake Titicaca, Aymara conceptualises time backwards: the past is "in front" (visible), the future is "behind" (unseen). A profound philosophical inversion encoded in grammar.' },
  { id: 137, language: 'Guaraní',           location: 'Asunción, Paraguay',         lat: -25.2867, lng: -57.6470, endangerment: 'safe',                  speakers: 6000000,  hasAudio: false, description: "One of the Western Hemisphere's great success stories — Guaraní is co-official with Spanish in Paraguay and spoken by 90% of the population regardless of ethnicity. Proof that indigenous languages can thrive." },
  { id: 138, language: 'Cherokee',          location: 'Tahlequah, Oklahoma',        lat: 35.9151,  lng: -94.9702, endangerment: 'severely_endangered',   speakers: 2000,     hasAudio: false, description: 'Cherokee achieved something unique in 1821: a full syllabary invented by one man — Sequoyah, who was illiterate in English. Within years, Cherokee had higher literacy rates than neighbouring white settlers. Now ~2,000 speakers.' },
  { id: 139, language: 'Navajo',            location: 'Window Rock, Arizona',       lat: 35.6789,  lng: -109.0448,endangerment: 'vulnerable',            speakers: 170000,   hasAudio: false, description: 'Navajo Code Talkers used this language as an unbreakable WWII cipher — its complexity proved machine-uncrackable. Today 170,000 speakers hold the American Southwest\'s deepest ecological and spiritual memory.' },
  { id: 140, language: 'Lakota',            location: 'Pine Ridge, South Dakota',   lat: 43.0325,  lng: -102.5560,endangerment: 'severely_endangered',   speakers: 2000,     hasAudio: false, description: 'The language of the Sioux Nation, keeper of the Black Hills. Lakota oral tradition preserves star knowledge and ecological wisdom accumulated over 10,000 years on the Great Plains. ~2,000 fluent speakers remain.' },
  { id: 141, language: 'Hawaiian',          location: 'Hilo, Hawaii',               lat: 19.7297,  lng: -155.0900,endangerment: 'severely_endangered',   speakers: 24000,    hasAudio: false, description: 'In 1896 Hawaiian was banned from its own homeland\'s schools. By 1985 fewer than 50 children grew up speaking it. The Pūnana Leo language nest movement pulled it back — 24,000 semi-fluent speakers now.' },
  { id: 142, language: 'Zapotec',           location: 'Oaxaca City, Mexico',        lat: 17.0732,  lng: -96.7266, endangerment: 'vulnerable',            speakers: 460000,   hasAudio: false, description: 'One of Mesoamerica\'s oldest continuous civilisations — Zapotec was being written at Monte Albán 2,500 years ago. It survives today as 50+ mutually unintelligible variants across Oaxaca\'s mountain valleys.' },
  { id: 143, language: 'Tzotzil',           location: 'San Cristóbal de las Casas', lat: 16.7370,  lng: -92.6376, endangerment: 'definitely_endangered', speakers: 404000,   hasAudio: false, description: 'A Mayan language spoken in the highlands of Chiapas. Tzotzil cosmology places the home at the centre of the universe — and Chamula, its ceremonial capital, has never been conquered. The language embeds that resistance.' },
  { id: 144, language: 'Mapudungun',        location: 'Temuco, Chile',              lat: -38.7396, lng: -72.5900, endangerment: 'definitely_endangered', speakers: 200000,   hasAudio: false, description: 'Language of the Mapuche — the only indigenous people who resisted both the Inca and Spanish empires. Its verb system can pack an entire complex sentence, with fifteen morphemes, into a single word.' },
  { id: 145, language: 'Wayuu',             location: 'Riohacha, Colombia',         lat: 11.5444,  lng: -72.9072, endangerment: 'safe',                  speakers: 400000,   hasAudio: false, description: 'The Wayuu weave their cosmology into mochila bags whose geometric patterns encode clan identity and knowledge — a textile language as rich as the spoken one.' },
  // Oceania
  { id: 146, language: 'Māori',             location: 'Rotorua, New Zealand',       lat: -38.1368, lng: 176.2497, endangerment: 'vulnerable',            speakers: 57000,    hasAudio: false, description: 'In 1987 Māori became an official language of New Zealand after decades of suppression. The Kōhanga Reo language nest movement created a generation of new speakers. Its oratory tradition (whaikōrero) is one of the world\'s great rhetorical arts.' },
  { id: 147, language: 'Samoan',            location: 'Apia, Samoa',                lat: -13.8506, lng: -171.7513,endangerment: 'safe',                  speakers: 510000,   hasAudio: false, description: 'The formal Samoan oratory tradition (lauga) requires years of apprenticeship. Chiefly speech and commoner speech are almost different languages — metaphor and ancestral reference are grammatically obligatory for leaders.' },
  { id: 148, language: 'Fijian',            location: 'Suva, Fiji',                 lat: -18.1416, lng: 178.4415, endangerment: 'safe',                  speakers: 300000,   hasAudio: false, description: 'Fijian grammar has a distinction most languages lack: separate pronouns for "you and I" vs "all of us including you." The inclusive/exclusive distinction matters so much it is grammatically obligatory.' },
  { id: 149, language: 'Chamorro',          location: 'Hagåtña, Guam',              lat: 13.4443,  lng: 144.7937, endangerment: 'critically_endangered', speakers: 45000,    hasAudio: false, description: 'After the 1668 Spanish colonisation killed 90% of the Chamorro population and banned the language for 200 years, it survived in whispers between grandmothers. A revitalisation movement now fights to pass it to children.' },
  { id: 150, language: 'Warlpiri',          location: 'Lajamanu, Australia',        lat: -18.3400, lng: 130.6300, endangerment: 'definitely_endangered', speakers: 3000,     hasAudio: false, description: 'A Central Australian language with four simultaneous spatial reference systems active in every sentence. Warlpiri dreamtime songs map the landscape in musical routes — meaning and geography fused into one.' },
  // Europe
  { id: 151, language: 'Breton',            location: 'Quimper, France',            lat: 47.9965,  lng: -4.0964,  endangerment: 'severely_endangered',   speakers: 200000,   hasAudio: false, description: 'Carried to Brittany by refugees fleeing Anglo-Saxon invasion in the 6th century. Breton\'s fishing villages once rang with it — but the French state\'s 150-year school ban left fewer than 200,000 speakers, almost none under 40.' },
  { id: 152, language: 'Occitan',           location: 'Toulouse, France',           lat: 43.6047,  lng: 1.4442,   endangerment: 'definitely_endangered', speakers: 150000,   hasAudio: false, description: 'The language of the troubadours — the medieval poets who invented courtly love and shaped all European lyric poetry. Occitan was the language of Provence and of the Cathar heresy. Fewer than 150,000 fluent speakers remain.' },
  { id: 153, language: 'Faroese',           location: 'Tórshavn, Faroe Islands',    lat: 62.0107,  lng: -6.7744,  endangerment: 'safe',                  speakers: 66000,    hasAudio: false, description: 'A Viking Norse language preserved in Atlantic isolation since the 9th century. With only 66,000 speakers, Faroese has astonishingly complete modern vocabulary — it coined its own words for "computer" and "television."' },
  { id: 154, language: 'Lower Sorbian',     location: 'Cottbus, Germany',           lat: 51.7563,  lng: 14.3329,  endangerment: 'critically_endangered', speakers: 7000,     hasAudio: false, description: 'The last Slavic language of Central Europe, spoken in Germany\'s Lusatia since the 6th century. With ~7,000 speakers in a German-dominated landscape, Lower Sorbian is a linguistic island barely holding its shore.' },
  { id: 155, language: 'Aromanian',         location: 'Bitola, North Macedonia',    lat: 41.0297,  lng: 21.3294,  endangerment: 'definitely_endangered', speakers: 100000,   hasAudio: false, description: 'A Latin tongue that survived in the Balkans while Rome crumbled. Aromanian-speaking Vlach shepherds walked transhumance routes from Greece to Albania for millennia, carrying Latin echoes through Orthodox mountains.' },
  { id: 156, language: 'Võro',              location: 'Võru, Estonia',              lat: 57.8344,  lng: 27.0178,  endangerment: 'vulnerable',            speakers: 75000,    hasAudio: false, description: 'A south Estonian language so distinct from standard Estonian that linguists debate whether it\'s a separate language. Its ancient runic song tradition (regilaul) stretches back millennia, surviving Soviet Russification.' },
  { id: 157, language: 'Romani',            location: 'Sofia, Bulgaria',            lat: 42.6977,  lng: 23.3219,  endangerment: 'vulnerable',            speakers: 3500000,  hasAudio: false, description: 'The diaspora tongue of the Roma people, descended from Punjabi-speaking migrants who left northwest India around the 9th century. Romani\'s Sanskrit-rooted grammar still echoes its distant Asian origin — a 1,500-year linguistic journey.' },
];

const ENDANGERMENT_LABELS = {
  safe:                   'Active dialect',
  vulnerable:             'Vulnerable — mostly elderly speakers',
  definitely_endangered:  'Endangered',
  severely_endangered:    'Severely endangered',
  critically_endangered:  'Critically endangered',
  extinct:                'Historical archive — no living speakers',
  unknown:                'Status unknown',
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
  @keyframes slideIn     { from { transform: translateX(100%);  opacity:0; } to { transform:translateX(0);  opacity:1; } }
  @keyframes slideInLeft { from { transform: translateX(-100%); opacity:0; } to { transform:translateX(0);  opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes glow  { 0%,100% { box-shadow:0 0 6px rgba(167,139,250,0.4); } 50% { box-shadow:0 0 14px rgba(167,139,250,0.9); } }

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
  .mapboxgl-popup-content { background:#0f0a1e !important; border:1px solid rgba(124,58,237,0.45) !important; border-radius:12px !important; padding:14px !important; box-shadow:0 6px 28px rgba(0,0,0,0.8) !important; font-family:'Space Mono',monospace; }
  .mapboxgl-popup-close-button { color:#c4b5fd !important; font-size:18px !important; top:8px !important; right:10px !important; background:none !important; }
  .mapboxgl-popup-close-button:hover { color:#fff !important; }
  .mapboxgl-popup-tip { border-top-color:#0f0a1e !important; }

  @keyframes crumbIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .breadcrumb-bar { animation: crumbIn 0.28s cubic-bezier(0.22,1,0.36,1); }
  .crumb-btn { background:none; border:none; padding:0 2px; font-family:'Space Mono',monospace; font-size:11px; color:#a78bfa; cursor:pointer; transition:color 0.18s; line-height:1; }
  .crumb-btn:hover { color:#e2d9ff; }
  .crumb-btn.crumb-current { color:#f0eee8; cursor:default; pointer-events:none; }
  .crumb-sep { color:rgba(124,58,237,0.38); font-size:11px; margin:0 6px; user-select:none; }
`;

// ── UNESCO Atlas of the World's Languages in Danger (2010, updated figures) ──
// Out of ~7,168 documented languages:
//   Viable (not in Atlas):   ~4,200   (58.6 %)
//   At Risk (all threat lvls): ~2,279 (31.8 %)  ← tracked by UNESCO
//   Documented extinct since 1950: ~230+  (3.2 %)
//   Unknown/uncategorised:   ~459    (6.4 %)
// Commonly cited headline: "40 % of the world's languages face extinction."
const UNESCO_BREAKDOWN = [
  { color: '#f5a623', label: 'Viable',   sub: 'actively spoken',        count: '~4,200', pct: 0.586 },
  { color: '#a78bfa', label: 'At risk',  sub: 'UNESCO Atlas entries',   count: '~2,279', pct: 0.318 },
  { color: '#e6e6f0', label: 'Extinct',  sub: 'lost since 1950',        count: '230+',   pct: 0.032 },
];

const LOCAL_SAFE    = SAMPLE_RECORDINGS.filter(r => r.endangerment === 'safe'   || r.endangerment === 'unknown').length;
const LOCAL_AT_RISK = SAMPLE_RECORDINGS.filter(r => ['vulnerable','definitely_endangered','severely_endangered','critically_endangered'].includes(r.endangerment)).length;
const LOCAL_EXTINCT = SAMPLE_RECORDINGS.filter(r => r.endangerment === 'extinct').length;

function EndangermentMeterWidget() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId;
    const startAt = performance.now() + 700;
    const duration = 1900;

    const tick = (now) => {
      if (now < startAt) { rafId = requestAnimationFrame(tick); return; }
      const t = Math.min((now - startAt) / duration, 1);
      setProgress(1 - Math.pow(1 - t, 3)); // ease-out cubic
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // SVG donut geometry
  const R = 44, SW = 9, CX = 60, CY = 62;
  const C = 2 * Math.PI * R;
  const sweepLen = C * 0.75; // 270° arc

  // Stagger each segment so they "bloom" in sequence
  const p1 = Math.min(progress / 0.65, 1);
  const p2 = Math.min(Math.max((progress - 0.18) / 0.65, 0), 1);
  const p3 = Math.min(Math.max((progress - 0.36) / 0.65, 0), 1);

  const safeLen = p1 * UNESCO_BREAKDOWN[0].pct * sweepLen;
  const riskLen = p2 * UNESCO_BREAKDOWN[1].pct * sweepLen;
  const extLen  = p3 * UNESCO_BREAKDOWN[2].pct * sweepLen;

  // UNESCO at-risk breakdown detail rows
  const UNESCO_DETAIL = [
    { label: 'Vulnerable',            count: 607 },
    { label: 'Definitely endangered', count: 632 },
    { label: 'Severely endangered',   count: 502 },
    { label: 'Critically endangered', count: 538 },
  ];

  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      position: 'fixed', top: 16, left: 16, zIndex: 10,
      width: 204,
      background: 'rgba(10,8,18,0.88)',
      border: '1px solid rgba(124,58,237,0.32)',
      borderRadius: 14, padding: '14px 16px 12px',
      fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9090a8',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      animation: 'slideInLeft 0.38s cubic-bezier(0.22,1,0.36,1)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
        <div>
          <div style={{ color: '#6b6b80', letterSpacing: '1.6px', fontSize: 9, textTransform: 'uppercase' }}>
            Language Vitality
          </div>
          <div style={{ color: 'rgba(196,181,253,0.5)', fontSize: 8.5, marginTop: 2 }}>
            UNESCO Atlas · 7,168 languages
          </div>
        </div>
        {/* expand/collapse detail */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa', borderRadius: 6, padding: '2px 6px',
            fontSize: 9, cursor: 'pointer', fontFamily: "'Space Mono',monospace",
            lineHeight: 1.4, flexShrink: 0, marginTop: 1,
          }}
        >{expanded ? '−' : '+'}</button>
      </div>

      {/* 270° donut arc */}
      <svg width={120} height={106} style={{ display: 'block', margin: '10px auto 4px' }}>
        <g transform={`rotate(135, ${CX}, ${CY})`}>
          {/* gray track */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth={SW}
            strokeDasharray={`${sweepLen} ${C - sweepLen}`} />
          {/* viable — gold */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="#f5a623" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, safeLen - 0.8)} ${C}`}
            strokeDashoffset={0} />
          {/* at-risk — purple */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="#a78bfa" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, riskLen - 0.8)} ${C}`}
            strokeDashoffset={-safeLen} />
          {/* extinct — ghostly white */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="#e6e6f0" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, extLen - 0.5)} ${C}`}
            strokeDashoffset={-(safeLen + riskLen)} />
          {/* small gap dot between segments (cosmetic separator) */}
          {safeLen > 1 && <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="rgba(10,8,18,0.9)" strokeWidth={SW + 1} strokeLinecap="butt"
            strokeDasharray={`0.5 ${C}`} strokeDashoffset={-safeLen} />}
          {(safeLen + riskLen) > 1 && <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="rgba(10,8,18,0.9)" strokeWidth={SW + 1} strokeLinecap="butt"
            strokeDasharray={`0.5 ${C}`} strokeDashoffset={-(safeLen + riskLen)} />}
        </g>
        {/* center: headline figure */}
        <text x={CX} y={CY - 8} textAnchor="middle"
          fill="#f0eee8" fontSize={20} fontWeight="800"
          fontFamily="'Syne', sans-serif">
          40%
        </text>
        <text x={CX} y={CY + 7} textAnchor="middle"
          fill="#6b6b80" fontSize={8}
          fontFamily="'Space Mono', monospace" letterSpacing={1}>
          AT RISK
        </text>
        <text x={CX} y={CY + 18} textAnchor="middle"
          fill="rgba(124,58,237,0.5)" fontSize={7.5}
          fontFamily="'Space Mono', monospace">
          of 7,000+ languages
        </text>
      </svg>

      {/* Three summary rows */}
      {UNESCO_BREAKDOWN.map(({ color, label, count }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              display: 'inline-block', background: color,
              boxShadow: `0 0 5px ${color}88`,
            }} />
            <span style={{ color: '#9090a8' }}>{label}</span>
          </div>
          <span style={{ color: '#c4b5fd', fontWeight: 700 }}>{count}</span>
        </div>
      ))}

      {/* Expanded UNESCO breakdown panel */}
      {expanded && (
        <div style={{
          marginTop: 8,
          background: 'rgba(124,58,237,0.07)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 8, padding: '9px 10px',
        }}>
          <div style={{ color: '#6b6b80', fontSize: 8, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 7 }}>
            UNESCO threat levels
          </div>
          {UNESCO_DETAIL.map(({ label, count }) => {
            const barW = Math.round((count / 2279) * 100);
            return (
              <div key={label} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 8.5 }}>
                  <span style={{ color: '#9090a8' }}>{label}</span>
                  <span style={{ color: '#c4b5fd' }}>{count.toLocaleString()}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', width: `${barW}%`,
                    background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                    borderRadius: 2,
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 8, fontSize: 8, color: 'rgba(124,58,237,0.55)', lineHeight: 1.5 }}>
            Source: UNESCO Atlas of the<br />World's Languages in Danger
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(124,58,237,0.15)', margin: '10px 0 8px' }} />

      {/* Local sample mini-bar */}
      <div style={{ color: '#6b6b80', fontSize: 8.5, marginBottom: 5 }}>
        Mapped sample · {SAMPLE_RECORDINGS.length} dialects
      </div>
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', gap: 1 }}>
        <div style={{ flex: LOCAL_SAFE,    background: '#f5a623', opacity: 0.8 }} />
        <div style={{ flex: LOCAL_AT_RISK, background: '#a78bfa', opacity: 0.8 }} />
        <div style={{ flex: LOCAL_EXTINCT, background: '#e6e6f0', opacity: 0.8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 8 }}>
        <span>{LOCAL_SAFE} viable</span>
        <span>{LOCAL_AT_RISK} at risk</span>
        <span>{LOCAL_EXTINCT} extinct</span>
      </div>
    </div>
  );
}


// ── HuggingFace: ylacombe/english_dialects ──────────────────────────────────
// 6 British-Isles dialect regions, 17,877 samples, CC BY-SA 4.0
// One sample per region is fetched at runtime from the Datasets Server API.
const HF_DATASET   = 'ylacombe/english_dialects';
const HF_API_BASE  = 'https://datasets-server.huggingface.co';

const HF_DIALECT_CONFIGS = [
  { config: 'irish_male',     language: 'Irish English',          location: 'Dublin, Ireland',       lat: 53.3498, lng: -6.2603  },
  { config: 'welsh_male',     language: 'Welsh English',          location: 'Cardiff, Wales',        lat: 51.4816, lng: -3.1791  },
  { config: 'scottish_male',  language: 'Scottish English',       location: 'Edinburgh, Scotland',   lat: 55.9533, lng: -3.1883  },
  { config: 'northern_male',  language: 'Northern English',       location: 'Manchester, England',   lat: 53.4808, lng: -2.2426  },
  { config: 'southern_male',  language: 'Southern English (RP)',  location: 'London, England',       lat: 51.5074, lng: -0.1278  },
  { config: 'midlands_male',  language: 'Midlands English',       location: 'Birmingham, England',   lat: 52.4862, lng: -1.8904  },
];

async function fetchHFDialects() {
  const results = await Promise.all(
    HF_DIALECT_CONFIGS.map(async (cfg, i) => {
      try {
        const url = `${HF_API_BASE}/rows?dataset=${HF_DATASET}&config=${cfg.config}&split=train&offset=${i * 3}&length=1`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const json = await res.json();
        const row  = json.rows?.[0]?.row;
        if (!row) return null;
        return {
          id:           `hf_${cfg.config}`,
          language:     cfg.language,
          location:     cfg.location,
          lat:          cfg.lat,
          lng:          cfg.lng,
          endangerment: 'safe',
          hf_text:      row.text ?? '',
          hf_audio_src: row.audio?.[0]?.src ?? row.audio?.src ?? '',
          hf_speaker:   row.speaker_id ?? '',
          hf_config:    cfg.config,
        };
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

function toGeoJSONFeature(rec) {
  return {
    type: 'Feature',
    properties: {
      id:           String(rec.id),
      language:     rec.language,
      location:     rec.location,
      endangerment: rec.endangerment,
      pulse_image:  getPulseImageName(rec.endangerment),
      hf_text:      rec.hf_text      ?? '',
      hf_audio_src: rec.hf_audio_src ?? '',
      hf_speaker:   rec.hf_speaker   ?? '',
      has_audio:    rec.hasAudio !== false,
      speakers:     rec.speakers  ?? 0,
      description:  rec.description ?? '',
    },
    geometry: { type: 'Point', coordinates: [rec.lng, rec.lat] },
  };
}

function getPulseImageName(endangerment) {
  if (endangerment === 'extinct') return 'pulse-extinct';
  if (endangerment === 'safe' || endangerment === 'unknown') return 'pulse-safe';
  return 'pulse-endangered';
}

function ReferenceSection({ recordings }) {
  if (!recordings || recordings.length === 0) return null;
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(124,58,237,0.18)', margin: '18px 0' }} />
      <div style={{ fontSize: '9.5px', color: '#7a7a8c', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
        Reference Archive ({recordings.length})
      </div>
      {recordings.map(r => (
        <div key={r.id} style={{
          background: 'rgba(60,20,120,0.12)',
          border: '1px solid rgba(124,58,237,0.18)',
          borderRadius: '10px',
          padding: '13px',
          marginBottom: '10px',
        }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '13px', color: '#c4b5fd', marginBottom: '3px' }}>
            {r.accent_name}
          </div>
          <div style={{ fontSize: '9.5px', color: '#7a7a8c', marginBottom: '6px' }}>
            {[r.urban_rural, r.proficiency_level, r.speaker_age_range].filter(Boolean).join(' · ')}
          </div>
          {r.additional_notes && (
            <p style={{ fontSize: '10.5px', color: '#9090a8', lineHeight: '1.6', marginBottom: '8px' }}>
              {r.additional_notes}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '9.5px', color: '#5a5a70', fontFamily: "'Space Mono',monospace" }}>
              {r.audio_source}
            </span>
            {r.direct_audio_url && (
              <a
                href={r.direct_audio_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '10px', color: '#a78bfa',
                  fontFamily: "'Space Mono',monospace",
                  textDecoration: 'none',
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(124,58,237,0.35)',
                  padding: '3px 10px', borderRadius: '6px',
                }}
              >
                Listen ↗
              </a>
            )}
          </div>
          {r.license && (
            <div style={{ fontSize: '8.5px', color: '#4a4a5a', marginTop: '6px' }}>{r.license}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function CommunitySection({ uploads }) {
  if (!uploads || uploads.length === 0) return null;
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(124,58,237,0.18)', margin: '18px 0' }} />
      <div style={{ fontSize: '9.5px', color: '#7a7a8c', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
        Community Recordings ({uploads.length})
      </div>
      {uploads.map(u => (
        <div key={u.id} style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.22)',
          borderRadius: '10px',
          padding: '13px',
          marginBottom: '10px',
        }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '14px', color: '#c4b5fd', marginBottom: '3px' }}>
            {u.language_name}
          </div>
          <div style={{ fontSize: '9.5px', color: '#7a7a8c', marginBottom: '8px' }}>
            {[u.town, u.region, u.country].filter(Boolean).join(' · ')}
            {u.speaker_age_range && ` · ${u.speaker_age_range}`}
          </div>
          {u.description && (
            <p style={{ fontSize: '11px', color: '#9090a8', lineHeight: '1.65', marginBottom: '8px' }}>
              {u.description}
            </p>
          )}
          {u.audio_url && (
            <audio controls src={u.audio_url} style={{ width: '100%', height: '30px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Breadcrumb({ crumbs }) {
  if (!crumbs || crumbs.length <= 1) return null;
  return (
    <div className="breadcrumb-bar" style={{
      position: 'fixed', top: '62px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center',
      background: 'rgba(10,8,18,0.78)',
      border: '1px solid rgba(124,58,237,0.22)',
      borderRadius: '20px', padding: '6px 18px',
      backdropFilter: 'blur(14px)',
      zIndex: 30, whiteSpace: 'nowrap',
    }}>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.label}>
          {i > 0 && <span className="crumb-sep">›</span>}
          <button
            className={`crumb-btn${i === crumbs.length - 1 ? ' crumb-current' : ''}`}
            onClick={crumb.onClick}
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function DialectMap({ onStartProtocol, onGoUpload, onOpenEcho }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const selectedIdRef = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);
  const mapReadyRef = useRef(false);
  const hfDataRef = useRef(null);       // HF samples once fetched
  const sourceReadyRef = useRef(false); // true after recordings source is added to map

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [communityUploads, setCommunityUploads] = useState([]);
  const [dialectRecordings, setDialectRecordings] = useState([]);
  const [hfCount, setHfCount] = useState(0);

  // CSV country names differ from DIALECT_DATA keys — normalise them
  const CSV_COUNTRY_MAP = {
    'USA': 'United States', 'UK': 'United Kingdom',
    'South Korea': 'South Korea', 'Saudi Arabia': 'Saudi Arabia',
  };
  const normCountry = (c) => CSV_COUNTRY_MAP[c] || c;

  const dialectInfo = selectedCountry ? (DIALECT_DATA[selectedCountry] ?? null) : null;
  const communityForCountry = selectedCountry
    ? communityUploads.filter(u => u.country?.toLowerCase() === selectedCountry.toLowerCase())
    : [];
  const referenceForCountry = selectedCountry
    ? dialectRecordings.filter(r => normCountry(r.country)?.toLowerCase() === selectedCountry.toLowerCase())
    : [];

  // Fetch community uploads once on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('community_uploads').select('*').then(({ data }) => {
      if (data) setCommunityUploads(data);
    });
  }, []);

  // Fetch reference recordings (from CSV seed) once on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('dialect_recordings').select('*').then(({ data }) => {
      if (data) setDialectRecordings(data);
    });
  }, []);

  // Fetch HuggingFace dialect samples and merge into the globe's recordings source
  useEffect(() => {
    fetchHFDialects().then(hfSamples => {
      hfDataRef.current = hfSamples;
      setHfCount(hfSamples.length);
      // If the map source is already ready, update it now; otherwise style.load will handle it
      if (sourceReadyRef.current && mapRef.current?.getSource('recordings')) {
        const existing = SAMPLE_RECORDINGS.map(toGeoJSONFeature);
        const hf       = hfSamples.map(toGeoJSONFeature);
        mapRef.current.getSource('recordings').setData({
          type: 'FeatureCollection',
          features: [...existing, ...hf],
        });
      }
    }).catch(() => {});
  }, []);

  // Re-render map markers whenever uploads or map-ready state changes
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    communityUploads.forEach(upload => {
      if (upload.latitude == null || upload.longitude == null) return;
      const el = document.createElement('div');
      el.style.cssText = `
        width:13px;height:13px;border-radius:50%;
        background:radial-gradient(circle,#a78bfa,#7c3aed);
        border:2px solid rgba(255,255,255,0.25);
        cursor:pointer;box-shadow:0 0 8px rgba(124,58,237,0.7);
        transition:transform 0.15s;
      `;
      el.onmouseenter = () => { el.style.transform = 'scale(1.4)'; };
      el.onmouseleave = () => { el.style.transform = ''; };
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: '220px' })
        .setHTML(`
          <div style="font-family:'Space Mono',monospace;background:#0f0a1e;color:#f0eee8;padding:10px 12px;border-radius:8px;border:1px solid rgba(124,58,237,0.3)">
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#a78bfa;margin-bottom:4px">${upload.language_name}</div>
            <div style="font-size:9.5px;color:#7a7a8c;margin-bottom:6px">${[upload.town, upload.region, upload.country].filter(Boolean).join(' · ')}</div>
            ${upload.description ? `<div style="font-size:10.5px;color:#9090a8;line-height:1.6;margin-bottom:8px">${upload.description}</div>` : ''}
            ${upload.audio_url ? `<audio controls src="${upload.audio_url}" style="width:100%;height:28px"></audio>` : ''}
          </div>
        `);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([upload.longitude, upload.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [communityUploads]);

  const currentEra = dialectInfo?.timeline[timelineIndex] ?? null;
  const totalEras = dialectInfo?.timeline.length ?? 0;

  const goEra = useCallback((delta) => {
    setTimelineIndex(prev => Math.max(0, Math.min(totalEras - 1, prev + delta)));
  }, [totalEras]);

  const setEra = useCallback((i) => {
    setTimelineIndex(i);
  }, []);

  useEffect(() => {
    // Play a real audio file URL — stops any previous clip first
    window._playAudio = (src) => {
      if (window._currentAudio) {
        window._currentAudio.pause();
        window._currentAudio.currentTime = 0;
      }
      const audio = new Audio(src);
      window._currentAudio = audio;
      audio.play().catch(() => {});
    };

    window._startProtocol = (lang) => {
      if (onStartProtocol) onStartProtocol(lang);
    };
    window._goUpload = () => {
      if (onGoUpload) onGoUpload();
    };
    window._openEcho = (language, location, audioSrc, text) => {
      if (onOpenEcho) onOpenEcho({ language, location, audioSrc, text });
    };

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
      mapReadyRef.current = true;
      // Re-trigger marker placement now that the map is ready
      setCommunityUploads(prev => [...prev]);
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
        filter: ['in', ['get', 'worldview'], ['literal', ['all', 'IN', 'CN', 'US', 'AR', 'MA', 'RU', 'TR', 'JP']]],
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
        // Don't trigger country selection when clicking a recording marker
        if (mapRef.current.queryRenderedFeatures(e.point, { layers: ['recordings-layer'] }).length > 0) return;

        const feat = e.features[0];
        const rawName = feat.properties.name_en || feat.properties.iso_3166_1 || 'Unknown';
        const name = COUNTRY_NAME_MAP[rawName] || rawName;
        const fid = feat.id;

        setSelected(selectedIdRef.current, false);
        selectedIdRef.current = fid;
        setSelected(selectedIdRef.current, true);

        setSelectedCountry(name);
        setTimelineIndex(0);

        mapRef.current.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          zoom: Math.max(mapRef.current.getZoom(), 3.5),
          speed: 0.75,
        });
      });

      // ── Sonic Bloom — WebGL animated image markers ──────────────────────────
      // Canvas-based animated images render in WebGL and stick properly to the
      // 3D globe surface, unlike DOM markers which are positioned in 2D screen space.

      function makePulseImage(hex, phaseOffset) {
        const size = 80;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),
          onAdd() {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            this.context = canvas.getContext('2d');
          },
          render() {
            const duration = 2800;
            const t  = ((performance.now() + phaseOffset)               % duration) / duration;
            const t2 = ((performance.now() + phaseOffset + duration / 2) % duration) / duration;
            const ctx = this.context;
            ctx.clearRect(0, 0, size, size);

            // Expanding ring 1
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, Math.max(0, (size / 2 - 2) * t), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, 0.85 - t * 1.1)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Expanding ring 2 (half-phase offset for continuous bloom)
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, Math.max(0, (size / 2 - 2) * t2), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, 0.85 - t2 * 1.1)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Soft glow halo behind core
            const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, 14);
            grd.addColorStop(0, `rgba(${r},${g},${b},0.45)`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 14, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Solid core dot
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},1)`;
            ctx.fill();

            this.data = ctx.getImageData(0, 0, size, size).data;
            mapRef.current.triggerRepaint();
            return true;
          },
        };
      }

      mapRef.current.addImage('pulse-safe',       makePulseImage('#f5a623', 0),    { pixelRatio: 2 });
      mapRef.current.addImage('pulse-endangered',  makePulseImage('#a78bfa', 933),  { pixelRatio: 2 });
      mapRef.current.addImage('pulse-extinct',     makePulseImage('#e6e6f0', 1866), { pixelRatio: 2 });

      const initialFeatures = SAMPLE_RECORDINGS.map(toGeoJSONFeature);
      mapRef.current.addSource('recordings', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: initialFeatures },
      });
      sourceReadyRef.current = true;
      // Merge HF samples if they arrived before style.load fired
      if (hfDataRef.current?.length) {
        mapRef.current.getSource('recordings').setData({
          type: 'FeatureCollection',
          features: [...initialFeatures, ...hfDataRef.current.map(toGeoJSONFeature)],
        });
      }

      mapRef.current.addLayer({
        id: 'recordings-layer',
        type: 'symbol',
        source: 'recordings',
        layout: {
          'icon-image': ['get', 'pulse_image'],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      mapRef.current.on('click', 'recordings-layer', (e) => {
        if (!e.features.length) return;
        const props  = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();
        const color  = ENDANGERMENT_COLORS[props.endangerment] ?? ENDANGERMENT_COLORS.safe;
        const badgeBg     = `${color}22`;
        const badgeBorder = `${color}66`;

        const speakerLine = props.speakers > 0
          ? `<div style="font-size:10px;color:#6b6b80;margin-top:5px;">~${Number(props.speakers).toLocaleString()} speakers</div>`
          : '';

        const header = `
          <div style="font-weight:700;font-size:13px;color:${color};margin-bottom:5px;">${props.language}</div>
          <div style="font-size:10px;color:#9090a8;margin-bottom:5px;">📍 ${props.location}</div>
          <div style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9.5px;
            background:${badgeBg};border:1px solid ${badgeBorder};color:${color};">
            ${ENDANGERMENT_LABELS[props.endangerment] ?? ''}
          </div>
          ${speakerLine}`;

        const isEndangered = ['vulnerable','definitely_endangered','severely_endangered','critically_endangered','extinct'].includes(props.endangerment);
        const safeLangName = (props.language ?? '').replace(/'/g, "\\'");

        const safeSrc = (props.hf_audio_src ?? '').replace(/'/g, '');

        let body;
        if (safeSrc) {
          // ── Pin with a real audio recording ──
          const transcript = props.hf_text
            ? `<div style="margin-top:7px;font-size:9px;color:#7a7a8c;font-style:italic;line-height:1.6;">"${props.hf_text}"</div>`
            : '';

          const safeLocation = (props.location ?? '').replace(/'/g, "\\'");
          const safeText     = (props.hf_text   ?? '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

          body = `
            <button onclick="window._playAudio('${safeSrc}')"
              style="margin-top:9px;width:100%;background:rgba(124,58,237,0.15);
                border:1px solid rgba(124,58,237,0.35);color:#c4b5fd;border-radius:7px;
                padding:7px 0;font-family:'Space Mono',monospace;font-size:10px;
                cursor:pointer;letter-spacing:0.5px;">
              ▶ Hear sample
            </button>
            ${transcript}
            <div style="margin-top:5px;font-size:7.5px;color:rgba(124,58,237,0.45);">🤗 real recording · CC BY-SA 4.0</div>
            <button onclick="window._openEcho('${safeLangName}','${safeLocation}','${safeSrc}','${safeText}')"
              style="margin-top:8px;width:100%;background:rgba(52,211,153,0.08);
                border:1px solid rgba(52,211,153,0.28);color:#6ee7b7;border-radius:7px;
                padding:7px 0;font-family:'Space Mono',monospace;font-size:10px;
                cursor:pointer;letter-spacing:0.5px;">
              ◉ Echo this voice
            </button>`;
        } else {
          // ── Placeholder pin — no audio yet ──
          const desc = props.description
            ? `<p style="font-size:10.5px;color:#9090a8;line-height:1.7;margin:10px 0 0;">${props.description}</p>`
            : '';

          const preserveBtn = isEndangered
            ? `<button onclick="window._startProtocol('${safeLangName}')"
                style="margin-top:10px;width:100%;background:rgba(196,181,253,0.12);
                  border:1px solid rgba(196,181,253,0.4);color:#e2d9ff;border-radius:7px;
                  padding:8px 0;font-family:'Space Mono',monospace;font-size:10px;
                  cursor:pointer;letter-spacing:0.5px;">
                ◉ Preserve this language
              </button>`
            : `<div onclick="window._goUpload()" style="margin-top:12px;padding:10px 12px;border-radius:8px;
                background:rgba(124,58,237,0.07);border:1px dashed rgba(124,58,237,0.28);text-align:center;cursor:pointer;"
                onmouseover="this.style.background='rgba(124,58,237,0.14)'"
                onmouseout="this.style.background='rgba(124,58,237,0.07)'">
                <div style="font-size:9.5px;color:#5a5a70;margin-bottom:4px;">No recordings in our archive yet.</div>
                <div style="font-size:10px;color:#a78bfa;">Be the first to contribute one ↗</div>
              </div>`;

          body = `${desc}${preserveBtn}`;
        }

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 16, maxWidth: '290px' })
          .setLngLat(coords)
          .setHTML(`<div style="padding:2px;">${header}${body}</div>`)
          .addTo(mapRef.current);
      });

      mapRef.current.on('mouseenter', 'recordings-layer', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', 'recordings-layer', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (window._currentAudio) { window._currentAudio.pause(); delete window._currentAudio; }
      delete window._playAudio;
      delete window._startProtocol;
      delete window._goUpload;
      delete window._openEcho;
      if (popupRef.current) popupRef.current.remove();
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
    setSelectedCountry(null);
  }, []);

  const flyToWorld = useCallback(() => {
    closePanel();
    mapRef.current?.flyTo({ center: [10, 20], zoom: 2, speed: 0.7 });
  }, [closePanel]);

  const s = {
    panel: {
      position: 'fixed', top: '48px', right: 0, width: '370px', height: 'calc(100vh - 48px)',
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

  const LEGEND = [
    { color: '#f5a623',  label: 'Active dialect' },
    { color: '#a78bfa',  label: 'Endangered / elderly speakers' },
    { color: '#e6e6f0',  label: 'Historical archive' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{PANEL_CSS}</style>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      <EndangermentMeterWidget />

      {!selectedCountry && (
        <div className="hint-pill">Click any country · Click a pulse to identify a dialect</div>
      )}

      {/* Voice counter */}
      <div style={{
        position: 'fixed', top: '62px', right: '16px',
        background: 'rgba(10,8,18,0.78)', border: '1px solid rgba(124,58,237,0.22)',
        borderRadius: '20px', padding: '6px 16px',
        fontFamily: "'Space Mono',monospace", fontSize: '10px', color: '#7a7a8c',
        backdropFilter: 'blur(14px)', zIndex: 30, whiteSpace: 'nowrap',
      }}>
        you are looking at{' '}
        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
          {(SAMPLE_RECORDINGS.length + hfCount + dialectRecordings.length + communityUploads.length).toLocaleString()}
        </span>
        {' '}voices
      </div>

      <Breadcrumb crumbs={[
        { label: 'World', onClick: flyToWorld },
        ...(selectedCountry ? [{ label: selectedCountry }] : []),
      ]} />

      {/* Sonic Bloom legend */}
      <div style={{
        position: 'fixed', bottom: 70, left: 16,
        background: 'rgba(10,8,18,0.82)', border: '1px solid rgba(124,58,237,0.28)',
        borderRadius: 12, padding: '10px 14px',
        fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#9090a8',
        backdropFilter: 'blur(8px)', zIndex: 10, lineHeight: 1,
      }}>
        <div style={{ marginBottom: 8, color: '#6b6b80', letterSpacing: '1.5px', fontSize: 9, textTransform: 'uppercase' }}>
          Sonic Bloom
        </div>
        {LEGEND.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block',
            }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {selectedCountry && (
        <div className="dialect-panel" style={s.panel}>
          <button className="close-btn" onClick={closePanel} title="Close">×</button>

          {dialectInfo ? (
            <>
              <div style={{ paddingRight: '28px', marginBottom: '18px' }}>
                <div style={s.label}>{dialectInfo.region}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '21px', lineHeight: 1.2, color: '#f0eee8' }}>
                  {selectedCountry}
                </div>
                <div style={{ width: '36px', height: '2px', background: 'linear-gradient(90deg,#7c3aed,transparent)', marginTop: '10px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={s.label}>Primary Dialects</div>
                {dialectInfo.primaryDialects.map(d => <span key={d} className="d-tag">{d}</span>)}
              </div>

              <p style={{ fontSize: '11.5px', color: '#9090a8', lineHeight: '1.75', marginBottom: '0', paddingLeft: '11px', borderLeft: '2px solid rgba(124,58,237,0.35)' }}>
                {dialectInfo.overview}
              </p>

              <div style={s.divider} />

              <div style={{ marginBottom: '18px' }}>
                <div style={{ ...s.label, marginBottom: '14px' }}>Accent Evolution Timeline</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {dialectInfo.timeline.map((t, i) => (
                    <React.Fragment key={i}>
                      <div className={`era-dot${i === timelineIndex ? ' active' : ''}`} onClick={() => setEra(i)} title={`${t.era} · ${t.year}`} />
                      {i < totalEras - 1 && (
                        <div style={{ flex: 1, height: '2px', transition: 'background 0.3s', background: i < timelineIndex ? 'rgba(124,58,237,0.65)' : 'rgba(124,58,237,0.15)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  {dialectInfo.timeline.map((t, i) => (
                    <span key={i} onClick={() => setEra(i)} style={{ fontSize: '9px', cursor: 'pointer', textAlign: 'center', transition: 'color 0.2s', color: i === timelineIndex ? '#a78bfa' : '#5a5a70' }}>
                      {t.year}
                    </span>
                  ))}
                </div>
                <input type="range" className="tl-slider" min={0} max={totalEras - 1} value={timelineIndex} onChange={e => setEra(Number(e.target.value))} />
              </div>

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
                  <p style={{ fontSize: '11.5px', color: '#9090a8', lineHeight: '1.75', marginBottom: '0' }}>{currentEra.description}</p>
                  <div style={s.sampleBox}>
                    <div style={s.label}>Sample Phrase</div>
                    <div style={{ fontSize: '12.5px', color: '#e0ddf0', fontStyle: 'italic', lineHeight: '1.55', marginTop: '4px' }}>"{currentEra.sample}"</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="era-nav-btn" onClick={() => goEra(-1)} disabled={timelineIndex === 0}>← Prev Era</button>
                <button className="era-nav-btn" onClick={() => goEra(1)} disabled={timelineIndex === totalEras - 1}>Next Era →</button>
              </div>

              {/* ── Reference Archive (from CSV database) ── */}
              <ReferenceSection recordings={referenceForCountry} />

              {/* ── Community Recordings ── */}
              <CommunitySection uploads={communityForCountry} />
            </>
          ) : (
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
              <ReferenceSection recordings={referenceForCountry} />
              <CommunitySection uploads={communityForCountry} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DialectMap;
