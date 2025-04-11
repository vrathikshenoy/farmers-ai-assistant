"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "english" | "hindi" | "tamil" | "telugu" | "bengali" | "marathi" | "gujarati" | "punjabi"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  english: {
    appName: "Farmers AI Assistant",
    home: "Home",
    diagnose: "Diagnose",
    history: "History",
    settings: "Settings",
    takePicture: "Take Picture",
    uploadImage: "Upload Image",
    diagnosisResults: "Diagnosis Results",
    treatments: "Treatments",
    organicTreatments: "Organic Treatments",
    chemicalTreatments: "Chemical Treatments",
    selectCrop: "Select Crop",
    selectLanguage: "Select Language",
    onlineMode: "Online Mode",
    offlineMode: "Offline Mode",
    loading: "Loading...",
    noResults: "No results found",
    viewHistory: "View History",
    logout: "Logout",
    login: "Login",
    register: "Register",
    welcomeMessage: "Diagnose plant diseases instantly with your camera",
  },
  hindi: {
    appName: "किसान AI सहायक",
    home: "होम",
    diagnose: "निदान करें",
    history: "इतिहास",
    settings: "सेटिंग्स",
    takePicture: "तस्वीर लें",
    uploadImage: "छवि अपलोड करें",
    diagnosisResults: "निदान परिणाम",
    treatments: "उपचार",
    organicTreatments: "जैविक उपचार",
    chemicalTreatments: "रासायनिक उपचार",
    selectCrop: "फसल चुनें",
    selectLanguage: "भाषा चुनें",
    onlineMode: "ऑनलाइन मोड",
    offlineMode: "ऑफलाइन मोड",
    loading: "लोड हो रहा है...",
    noResults: "कोई परिणाम नहीं मिला",
    viewHistory: "इतिहास देखें",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "रजिस्टर",
    welcomeMessage: "अपने कैमरे से तुरंत पौधों के रोगों का निदान करें",
  },
  tamil: {
    appName: "விவசாயிகள் AI உதவியாளர்",
    home: "முகப்பு",
    diagnose: "நோயறிதல்",
    history: "வரலாறு",
    settings: "அமைப்புகள்",
    takePicture: "படம் எடுக்க",
    uploadImage: "படத்தை பதிவேற்றவும்",
    diagnosisResults: "நோயறிதல் முடிவுகள்",
    treatments: "சிகிச்சைகள்",
    organicTreatments: "இயற்கை சிகிச்சைகள்",
    chemicalTreatments: "இரசாயன சிகிச்சைகள்",
    selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    onlineMode: "ஆன்லைன் முறை",
    offlineMode: "ஆஃப்லைன் முறை",
    loading: "ஏற்றுகிறது...",
    noResults: "முடிவுகள் எதுவும் இல்லை",
    viewHistory: "வரலாற்றைக் காண",
    logout: "வெளியேறு",
    login: "உள்நுழைய",
    register: "பதிவு செய்ய",
    welcomeMessage: "உங்கள் கேமராவுடன் உடனடியாக தாவர நோய்களை கண்டறியவும்",
  },
  telugu: {
    appName: "రైతుల AI సహాయకుడు",
    home: "హోమ్",
    diagnose: "రోగ నిర్ధారణ",
    history: "చరిత్ర",
    settings: "సెట్టింగులు",
    takePicture: "ఫోటో తీయండి",
    uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    diagnosisResults: "రోగ నిర్ధారణ ఫలితాలు",
    treatments: "చికిత్సలు",
    organicTreatments: "సేంద్రీయ చికిత్సలు",
    chemicalTreatments: "రసాయన చికిత్సలు",
    selectCrop: "పంటను ఎంచుకోండి",
    selectLanguage: "భాషను ఎంచుకోండి",
    onlineMode: "ఆన్‌లైన్ మోడ్",
    offlineMode: "ఆఫ్‌లైన్ మోడ్",
    loading: "లోడ్ అవుతోంది...",
    noResults: "ఫలితాలు కనుగొనబడలేదు",
    viewHistory: "చరిత్రను వీక్షించండి",
    logout: "లాగౌట్",
    login: "లాగిన్",
    register: "నమోదు",
    welcomeMessage: "మీ కెమెరాతో వెంటనే మొక్కల వ్యాధులను గుర్తించండి",
  },
  bengali: {
    appName: "কৃষক AI সহকারী",
    home: "হোম",
    diagnose: "রোগ নির্ণয়",
    history: "ইতিহাস",
    settings: "সেটিংস",
    takePicture: "ছবি তুলুন",
    uploadImage: "ছবি আপলোড করুন",
    diagnosisResults: "রোগ নির্ণয়ের ফলাফল",
    treatments: "চিকিৎসা",
    organicTreatments: "জৈব চিকিৎসা",
    chemicalTreatments: "রাসায়নিক চিকিৎসা",
    selectCrop: "ফসল নির্বাচন করুন",
    selectLanguage: "ভাষা নির্বাচন করুন",
    onlineMode: "অনলাইন মোড",
    offlineMode: "অফলাইন মোড",
    loading: "লোড হচ্ছে...",
    noResults: "কোন ফলাফল পাওয়া যায়নি",
    viewHistory: "ইতিহাস দেখুন",
    logout: "লগআউট",
    login: "লগইন",
    register: "নিবন্ধন",
    welcomeMessage: "আপনার ক্যামেরা দিয়ে তাৎক্ষণিকভাবে উদ্ভিদের রোগ নির্ণয় করুন",
  },
  marathi: {
    appName: "शेतकरी AI सहाय्यक",
    home: "होम",
    diagnose: "निदान",
    history: "इतिहास",
    settings: "सेटिंग्ज",
    takePicture: "फोटो काढा",
    uploadImage: "प्रतिमा अपलोड करा",
    diagnosisResults: "निदान परिणाम",
    treatments: "उपचार",
    organicTreatments: "सेंद्रिय उपचार",
    chemicalTreatments: "रासायनिक उपचार",
    selectCrop: "पीक निवडा",
    selectLanguage: "भाषा निवडा",
    onlineMode: "ऑनलाइन मोड",
    offlineMode: "ऑफलाइन मोड",
    loading: "लोड होत आहे...",
    noResults: "कोणतेही परिणाम सापडले नाहीत",
    viewHistory: "इतिहास पहा",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "नोंदणी",
    welcomeMessage: "आपल्या कॅमेऱ्याने त्वरित वनस्पतींच्या रोगांचे निदान करा",
  },
  gujarati: {
    appName: "ખેડૂત AI સહાયક",
    home: "હોમ",
    diagnose: "નિદાન",
    history: "ઇતિહાસ",
    settings: "સેટિંગ્સ",
    takePicture: "ફોટો લો",
    uploadImage: "છબી અપલોડ કરો",
    diagnosisResults: "નિદાન પરિણામો",
    treatments: "સારવાર",
    organicTreatments: "જૈવિક સારવાર",
    chemicalTreatments: "રાસાયણિક સારવાર",
    selectCrop: "પાક પસંદ કરો",
    selectLanguage: "ભાષા પસંદ કરો",
    onlineMode: "ઓનલાઇન મોડ",
    offlineMode: "ઓફલાઇન મોડ",
    loading: "લોડ થઈ રહ્યું છે...",
    noResults: "કોઈ પરિણામ મળ્યું નથી",
    viewHistory: "ઇતિહાસ જુઓ",
    logout: "લૉગઆઉટ",
    login: "લૉગિન",
    register: "નોંધણી",
    welcomeMessage: "તમારા કેમેરા સાથે તરત જ વનસ્પતિના રોગોનું નિદાન કરો",
  },
  punjabi: {
    appName: "ਕਿਸਾਨ AI ਸਹਾਇਕ",
    home: "ਹੋਮ",
    diagnose: "ਰੋਗ ਦਾ ਪਤਾ ਲਗਾਓ",
    history: "ਇਤਿਹਾਸ",
    settings: "ਸੈਟਿੰਗਾਂ",
    takePicture: "ਤਸਵੀਰ ਲਓ",
    uploadImage: "ਚਿੱਤਰ ਅਪਲੋਡ ਕਰੋ",
    diagnosisResults: "ਰੋਗ ਦੇ ਨਤੀਜੇ",
    treatments: "ਇਲਾਜ",
    organicTreatments: "ਜੈਵਿਕ ਇਲਾਜ",
    chemicalTreatments: "ਰਸਾਇਣਕ ਇਲਾਜ",
    selectCrop: "ਫਸਲ ਚੁਣੋ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    onlineMode: "ਔਨਲਾਈਨ ਮੋਡ",
    offlineMode: "ਔਫਲਾਈਨ ਮੋਡ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    noResults: "ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ ਮਿਲੇ",
    viewHistory: "ਇਤਿਹਾਸ ਵੇਖੋ",
    logout: "ਲੌਗਆਊਟ",
    login: "ਲੌਗਇਨ",
    register: "ਰਜਿਸਟਰ",
    welcomeMessage: "ਆਪਣੇ ਕੈਮਰੇ ਨਾਲ ਤੁਰੰਤ ਪੌਦਿਆਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਪਤਾ ਲਗਾਓ",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "english",
  setLanguage: () => {},
  t: (key: string) => key,
})

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("english")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
