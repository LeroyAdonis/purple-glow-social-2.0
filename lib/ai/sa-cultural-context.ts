/**
 * South African Cultural Context Database
 * Provides language-specific phrases, expressions, and cultural data
 * for AI content generation with authentic local flavor
 * 
 * Reference: AI Localization Best Practices
 */

export interface LanguageContext {
  code: string;
  name: string;
  nativeName: string;
  greetings: string[];
  commonExpressions: string[];
  farewells: string[];
  encouragements: string[];
  celebrations: string[];
  culturalNotes: string;
  regions: string[];
  hashtags: string[];
}

/**
 * Complete cultural context for all 11 South African languages
 */
export const SA_LANGUAGE_CONTEXTS: Record<string, LanguageContext> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greetings: ['Howzit!', 'Hey there!', 'Molo!', 'Good day!', 'Hello Mzansi!'],
    commonExpressions: [
      'lekker', 'sharp sharp', 'eish', 'ja nee', 'now now', 
      'just now', 'shame', 'hectic', 'bru', 'boet', 'china',
      'voetsek', 'kiff', 'hundreds', 'shot', 'befok'
    ],
    farewells: ['Cheers!', 'Sharp!', 'Totsiens!', 'Later!', 'Stay lekker!'],
    encouragements: [
      "You've got this!", "Keep pushing!", "Ubuntu - we rise together!",
      "Stronger together!", "Make it happen!"
    ],
    celebrations: [
      "Ayoba!", "Yebo!", "Magic!", "What a time to be alive!",
      "Mzansi magic!", "Local is lekker!"
    ],
    culturalNotes: 'Use South African English with local slang naturally. Mix in expressions from other SA languages for authenticity.',
    regions: ['Joburg', 'Cape Town', 'Durban', 'Pretoria', 'Sandton', 'Soweto', 'Port Elizabeth', 'Bloemfontein'],
    hashtags: ['#Mzansi', '#SouthAfrica', '#LocalIsLekker', '#ProudlySA', '#MzansiMagic', '#SABusiness']
  },

  af: {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    greetings: ['Hallo!', 'Goeie môre!', 'Goeie dag!', 'Haai!', 'Hoe gaan dit?'],
    commonExpressions: [
      'baie lekker', 'sommer net so', 'nou-nou', 'ag shame', 'dis reg',
      'ja nee', 'eina', 'sies', 'voetsek', 'bakgat', 'lank laas',
      'aardvark', 'babelas', 'biltong'
    ],
    farewells: ['Totsiens!', 'Lekker dag!', 'Baai!', 'Sien jou!', 'Gaan lekker!'],
    encouragements: [
      'Hou moed!', 'Jy kan dit doen!', 'Sterkte!', 
      'Gaan voort!', 'Moenie moed opgee nie!'
    ],
    celebrations: [
      'Fantasties!', 'Wonderlik!', 'Baie goed!', 
      'Dis die lewe!', 'Lekker man!'
    ],
    culturalNotes: 'Use warm, authentic Afrikaans with natural expressions. Afrikaans speakers appreciate genuine language use.',
    regions: ['Kaapstad', 'Pretoria', 'Stellenbosch', 'Paarl', 'Bloemfontein', 'Johannesburg'],
    hashtags: ['#Afrikaans', '#SuidAfrika', '#TrotsAfrikaans', '#LekkerLewe', '#Mzansi']
  },

  zu: {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    greetings: ['Sawubona!', 'Sanibonani!', 'Yebo!', 'Kunjani?', 'Unjani?'],
    commonExpressions: [
      'Siyabonga', 'Ngiyabonga', 'Yebo', 'Hhayi bo!', 'Hawu!',
      'Uyazi', 'Shame', 'Eish', 'Manje', 'Kahle kahle'
    ],
    farewells: ['Sala kahle!', 'Hamba kahle!', 'Sobonana!', 'Uhambe kahle!', 'Usale kahle!'],
    encouragements: [
      'Ungakhathali!', 'Qhubeka!', 'Wena uyakwazi!',
      'Simunye - siyodlula!', 'Amandla!'
    ],
    celebrations: [
      'Halala!', 'Siyajabula!', 'Iyangithokozisa!',
      'Kuhle kakhulu!', 'Yebo!'
    ],
    culturalNotes: 'Use respectful isiZulu with proper greetings. The language has deep cultural significance and respect is paramount.',
    regions: ['eThekwini (Durban)', 'Pietermaritzburg', 'Richards Bay', 'Ulundi', 'KwaZulu-Natal'],
    hashtags: ['#isiZulu', '#KZN', '#Zulu', '#Ubuntu', '#Mzansi', '#Halala']
  },

  xh: {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    greetings: ['Molo!', 'Molweni!', 'Bhota!', 'Kunjani?', 'Uphila njani?'],
    commonExpressions: [
      'Enkosi', 'Ewe', 'Hayi', 'Hayi khona!', 'Yhu!',
      'Andazi', 'Kulungile', 'Camagu', 'Hayibo'
    ],
    farewells: ['Hamba kakuhle!', 'Sala kakuhle!', 'Sobonana!', 'Usale kakuhle!'],
    encouragements: [
      'Ungapheli mandla!', 'Qhubeka!', 'Awoyiki!',
      'Simunye!', 'Ubuntu bunye!'
    ],
    celebrations: [
      'Camagu!', 'Siyavuya!', 'Kuhle kakhulu!',
      'Enkosi kakhulu!', 'Masithi vuya!'
    ],
    culturalNotes: 'Use respectful isiXhosa with proper greetings. Click sounds are integral to the language. Respect cultural traditions.',
    regions: ['Eastern Cape', 'Cape Town', 'Port Elizabeth', 'Mthatha', 'East London'],
    hashtags: ['#isiXhosa', '#EasternCape', '#Xhosa', '#Ubuntu', '#Mzansi', '#Camagu']
  },

  nso: {
    code: 'nso',
    name: 'Northern Sotho',
    nativeName: 'Sepedi',
    greetings: ['Dumela!', 'Dumelang!', 'Le kae?', 'O kae?', 'Thobela!'],
    commonExpressions: [
      'Ke a leboga', 'Go lokile', 'Aowa', 'Ee', 'Go botse',
      'Ke a go rata', 'Ke maswabi', 'Sepela gabotse'
    ],
    farewells: ['Sala gabotse!', 'Sepela gabotse!', 'Re tla bonana!', 'Robala gabotse!'],
    encouragements: [
      'O ka kgona!', 'Tšwelapele!', 'Se lahle pelo!',
      'Maatla!', 'Re na le wena!'
    ],
    celebrations: [
      'Ke botse!', 'Go monate!', 'Ke a thaba!',
      'Re thabile!', 'Modimo o mogolo!'
    ],
    culturalNotes: 'Use respectful Sepedi with proper greetings. Northern Sotho is spoken primarily in Limpopo province.',
    regions: ['Limpopo', 'Polokwane', 'Tzaneen', 'Giyani', 'Thohoyandou'],
    hashtags: ['#Sepedi', '#NorthernSotho', '#Limpopo', '#Pedi', '#Mzansi']
  },

  tn: {
    code: 'tn',
    name: 'Tswana',
    nativeName: 'Setswana',
    greetings: ['Dumela!', 'Dumelang!', 'Le kae?', 'O tsogile jang?', 'Ke a go dumedisa!'],
    commonExpressions: [
      'Ke a leboga', 'Go siame', 'Nnyaa', 'Ee', 'Go monate',
      'Ke rata', 'Ke maswabi', 'Tsamaya sentle'
    ],
    farewells: ['Sala sentle!', 'Tsamaya sentle!', 'Re tla bonana!', 'Robala sentle!'],
    encouragements: [
      'O ka kgona!', 'Tswelela pele!', 'Se latlhe pelo!',
      'Maatla!', 'Re na le wena!'
    ],
    celebrations: [
      'Go monate!', 'Ke itumetse!', 'Re itumetse!',
      'Go siame thata!', 'Pula!'
    ],
    culturalNotes: 'Use respectful Setswana. "Pula" (rain) is a significant word symbolizing prosperity. Spoken in North West province.',
    regions: ['North West', 'Mafikeng', 'Rustenburg', 'Potchefstroom', 'Klerksdorp'],
    hashtags: ['#Setswana', '#Tswana', '#NorthWest', '#Pula', '#Mzansi']
  },

  st: {
    code: 'st',
    name: 'Southern Sotho',
    nativeName: 'Sesotho',
    greetings: ['Dumela!', 'Dumelang!', 'U phela joang?', 'Khotso!', 'Lumela!'],
    commonExpressions: [
      'Kea leboha', 'Ho lokile', 'Che', 'E', 'Ho monate',
      'Ke a u rata', 'Ke maswabi', 'Tsamaea hantle'
    ],
    farewells: ['Sala hantle!', 'Tsamaea hantle!', 'Re tla bonana!', 'Robala hantle!'],
    encouragements: [
      'U ka kgona!', 'Tsoela pele!', 'Se lahle pelo!',
      'Matla!', 'Re na le uena!'
    ],
    celebrations: [
      'Ho monate!', 'Ke thabile!', 'Re thabile!',
      'Ho lokile haholo!', 'Pula!'
    ],
    culturalNotes: 'Use respectful Sesotho. The language is also spoken in Lesotho. "Khotso" (peace) is a significant greeting.',
    regions: ['Free State', 'Bloemfontein', 'Welkom', 'QwaQwa', 'Lesotho'],
    hashtags: ['#Sesotho', '#SouthernSotho', '#FreeState', '#Khotso', '#Mzansi']
  },

  ts: {
    code: 'ts',
    name: 'Tsonga',
    nativeName: 'Xitsonga',
    greetings: ['Avuxeni!', 'Xewani!', 'U njhani?', 'Mi njhani?', 'Ahee!'],
    commonExpressions: [
      'Inkomu', 'Swa kahle', 'Ee', 'Hayi', 'Swi ta famba',
      'Ndza ku rhandza', 'Ndzi khomiwile', 'Famba kahle'
    ],
    farewells: ['Sala kahle!', 'U ta vuya!', 'Famba kahle!', 'Hi ta vonana!'],
    encouragements: [
      'U nga kanakani!', 'Yima u tiya!', 'Tshika ku vilela!',
      'Matimba!', 'Hi na wena!'
    ],
    celebrations: [
      'Swa saseka!', 'Ndzi tsakile!', 'Hi tsakile!',
      'Swa kahle ngopfu!', 'A hi tsakeni!'
    ],
    culturalNotes: 'Use respectful Xitsonga. The language has rich cultural heritage and is spoken primarily in Limpopo and Mpumalanga.',
    regions: ['Limpopo', 'Mpumalanga', 'Giyani', 'Tzaneen', 'Bushbuckridge'],
    hashtags: ['#Xitsonga', '#Tsonga', '#Limpopo', '#Mpumalanga', '#Mzansi']
  },

  ss: {
    code: 'ss',
    name: 'Swati',
    nativeName: 'siSwati',
    greetings: ['Sawubona!', 'Sanibonani!', 'Unjani?', 'Ninjani?', 'Yebo!'],
    commonExpressions: [
      'Ngiyabonga', 'Kulungile', 'Yebo', 'Cha', 'Kuhle',
      'Ngiyakutsandza', 'Ngiyacolisa', 'Hamba kahle'
    ],
    farewells: ['Sala kahle!', 'Hamba kahle!', 'Sobonana!', 'Lala kahle!'],
    encouragements: [
      'Ungakhathali!', 'Chubeka!', 'Ungapheli emandla!',
      'Simunye!', 'Ematfumba!'
    ],
    celebrations: [
      'Halala!', 'Siyajabula!', 'Kuhle kakhulu!',
      'Siyabonga!', 'Bayethe!'
    ],
    culturalNotes: 'Use respectful siSwati. The language is closely related to isiZulu. Also the national language of Eswatini.',
    regions: ['Mpumalanga', 'Eswatini', 'Mbombela', 'Barberton', 'Piet Retief'],
    hashtags: ['#siSwati', '#Swati', '#Mpumalanga', '#Eswatini', '#Mzansi']
  },

  ve: {
    code: 've',
    name: 'Venda',
    nativeName: 'Tshivenda',
    greetings: ['Ndaa!', 'Aa!', 'Vho vuwa hani?', 'Ni khou tshila hani?', 'Ndi masiari!'],
    commonExpressions: [
      'Ndo livhuwa', 'Ndi zwavhudi', 'Ee', 'Hai', 'Zwi a takadza',
      'Ndi a ni funa', 'Ndi khou humbela pfarelo', 'Tshimbilani zwavhudi'
    ],
    farewells: ['Salani zwavhudi!', 'Tshimbilani zwavhudi!', 'Ri do vhonana!', 'Edzani u eḓela zwavhudi!'],
    encouragements: [
      'Ni nga kona!', 'Bveledzani!', 'Ni songo ḓiimisa!',
      'Maanḓa!', 'Ri na inwi!'
    ],
    celebrations: [
      'Ndi zwone!', 'Ndi takadzwa!', 'Ri takadzwa!',
      'Ndi zwavhudi vhukuma!', 'Vhutshilo!'
    ],
    culturalNotes: 'Use respectful Tshivenda. The language has unique sounds and rich cultural traditions from the Venda people.',
    regions: ['Limpopo', 'Thohoyandou', 'Musina', 'Louis Trichardt', 'Sibasa'],
    hashtags: ['#Tshivenda', '#Venda', '#Limpopo', '#Vhutshilo', '#Mzansi']
  },

  nr: {
    code: 'nr',
    name: 'Ndebele',
    nativeName: 'isiNdebele',
    greetings: ['Lotjhani!', 'Sawubona!', 'Unjani?', 'Ninjani?', 'Yebo!'],
    commonExpressions: [
      'Ngiyathokoza', 'Kulungile', 'Yebo', 'Awa', 'Kuhle',
      'Ngiyakuthanda', 'Ngiyacolisa', 'Khamba kuhle'
    ],
    farewells: ['Sala kuhle!', 'Khamba kuhle!', 'Sizobonana!', 'Lala kuhle!'],
    encouragements: [
      'Ungapheli amandla!', 'Ragela phambili!', 'Ungalahli ithemba!',
      'Amandla!', 'Sinani!'
    ],
    celebrations: [
      'Halala!', 'Siyathokoza!', 'Kuhle khulu!',
      'Siyabonga!', 'Ngiyathokoza khulu!'
    ],
    culturalNotes: 'Use respectful isiNdebele. The Ndebele people are known for their distinctive art and cultural traditions.',
    regions: ['Mpumalanga', 'Limpopo', 'Middelburg', 'Siyabuswa', 'Dennilton'],
    hashtags: ['#isiNdebele', '#Ndebele', '#Mpumalanga', '#NdebeleArt', '#Mzansi']
  }
};

/**
 * Get language context by code
 */
export function getLanguageContext(code: string): LanguageContext {
  return SA_LANGUAGE_CONTEXTS[code] || SA_LANGUAGE_CONTEXTS.en;
}

/**
 * Get a random greeting for a language
 */
export function getRandomGreeting(languageCode: string): string {
  const context = getLanguageContext(languageCode);
  return context.greetings[Math.floor(Math.random() * context.greetings.length)];
}

/**
 * Get a random expression for a language
 */
export function getRandomExpression(languageCode: string): string {
  const context = getLanguageContext(languageCode);
  return context.commonExpressions[Math.floor(Math.random() * context.commonExpressions.length)];
}

/**
 * Get a random farewell for a language
 */
export function getRandomFarewell(languageCode: string): string {
  const context = getLanguageContext(languageCode);
  return context.farewells[Math.floor(Math.random() * context.farewells.length)];
}

/**
 * Get relevant hashtags for a language
 */
export function getLanguageHashtags(languageCode: string): string[] {
  const context = getLanguageContext(languageCode);
  return [...context.hashtags];
}

/**
 * Get all language codes
 */
export function getAllLanguageCodes(): string[] {
  return Object.keys(SA_LANGUAGE_CONTEXTS);
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(code: string): string {
  const context = SA_LANGUAGE_CONTEXTS[code];
  return context ? `${context.name} (${context.nativeName})` : 'Unknown';
}

/**
 * South African regional data for location references
 */
export const SA_REGIONS = {
  gauteng: {
    name: 'Gauteng',
    cities: ['Johannesburg', 'Pretoria', 'Sandton', 'Soweto', 'Midrand', 'Centurion'],
    landmarks: ['Constitution Hill', 'Apartheid Museum', 'Union Buildings', 'Montecasino'],
    events: ['Joburg Day', 'Arts Alive Festival', 'Joy of Jazz'],
  },
  westernCape: {
    name: 'Western Cape',
    cities: ['Cape Town', 'Stellenbosch', 'Paarl', 'Franschhoek', 'Hermanus'],
    landmarks: ['Table Mountain', 'V&A Waterfront', 'Robben Island', 'Cape Point'],
    events: ['Cape Town Jazz Festival', 'Design Indaba', 'Cape Town Carnival'],
  },
  kwazuluNatal: {
    name: 'KwaZulu-Natal',
    cities: ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Ballito', 'Umhlanga'],
    landmarks: ['Durban beachfront', 'uShaka Marine World', 'Valley of 1000 Hills', 'Drakensberg'],
    events: ['Durban July', 'Comrades Marathon', 'Essence Festival'],
  },
  easternCape: {
    name: 'Eastern Cape',
    cities: ['Port Elizabeth', 'East London', 'Mthatha', 'Grahamstown', 'Bhisho'],
    landmarks: ['Addo Elephant Park', 'Wild Coast', 'Nelson Mandela Bay'],
    events: ['Grahamstown Arts Festival', 'Splash Festival'],
  },
  freeState: {
    name: 'Free State',
    cities: ['Bloemfontein', 'Welkom', 'Bethlehem', 'Clarens'],
    landmarks: ['Golden Gate National Park', 'Naval Hill', 'Phuthaditjhaba'],
    events: ['Mangaung African Cultural Festival', 'Cherry Festival'],
  },
};

/**
 * South African national holidays and events
 */
export const SA_EVENTS = {
  publicHolidays: [
    { name: 'Human Rights Day', date: '21 March', hashtag: '#HumanRightsDay' },
    { name: 'Freedom Day', date: '27 April', hashtag: '#FreedomDay' },
    { name: 'Workers Day', date: '1 May', hashtag: '#WorkersDay' },
    { name: 'Youth Day', date: '16 June', hashtag: '#YouthDay' },
    { name: 'Women\'s Day', date: '9 August', hashtag: '#WomensDay' },
    { name: 'Heritage Day', date: '24 September', hashtag: '#HeritageDay #BraaiDay' },
    { name: 'Day of Reconciliation', date: '16 December', hashtag: '#DayOfReconciliation' },
  ],
  culturalEvents: [
    { name: 'Heritage Month', month: 'September', hashtag: '#HeritagMonth' },
    { name: 'Women\'s Month', month: 'August', hashtag: '#WomensMonth' },
    { name: 'Youth Month', month: 'June', hashtag: '#YouthMonth' },
    { name: 'Africa Month', month: 'May', hashtag: '#AfricaMonth' },
  ],
};
