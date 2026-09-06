export interface TranslationSchema {
  brand: { name: string; tagline: string; description: string };
  nav: {
    home: string;
    startConsultation: string;
    myHistory: string;
    myReports: string;
    myMedicines: string;
    myAppointments: string;
    profile: string;
    settings: string;
    help: string;
    logout: string;
    dashboard: string;
    patientQueue: string;
    patients: string;
    reports: string;
    calendar: string;
    emergency: string;
    howItWorks: string;
    features: string;
    forPatients: string;
    forDoctors: string;
    about: string;
    login: string;
    getStarted: string;
  };
  roleSelect: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    patientTitle: string;
    patientDescription: string;
    doctorTitle: string;
    doctorDescription: string;
    adminTitle: string;
    adminDescription: string;
    footerNote: string;
  };
  getStartedGateway: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    patientTitle: string;
    patientDescription: string;
    doctorTitle: string;
    doctorDescription: string;
    adminTitle: string;
    adminDescription: string;
    footerNote: string;
  };
  home: {
    hero: {
      eyebrow: string;
      headline: [string, string, string];
      subtext: string;
      ctaPrimary: string;
      ctaSecondary: string;
      mockAssistant: string;
      mockListening: string;
      rotating: [string, string, string, string];
      visual: {
        assistant: string;
        assistantStatus: string;
        patientProfile: string;
        patientProfileValue: string;
        timeline: string;
        timelineValue: string;
        reports: string;
        reportsValue: string;
        doctorVerification: string;
        doctorVerificationValue: string;
        healthId: string;
        healthIdValue: string;
        voiceMode: string;
        touchMode: string;
      };
    };
    motivation: {
      eyebrow: string;
      headline: [string, string];
      statements: [string, string, string, string, string];
      resolution: string;
    };
    experience: {
      eyebrow: string;
      heading: string;
      subtext: string;
      steps: [string, string, string, string, string];
      assistantPrompt: string;
      patientReply: string;
      fields: {
        chiefComplaint: string;
        symptoms: string;
        medicalHistory: string;
        medicines: string;
        allergies: string;
      };
      fieldValues: {
        chiefComplaint: string;
        symptoms: string;
        medicalHistory: string;
        medicines: string;
        allergies: string;
      };
    };
    voiceTouch: {
      eyebrow: string;
      headline: [string, string];
      voiceLabel: string;
      voiceText: string;
      voiceHint: string;
      touchLabel: string;
      touchText: string;
      touchHint: string;
    };
    aiShowcase: {
      eyebrow: string;
      headline: [string, string];
      subtext: string;
      tabs: { conversation: string; voice: string; touch: string };
      tabDescriptions: { conversation: string; voice: string; touch: string };
      disclaimer: string;
      conversation: {
        stepLabel: string;
        progressLabel: string;
        mainQuestion: string;
        options: { fever: string; pain: string; cough: string; weakness: string; breathing: string; other: string };
        durationQuestion: string;
        durationOptions: [string, string, string, string];
        severityQuestion: string;
        severityOptions: [string, string, string];
        breathingQuestion: string;
        yes: string;
        no: string;
        redFlagTitle: string;
        redFlagBody: string;
        summaryTitle: string;
        fields: { symptom: string; duration: string; severity: string; associated: string };
        associatedYes: string;
        associatedNo: string;
        restart: string;
        goBack: string;
        skip: string;
      };
      voice: {
        startSpeaking: string;
        stop: string;
        repeat: string;
        goBack: string;
        skip: string;
        states: { idle: string; listening: string; processing: string; speaking: string; completed: string };
      };
      touch: {
        heading: string;
        questions: [string, string];
        moods: { good: string; okay: string; notWell: string; severe: string };
        completed: string;
      };
      flow: { voice: string; or: string; touch: string; understands: string; structured: string };
    };
    multilingual: {
      eyebrow: string;
      headline: string;
      message: string;
      sample: [string, string, string];
      disclaimer: string;
    };
    journey: {
      eyebrow: string;
      headline: string;
      subtext: string;
      steps: [string, string, string, string, string];
      footnote: string;
      aboutHeading: string;
      aboutText: string;
    };
  

  phase2: {
    problem: {
      eyebrow: string;
      headline: string;
      fragments: [string, string, string, string, string, string, string];
      resolution: string;
    };
    unify: {
      eyebrow: string;
      headline: [string, string, string];
      nodes: [string, string, string, string, string, string, string, string];
      recordLabel: string;
      recordCaption: string;
    };
    workflow: {
      eyebrow: string;
      headline: string;
      subtext: string;
      steps: {
        title: string;
        subtitle: string;
        screenLabel: string;
      }[];
    };
    understand: {
      eyebrow: string;
      headline: string;
      conversation: string;
      chiefComplaint: string;
      chiefComplaintValue: string;
      duration: string;
      durationValue: string;
      pattern: string;
      patternValue: string;
      alsoConsidered: string;
      alsoConsideredItems: [string, string, string, string];
      disclaimer: string;
    };
    documentIntel: {
      eyebrow: string;
      headline: string;
      subtext: string;
      stages: [string, string, string, string];
      sampleDoc: string;
      values: { label: string; value: string }[];
      demoNote: string;
    };
    doctorReview: {
      eyebrow: string;
      headline: string;
      stages: [string, string, string, string, string];
      trustNote: string;
    };
    timeline: {
      eyebrow: string;
      headline: string;
      entries: { year: string; label: string }[];
    };
    healthId: {
      eyebrow: string;
      cardBrand: string;
      idLabel: string;
      idNumber: string;
      qrPlaceholder: string;
      tagline: string;
    };
    closing: {
      headline: [string, string, string, string];
      cta: string;
    };
  };
  phase3: {
    forWho: {
      eyebrow: string;
      headline: [string];
      roles: { label: string; desc: string }[];
    };
    useCases: {
      eyebrow: string;
      headline: [string, string];
      items: { number: string; title: string }[];
    };
    security: {
      eyebrow: string;
      headline: [string];
      items: string[];
      note: string;
    };
    faq: {
      eyebrow: string;
      headline: [string];
      items: { q: string; a: string }[];
    };
    finalMessage: {
      headline: [string];
      lines: [string, string, string];
      brandLine: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    orgCta: {
      headline: [string, string];
      buttons: { label: string; to: string }[];
    };
    footer: {
      brandTagline: [string, string, string];
      productHeading: string;
      productLinks: { label: string; to: string }[];
      companyHeading: string;
      companyLinks: { label: string; to: string }[];
      trustHeading: string;
      trustLinks: { label: string; to: string }[];
      languagesHeading: string;
      copyright: string;
    };
  };
  };
  features: {
    hero: {
      badge: string;
      headline: string;
      subtext: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    intro: {
      heading: string;
      subtext: string;
    };
    aiAssistant: {
      eyebrow: string;
      heading: string;
      description: string;
      panelTitle: string;
      question: string;
      startSpeaking: string;
      answerByTouch: string;
      options: { fever: string; pain: string; cough: string; weakness: string };
      stepLabel: string;
      progressLabel: string;
    };
    medicalHistory: {
      eyebrow: string;
      heading: string;
      description: string;
      categories: {
        presentIllness: string;
        pastHistory: string;
        medicines: string;
        allergies: string;
        familyHistory: string;
        surgeries: string;
      };
      statusLabels: { patientProvided: string; aiStructured: string; doctorVerified: string };
      flow: { patient: string; ai: string; doctor: string };
    };
    timeline: {
      eyebrow: string;
      heading: string;
      description: string;
      entries: { year: string; label: string }[];
    };
    documentIntel: {
      eyebrow: string;
      heading: string;
      description: string;
      stages: [string, string, string, string];
      sampleDoc: string;
      structuredLabel: string;
      fields: { diagnosis: string; testResults: string; medicines: string; findings: string };
      fieldValues: { diagnosis: string; testResults: string; medicines: string; findings: string };
      demoNote: string;
    };
    redFlag: {
      eyebrow: string;
      heading: string;
      description: string;
      panelTitle: string;
      items: [string, string, string];
      note: string;
      disclaimer: string;
    };
    multilingual: {
      eyebrow: string;
      heading: string;
      description: string;
      languages: { label: string; nativeLabel: string; sample: string }[];
    };
    ayush: {
      eyebrow: string;
      heading: string;
      description: string;
      fields: { prakriti: string; vikriti: string; agni: string; koshtha: string; ahara: string; vihara: string };
      fieldDescriptions: { prakriti: string; vikriti: string; agni: string; koshtha: string; ahara: string; vihara: string };
      note: string;
    };
    doctorVerification: {
      eyebrow: string;
      heading: string;
      description: string;
      flow: [string, string, string, string];
      reviewPanelTitle: string;
      reviewLabel: string;
      verifiedLabel: string;
      note: string;
    };
    healthId: {
      eyebrow: string;
      heading: string;
      description: string;
      cardBrand: string;
      idLabel: string;
      idNumber: string;
      nameLabel: string;
      patientName: string;
      statusLabel: string;
      qrCaption: string;
      qrPlaceholderNote: string;
      secureCodeLabel: string;
      demoNote: string;
    };
    overview: {
      eyebrow: string;
      heading: string;
      description: string;
      cards: { title: string; subtitle: string }[];
    };
    finalCta: {
      headline: [string, string, string];
      subtext: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
  };
  common: {
    voiceMode: string;
    voiceModeHint: string;
    touchMode: string;
    touchModeHint: string;
    quickActions: string;
    uploadDocuments: string;
    myTimeline: string;
    ayushMode: string;
    previousVisits: string;
    secureEnvironment: string;
    healthId: string;
    scanToAccess: string;
    comingInPartB: string;
    loading: string;
    retry: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    viewAll: string;
    optional: string;
    required: string;
  };
  status: {
    stable: string;
    attention: string;
    critical: string;
    pending: string;
    verified: string;
  };
  emptyState: { title: string; description: string };
  patientRegister: {
    privacyPolicyLink: string;
    step2Badge: string;
    step2Title: string;
    step2Description: string;
    step2Note: string;
  };
  patientRegisterAddress: {
    sectionLabel: string;
    countryLabel: string;
    countryPlaceholder: string;
    stateLabel: string;
    statePlaceholder: string;
    districtLabel: string;
    districtPlaceholder: string;
    zipLabel: string;
    zipPlaceholder: string;
  };
  patientRegisterConsent: {
    prefix: string;
    privacyPolicyLabel: string;
    connector: string;
    consentTermsLabel: string;
    error: string;
  };
  patientRegisterOtp: {
    emailTitle: string;
    emailDescription: string;
    emailInputLabel: string;
    mobileTitle: string;
    mobileDescription: string;
    mobileInputLabel: string;
    phoneTitle: string;
    phoneDescription: string;
    phoneInputLabel: string;
    resendPrefix: string;
    resendCountdown: string;
    resendAction: string;
    incompleteError: string;
    invalidError: string;
    securityNote: string;
  };
  personalDetailsStep: {
    sectionPersonalTitle: string;
    sectionContactTitle: string;
    sectionSecurityTitle: string;
    profilePhotoLabel: string;
    profilePhotoUploadButton: string;
    profilePhotoHint: string;
    phoneLabel: string;
    phonePlaceholder: string;
    alternatePhoneLabel: string;
    alternatePhonePlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    phoneRequiredError: string;
    passwordMismatchError: string;
    whyChooseTitle: string;
    whyChoose: [string, string, string, string, string];
    tipsTitle: string;
    tips: [string, string, string, string];
    privacySecureConfidential: string;
  };
  aiInterview: {
    headerTitle: string;
    headerSubtitle: string;
    progressLabel: string;
    questionCounter: string;
    intro: {
      greeting: string;
      subtext: string;
      points: [string, string, string, string];
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
      startButton: string;
      skipButton: string;
    };
    questions: [string, string, string, string, string];
    voiceDemoAnswers: [string, string, string, string, string];
    answerPlaceholder: string;
    answerRequiredError: string;
    voiceInputButton: string;
    nextButton: string;
    previousButton: string;
    skipInterview: string;
    tip: string;
    interviewTipsTitle: string;
    interviewTips: [string, string, string, string];
    listeningTitle: string;
    listeningSubtitle: string;
    cancelButton: string;
    voicePopoverTitle: string;
    voicePopoverHint: string;
    acknowledgement: string;
    completedTitle: string;
    completedHighlight: string;
    completedMessage: string;
    completedSubMessage: string;
    continueButton: string;
    skipForNow: string;
    privacyNote: string;
    medicalDisclaimer: string;
  };
   documentUpload: {
    progressSteps: [string, string, string, string, string, string, string, string];
    registrationProgressTitle: string;
    progressStatusCompleted: string;
    progressStatusCurrent: string;
    progressStatusPending: string;
    pageTitle: string;
    pageSubtitle: string;
    infoBanner: string;
    dropzone: {
      heading: string;
      dragText: string;
      orLabel: string;
      browseButton: string;
      supportedFormats: string;
    };
    aiNote: string;
    categoriesTitle: string;
    categoriesHint: string;
    categories: {
      lab: { title: string; description: string };
      medical: { title: string; description: string };
      prescriptions: { title: string; description: string };
      imaging: { title: string; description: string };
    };
    filesCountLabel: string;
    uploadedTitle: string;
    uploadedCountBadge: string;
    emptyTitle: string;
    emptyDescription: string;
    detectedCategoryLabel: string;
    changeCategoryButton: string;
    changeCategoryModalTitle: string;
    changeCategoryModalDescription: string;
    viewButton: string;
    removeButton: string;
    statusUploading: string;
    statusUploaded: string;
    tipsTitle: string;
    tips: [string, string, string, string];
    needHelpTitle: string;
    needHelpDescription: string;
    contactSupportButton: string;
    privacyTitle: string;
    privacyNote: string;
    skipButton: string;
    skipHint: string;
    continueButton: string;
    continueHint: string;
    unsupportedFormatError: string;
    fileTooLargeError: string;
    columnFileName: string;
    columnType: string;
    columnSize: string;
    columnCategory: string;
    columnStatus: string;
    columnActions: string;
  };
  aiAnalysis: {
    pageTitle: string;
    pageSubtitle: string;
    statusHeading: {
      clear: string;
      attention: string;
      critical: string;
    };
    statusBody: {
      clear: string;
      attention: string;
      critical: string;
    };
    concernBadgeLabel: string;
    detectedConcernsTitle: string;
    priorityLabel: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    viewAllDetailsButton: string;
    summaryTitle: string;
    metrics: {
      documentsAnalyzed: string;
      documentsAnalyzedCaption: string;
      dataPointsExtracted: string;
      dataPointsExtractedCaption: string;
      potentialConcerns: string;
      potentialConcernsCaption: string;
      confidenceScore: string;
      confidenceScoreCaption: string;
    };
    disclaimer: string;
    howItWorksTitle: string;
    howItWorks: [string, string, string, string, string];
    uploadedDocumentsTitle: string;
    documentsCountBadge: string;
    uploadedOnLabel: string;
    viewAllDocumentsButton: string;
    noDocumentsTitle: string;
    noDocumentsDescription: string;
    backButton: string;
    continueButton: string;
    continueHint: string;
  };  healthSummary: {
    pageTitle: string;
    pageSubtitle: string;
    aiBadge: string;
    generatedLabel: string;
    lastUpdatedLabel: string;
    editButton: string;
    editToastTitle: string;
    editToastDescription: string;
    metrics: {
      documentsAnalyzed: string;
      dataPointsExtracted: string;
      potentialConcerns: string;
      confidenceScore: string;
    };
    tabs: {
      summary: string;
      keyFindings: string;
      labHighlights: string;
      timeline: string;
      lifestyleAyush: string;
    };
    comingSoonTitle: string;
    comingSoonDescription: string;
    sections: {
      overallSummaryTitle: string;
      keyHighlightsLabel: string;
      documentsOnFileBullet: string;
      activeMedicationsBullet: string;
      abnormalLabValuesBullet: string;
      chiefComplaintTitle: string;
      hpiTitle: string;
      pastMedicalHistoryTitle: string;
      pastMedicalHistoryEmpty: string;
      surgeryHistoryTitle: string;
      surgeryHistoryEmpty: string;
      currentMedicinesTitle: string;
      currentMedicinesEmpty: string;
      medicineColumns: { medicine: string; dosage: string; frequency: string; purpose: string; source: string };
      allergiesTitle: string;
      allergiesEmpty: string;
      familyHistoryTitle: string;
      familyHistoryEmpty: string;
      lifestyleTitle: string;
      lifestyleEmpty: string;
    };
    disclaimer: string;
    backButton: string;
    continueButton: string;
    continueHint: string;
  };
  reviewSummary: {
    pageTitle: string;
    pageSubtitle: string;
    personalInfoTitle: string;
    fields: {
      name: string;
      dob: string;
      gender: string;
      contact: string;
      location: string;
    };
    aiInterviewTitle: string;
    aiInterviewCompleted: string;
    aiInterviewSkipped: string;
    documentsTitle: string;
    documentsSubtitle: string;
    documentsUploadedLabel: string;
    noDocumentsUploaded: string;
    backButton: string;
    createAccountButton: string;
    createAccountHint: string;
  };
  accountCreated: {
    successTitle: string;
    successSubtitle: string;
    successNote: string;
    patientSummaryTitle: string;
    patientSummarySubtitle: string;
    fields: {
      name: string;
      dob: string;
      gender: string;
      contact: string;
      location: string;
      registeredOn: string;
    };
    documentsTitle: string;
    documentsSavedNote: string;
    documentsCountLabel: string;
    noDocumentsNote: string;
    healthIdTitle: string;
    healthIdSubtitle: string;
    keepSafeTitle: string;
    keepSafeDescription: string;
    downloadQrButton: string;
    whatsNextTitle: string;
    whatsNextItems: [string, string, string, string];
    finalCtaTitle: string;
    finalCtaDescription: string;
    dashboardButton: string;
  };
  privacyPolicy: {
    eyebrow: string;
    title: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    intro: string;
    backLink: string;
    sections: {
      introduction: { heading: string; body: string };
      infoCollected: {
        heading: string;
        intro: string;
        accountInfo: { heading: string; body: string };
        abdmEmail: { heading: string; body: string };
        healthInfo: { heading: string; body: string };
      };
      howWeUse: { heading: string; body: string };
      consent: { heading: string; body: string };
      dataSecurity: { heading: string; body: string };
      dataStorage: { heading: string; body: string };
      dataSharing: { heading: string; body: string };
      clinicalVerification: { heading: string; body: string };
      userRights: { heading: string; body: string };
      dataRetention: { heading: string; body: string };
      thirdParty: { heading: string; body: string };
      cookies: { heading: string; body: string };
      childrensPrivacy: { heading: string; body: string };
      policyUpdates: { heading: string; body: string };
      contact: { heading: string; body: string; email: string };
    };
  };
  consentTerms: {
    eyebrow: string;
    title: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    intro: string;
    backLink: string;
    sections: {
      aiConsent: { heading: string; body: string };
      redFlagDetection: { heading: string; body: string };
      dataConsent: { heading: string; body: string };
      healthcareSharing: { heading: string; body: string };
      consentWithdrawal: { heading: string; body: string };
    };
  };
  a11y: {
    switchLanguage: string;
    switchTheme: string;
    closeDialog: string;
    openMenu: string;
  };
}

const en: TranslationSchema = {
  brand: {
    name: "MediKiosk",
    tagline: "Your Health. Your History. Your Care.",
    description: "AI-Powered Patient Case-Taking & Digital Health Record Platform",
  },
  nav: {
    home: "Home",
    startConsultation: "Start Consultation",
    myHistory: "My History",
    myReports: "My Reports",
    myMedicines: "My Medicines",
    myAppointments: "My Appointments",
    profile: "Profile",
    settings: "Settings",
    help: "Help / Support",
    logout: "Logout",
    dashboard: "Dashboard",
    patientQueue: "Patient Queue",
    patients: "Patients",
    reports: "Reports",
    calendar: "Calendar",
    emergency: "Emergency",
    howItWorks: "How It Works",
    features: "Features",
    forPatients: "For Patients",
    forDoctors: "For Doctors",
    about: "About",
    login: "Login",
    getStarted: "Get Started",
  },
  roleSelect: {
    title: "Welcome to",
    titleHighlight: "MediKiosk",
    subtitle: "Choose your role to continue",
    patientTitle: "Patient",
    patientDescription: "Access your personal health records",
    doctorTitle: "Doctor",
    doctorDescription: "Access clinical tools and patient information",
    adminTitle: "Admin",
    adminDescription: "Manage verification and platform operations",
    footerNote: "Secure. Private. Always here for you.",
  },
  getStartedGateway: {
    title: "Let's get you set up on",
    titleHighlight: "MediKiosk",
    subtitle: "Choose how you'd like to join",
    patientTitle: "Patient",
    patientDescription: "Create your personal health profile",
    doctorTitle: "Doctor",
    doctorDescription: "Register to offer verified clinical care",
    adminTitle: "Admin",
    adminDescription: "Request access to manage the platform",
    footerNote: "Secure. Private. Always here for you.",
  },
  home: {
    hero: {
      eyebrow: "AI-Powered Healthcare",
      headline: ["Your Health.", "Your History.", "Your Care."],
      subtext:
        "Healthcare starts with a story. MediKiosk helps capture that story, understand it, and turn it into a structured health record.",
      ctaPrimary: "Get Started",
      ctaSecondary: "See How It Works",
      mockAssistant: "AI Assistant",
      mockListening: "Listening…",
      rotating: [
        "Healthcare is personal.",
        "Healthcare is complex.",
        "Healthcare should be easier to understand.",
        "MediKiosk brings the story together.",
      ],
      visual: {
        assistant: "AI Health Assistant",
        assistantStatus: "Listening…",
        patientProfile: "Patient Profile",
        patientProfileValue: "Ravi Kumar · 45Y · Male",
        timeline: "Medical Timeline",
        timelineValue: "2022 → 2026 · 6 entries",
        reports: "Reports",
        reportsValue: "Lab Report · HbA1c 7.8",
        doctorVerification: "Doctor Verification",
        doctorVerificationValue: "Verified by Dr. Anirban Saha",
        healthId: "Health ID",
        healthIdValue: "MED-26-001245",
        voiceMode: "Voice Mode",
        touchMode: "Touch Mode",
      },
    },
    motivation: {
      eyebrow: "Why MediKiosk",
      headline: ["Tell us what you're feeling.", "We'll help organize the story."],
      statements: [
        "I don't know what information my doctor needs.",
        "I have reports from different hospitals.",
        "I can't remember everything from my previous visits.",
        "My health history is scattered everywhere.",
        "I just want my doctor to understand.",
      ],
      resolution: "MediKiosk brings it together.",
    },
    experience: {
      eyebrow: "The Patient Experience",
      heading: "One conversation. A complete picture.",
      subtext: "Watch a health story go from a few spoken words to a structured record a doctor can act on.",
      steps: [
        "Patient opens MediKiosk",
        "AI Assistant asks a question",
        "Patient responds by voice or touch",
        "MediKiosk structures the information",
        "The record is ready for review",
      ],
      assistantPrompt: "Tell me what brought you here today.",
      patientReply: "I've had a dull chest pain since yesterday evening, and I feel a little breathless.",
      fields: {
        chiefComplaint: "Chief Complaint",
        symptoms: "Symptoms",
        medicalHistory: "Medical History",
        medicines: "Medicines",
        allergies: "Allergies",
      },
      fieldValues: {
        chiefComplaint: "Chest pain since yesterday",
        symptoms: "Breathlessness, mild fatigue",
        medicalHistory: "Hypertension (2021)",
        medicines: "Amlodipine 5mg, once daily",
        allergies: "None reported",
      },
    },
    voiceTouch: {
      eyebrow: "Voice + Touch",
      headline: ["Speak naturally.", "Or simply tap."],
      voiceLabel: "Voice",
      voiceText: "Tell MediKiosk what you're experiencing.",
      voiceHint: "Speak in your own words, at your own pace.",
      touchLabel: "Touch",
      touchText: "Prefer typing or tapping? You're always in control.",
      touchHint: "Choose from guided options or type your answer.",
    },
    aiShowcase: {
      eyebrow: "AI Health Assistant",
      headline: ["One guided conversation.", "However you choose to answer."],
      subtext:
        "A quick look at how MediKiosk's AI Health Assistant guides a patient through their story — by voice, by touch, or a mix of both — and turns it into a structured history a doctor can trust. This is a homepage preview, not the live patient assistant.",
      tabs: { conversation: "AI Conversation", voice: "Voice Mode", touch: "Touch Mode" },
      tabDescriptions: {
        conversation: "One question at a time, with a live sense of progress through the visit.",
        voice: "Speak naturally — MediKiosk listens, understands, and confirms back to you.",
        touch: "Prefer not to speak? Answer the same guided questions by tapping.",
      },
      disclaimer: "This is a conceptual product preview, not a medical diagnosis or clinical advice.",
      conversation: {
        stepLabel: "Step {step} of {total}",
        progressLabel: "History completion",
        mainQuestion: "What is your main health concern today?",
        options: {
          fever: "Fever",
          pain: "Pain",
          cough: "Cough",
          weakness: "Weakness",
          breathing: "Breathing Difficulty",
          other: "Other",
        },
        durationQuestion: "When did the chest pain start?",
        durationOptions: ["Today", "Yesterday", "2–3 days ago", "A week or more"],
        severityQuestion: "How severe is the pain?",
        severityOptions: ["Mild", "Moderate", "Severe"],
        breathingQuestion: "Are you experiencing difficulty breathing?",
        yes: "Yes",
        no: "No",
        redFlagTitle: "Important symptom detected",
        redFlagBody: "Chest pain with breathing difficulty is flagged for early doctor review — no diagnosis is made here.",
        summaryTitle: "Structured Health History",
        fields: { symptom: "Symptom", duration: "Duration", severity: "Severity", associated: "Associated Symptom" },
        associatedYes: "Breathing Difficulty",
        associatedNo: "None reported",
        restart: "Restart",
        goBack: "Go Back",
        skip: "Skip",
      },
      voice: {
        startSpeaking: "Start Speaking",
        stop: "Stop",
        repeat: "Repeat",
        goBack: "Go Back",
        skip: "Skip",
        states: {
          idle: "Ready to listen",
          listening: "Listening…",
          processing: "Understanding your response…",
          speaking: "Reading your answer back to you…",
          completed: "Response ready",
        },
      },
      touch: {
        heading: "Answer by Touch",
        questions: ["How are you feeling today?", "How long have you been feeling this way?"],
        moods: { good: "Good", okay: "Okay", notWell: "Not Well", severe: "Severe" },
        completed: "Added to your structured health history.",
      },
      flow: { voice: "Voice", or: "or", touch: "Touch", understands: "MediKiosk Understands", structured: "Structured Health Information" },
    },
    multilingual: {
      eyebrow: "Multilingual By Design",
      headline: "Healthcare shouldn't get lost in translation.",
      message: "MediKiosk is designed to meet patients where they are.",
      sample: [
        "Tell me what brought you here today.",
        "আজ আপনি এখানে কেন এসেছেন, আমাকে বলুন।",
        "आज आप यहाँ किस लिए आए हैं, मुझे बताइए।",
      ],
      disclaimer: "Shown in a few languages here — MediKiosk's language support is being expanded carefully, not claimed all at once.",
    },
    journey: {
      eyebrow: "From Story To Record",
      headline: "Every visit becomes part of your record.",
      subtext:
        "A conversation becomes a structured history. A history becomes a timeline. A timeline is what your doctor sees next.",
      steps: ["Patient", "AI Assistant", "Structured History", "Health Timeline", "Doctor Review"],
      footnote: "This is where Part 2 of the MediKiosk story continues.",
      aboutHeading: "About MediKiosk",
      aboutText:
        "MediKiosk is being built as an AI-powered patient case-taking and digital health record platform — designed so a health story only has to be told once.",
    },
  

  phase2: {
    problem: {
      eyebrow: "The Problem",
      headline: "Your health story is everywhere.",
      fragments: [
        "Lab Report",
        "Prescription",
        "Old Medical Record",
        "Doctor Note",
        "Medication",
        "Previous Visit",
        "Patient Memory",
      ],
      resolution: "But your doctor needs the whole picture.",
    },
    unify: {
      eyebrow: "MediKiosk Brings It Together",
      headline: ["One patient.", "One story.", "One connected record."],
      nodes: [
        "Patient Information",
        "Medical History",
        "Documents",
        "Medications",
        "Allergies",
        "Consultations",
        "Reports",
        "Health Timeline",
      ],
      recordLabel: "MediKiosk Health Record",
      recordCaption: "Everything, in one place your doctor can trust.",
    },
    workflow: {
      eyebrow: "How It Works",
      headline: "From first hello to a doctor-verified record.",
      subtext: "Eight steps. One continuous story — scroll to follow it.",
      steps: [
        { title: "Register", subtitle: "Create Profile + Health ID", screenLabel: "Registration" },
        { title: "Tell Your Story", subtitle: "Voice / Touch AI Conversation", screenLabel: "AI Conversation" },
        { title: "Add Your Documents", subtitle: "Upload / Scan Reports", screenLabel: "Document Upload" },
        { title: "MediKiosk Structures It", subtitle: "Extract + Organize Information", screenLabel: "Processing" },
        { title: "AI Summary", subtitle: "Create Structured Clinical Summary", screenLabel: "AI Summary" },
        { title: "Doctor Review", subtitle: "Review + Edit + Verify", screenLabel: "Doctor Review" },
        { title: "Final Report", subtitle: "Doctor-Verified Record", screenLabel: "Final Report" },
        { title: "Save & Access", subtitle: "Health ID / QR", screenLabel: "Health ID" },
      ],
    },
    understand: {
      eyebrow: "What MediKiosk Understands",
      headline: "A conversation becomes structured information.",
      conversation: "I've had headaches for about three days. They get worse in the evening.",
      chiefComplaint: "Chief Complaint",
      chiefComplaintValue: "Headache",
      duration: "Duration",
      durationValue: "3 days",
      pattern: "Pattern",
      patternValue: "Worse in evening",
      alsoConsidered: "MediKiosk also checks against",
      alsoConsideredItems: ["Medical History", "Allergies", "Medicines", "Previous Reports"],
      disclaimer: "This is information structuring, not a diagnosis. Only a doctor can diagnose.",
    },
    documentIntel: {
      eyebrow: "Document Intelligence",
      headline: "Reports don't have to stay paper.",
      subtext: "MediKiosk reads medical documents and turns them into structured, searchable data.",
      stages: ["Medical Document", "Scanning", "Information Extraction", "Structured Record"],
      sampleDoc: "Blood Test Report",
      values: [
        { label: "Hemoglobin", value: "13.8 g/dL" },
        { label: "WBC", value: "7,200 /µL" },
        { label: "Platelets", value: "2.6 lakh /µL" },
      ],
      demoNote: "Illustrative values shown for demo purposes only.",
    },
    doctorReview: {
      eyebrow: "Doctor Review",
      headline: "AI prepares. Doctors decide.",
      stages: ["AI Draft", "Doctor Review", "Edit", "Verify", "Final Record"],
      trustNote: "MediKiosk prepares the summary. It never replaces the doctor's judgment.",
    },
    timeline: {
      eyebrow: "Patient Timeline",
      headline: "A lifetime of care, in order.",
      entries: [
        { year: "2024", label: "Visit" },
        { year: "2025", label: "Lab Report" },
        { year: "2025", label: "Prescription" },
        { year: "2026", label: "Consultation" },
        { year: "2026", label: "Medical Document" },
      ],
    },
    healthId: {
      eyebrow: "Health ID",
      cardBrand: "MediKiosk",
      idLabel: "Your Health ID",
      idNumber: "MED-26-001245",
      qrPlaceholder: "QR",
      tagline: "Your health story, securely accessible.",
    },
    closing: {
      headline: ["From conversation", "to understanding.", "From understanding", "to better-informed care."],
      cta: "Explore MediKiosk",
    },
  },
  phase3: {
    forWho: {
      eyebrow: "Who MediKiosk Is For",
      headline: ["Built for everyone who helps care happen."],
      roles: [
        { label: "Patients", desc: "Tell your story. Keep your health history together." },
        { label: "Doctors", desc: "Understand the patient before the consultation." },
        { label: "Hospitals & Clinics", desc: "Organize patient intake and digital records." },
        { label: "Healthcare Teams", desc: "Reduce fragmented information." },
        { label: "Community Health", desc: "Support multilingual and accessible patient interactions." },
        { label: "AYUSH Practitioners", desc: "Capture structured AYUSH-related history." },
      ],
    },
    useCases: {
      eyebrow: "Use Cases",
      headline: ["Built around real", "moments of care."],
      items: [
        { number: "01", title: "First Consultation" },
        { number: "02", title: "Follow-up Visit" },
        { number: "03", title: "Chronic Care" },
        { number: "04", title: "Medical Document Review" },
        { number: "05", title: "Pre-Consultation Intake" },
        { number: "06", title: "Multilingual Patient Interaction" },
        { number: "07", title: "AYUSH History" },
        { number: "08", title: "Digital Health Record" },
      ],
    },
    security: {
      eyebrow: "Security & Privacy",
      headline: ["Your health information deserves trust."],
      items: ["Consent-based access", "Role-based permissions", "Audit-ready activity", "Secure authentication", "Patient-centered access"],
      note: "Security practices reflect the current implementation and continue to evolve.",
    },
    faq: {
      eyebrow: "FAQ",
      headline: ["Questions, answered plainly."],
      items: [
        { q: "What is MediKiosk?", a: "MediKiosk is an AI-powered patient case-taking and digital health record platform that helps organize a patient's health story for doctors and care teams." },
        { q: "How does MediKiosk help patients?", a: "It gives patients a simple, voice- or touch-based way to share their health history, and keeps that history together for future visits." },
        { q: "How does the AI assistant work?", a: "The assistant asks structured questions, listens or reads responses, and organizes them into a clear summary for the care team." },
        { q: "Does MediKiosk diagnose patients?", a: "No. MediKiosk is designed to assist with information collection and organization. Clinical decisions remain with qualified healthcare professionals." },
        { q: "Can patients use voice or touch?", a: "Yes. Patients can share their history by speaking or by tapping through guided questions, whichever feels easier." },
        { q: "Does MediKiosk support multiple languages?", a: "Yes. MediKiosk is built to support multiple Indian languages so patients can share their story comfortably." },
        { q: "Can doctors review AI-generated information?", a: "Yes. Every AI-assisted summary is presented to the doctor for review, editing, and verification before it becomes part of the record." },
        { q: "Can medical documents be uploaded?", a: "Yes. Patients and care teams can upload documents, which MediKiosk helps scan and organize into structured information." },
        { q: "How does Health ID work?", a: "A Health ID gives a patient a single, scannable reference point to their organized health story across visits." },
        { q: "Is ABHA integration available?", a: "The architecture is designed to support ABHA/ABDM integration. Live integration depends on the final implementation and authorized APIs." },
      ],
    },
    finalMessage: {
      headline: ["Your health story matters."],
      lines: ["Make it easier to share.", "Easier to understand.", "Easier to carry forward."],
      brandLine: "Meet MediKiosk.",
      ctaPrimary: "Get Started",
      ctaSecondary: "Explore How It Works",
    },
    orgCta: {
      headline: ["Ready to rethink", "patient intake?"],
      buttons: [
        { label: "For Patients", to: "/for-patients" },
        { label: "For Doctors", to: "/for-doctors" },
        { label: "For Organizations", to: "/for-organizations" },
      ],
    },
    footer: {
      brandTagline: ["Your Health.", "Your History.", "Your Care."],
      productHeading: "Product",
      productLinks: [
        { label: "How It Works", to: "/how-it-works" },
        { label: "Features", to: "/features" },
        { label: "For Patients", to: "/for-patients" },
        { label: "For Doctors", to: "/for-doctors" },
      ],
      companyHeading: "Company",
      companyLinks: [
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
      ],
      trustHeading: "Trust",
      trustLinks: [
        { label: "Privacy", to: "/privacy" },
        { label: "Consent", to: "/consent" },
        { label: "Security", to: "/security" },
      ],
      languagesHeading: "Languages",
      copyright: "MediKiosk. All rights reserved.",
    },
  },
  },
  features: {
    hero: {
      badge: "MediKiosk Features",
      headline: "Healthcare, Reimagined Around You.",
      subtext:
        "From AI-assisted health conversations to structured medical records, MediKiosk brings your health journey together in one connected experience.",
      ctaPrimary: "Explore Features",
      ctaSecondary: "How It Works",
    },
    intro: {
      heading: "Everything You Need for Your Health Journey",
      subtext:
        "MediKiosk combines intelligent assistance, structured records, document understanding and secure clinical workflows.",
    },
    aiAssistant: {
      eyebrow: "AI Health Assistant",
      heading: "AI Health Assistant",
      description:
        "Have a natural conversation about your health using voice or touch. MediKiosk guides the conversation through adaptive questions and helps organize your health information.",
      panelTitle: "AI Health Assistant",
      question: "What's your main health concern today?",
      startSpeaking: "Start Speaking",
      answerByTouch: "Answer by Touch",
      options: { fever: "Fever", pain: "Pain", cough: "Cough", weakness: "Weakness" },
      stepLabel: "Step 3 of 12",
      progressLabel: "History completion: 42%",
    },
    medicalHistory: {
      eyebrow: "Structured Records",
      heading: "Your Medical History, Structured",
      description:
        "Every conversation becomes an organized, doctor-ready record — nothing gets lost between visits.",
      categories: {
        presentIllness: "Present Illness",
        pastHistory: "Past History",
        medicines: "Medicines",
        allergies: "Allergies",
        familyHistory: "Family History",
        surgeries: "Surgeries",
      },
      statusLabels: {
        patientProvided: "Patient Provided",
        aiStructured: "AI Structured",
        doctorVerified: "Doctor Verified",
      },
      flow: { patient: "Patient information", ai: "AI organization", doctor: "Doctor verification" },
    },
    timeline: {
      eyebrow: "Medical Timeline",
      heading: "See Your Health Journey Clearly",
      description: "Every diagnosis, visit and report, laid out on one continuous timeline.",
      entries: [
        { year: "2022", label: "Diabetes diagnosed" },
        { year: "2023", label: "Hypertension diagnosed" },
        { year: "2024", label: "Hospital consultation" },
        { year: "2025", label: "Lab report" },
        { year: "2026", label: "Current consultation" },
      ],
    },
    documentIntel: {
      eyebrow: "Document Intelligence",
      heading: "Make Medical Documents Easier to Understand",
      description:
        "Upload a report or prescription and MediKiosk turns it into clear, structured information doctors can act on.",
      stages: ["Original Document", "Scanning", "Extracting", "Structured Information"],
      sampleDoc: "Lab_Report_March2026.pdf",
      structuredLabel: "Structured Information",
      fields: { diagnosis: "Diagnosis", testResults: "Test Results", medicines: "Medicines", findings: "Important Findings" },
      fieldValues: {
        diagnosis: "Type 2 Diabetes",
        testResults: "HbA1c: 7.2%",
        medicines: "Metformin 500mg",
        findings: "Elevated glucose",
      },
      demoNote: "Illustrative demo data — not a real patient record.",
    },
    redFlag: {
      eyebrow: "Clinical Safety",
      heading: "Important Information, Clearly Highlighted",
      description:
        "When certain symptoms come up in conversation, MediKiosk highlights them for clinical review — so nothing urgent gets missed before a doctor looks at the record.",
      panelTitle: "Potential Attention Needed",
      items: ["Chest discomfort", "Breathing difficulty", "Persistent fever"],
      note: "Highlighted for clinical review.",
      disclaimer:
        "MediKiosk does not diagnose conditions. Highlighted items are flagged only to support a doctor's review.",
    },
    multilingual: {
      eyebrow: "Multilingual",
      heading: "Healthcare That Speaks Your Language",
      description:
        "Patients can share their health story in the language they're most comfortable with — doctors receive it clearly structured, in any of the three.",
      languages: [
        { label: "English", nativeLabel: "English", sample: "How are you feeling today?" },
        { label: "Bengali", nativeLabel: "বাংলা", sample: "আজ আপনার কেমন লাগছে?" },
        { label: "Hindi", nativeLabel: "हिन्दी", sample: "आज आप कैसा महसूस कर रहे हैं?" },
      ],
    },
    ayush: {
      eyebrow: "AYUSH Mode",
      heading: "AYUSH Mode",
      description:
        "For patients who prefer a traditional health framework, MediKiosk can also capture structured information across recognized AYUSH fields.",
      fields: {
        prakriti: "Prakriti",
        vikriti: "Vikriti",
        agni: "Agni",
        koshtha: "Koshtha",
        ahara: "Ahara",
        vihara: "Vihara",
      },
      fieldDescriptions: {
        prakriti: "Constitution type",
        vikriti: "Current imbalance",
        agni: "Digestive strength",
        koshtha: "Bowel nature",
        ahara: "Diet pattern",
        vihara: "Lifestyle habits",
      },
      note: "Presented as structured health information, not a medical diagnosis.",
    },
    doctorVerification: {
      eyebrow: "Doctor Verification",
      heading: "AI-Assisted. Doctor Verified.",
      description:
        "MediKiosk organizes what a patient shares into a structured summary — every record is then reviewed and verified by a doctor before it's considered final.",
      flow: ["Patient Information", "AI Structured Summary", "Doctor Review", "Verified Record"],
      reviewPanelTitle: "Clinical Review Panel",
      reviewLabel: "Doctor Review",
      verifiedLabel: "Verified",
      note: "AI assists with structure. The doctor reviews and remains responsible for verification.",
    },
    healthId: {
      eyebrow: "Secure Health ID",
      heading: "One Secure Health Identity",
      description:
        "A single Health ID gives patients one consistent, secure identity across every visit, report and provider.",
      cardBrand: "MediKiosk Health ID",
      idLabel: "Health ID",
      idNumber: "MED-26-001245",
      nameLabel: "Patient Name",
      patientName: "Ananya Sharma",
      statusLabel: "Verified Record",
      qrCaption: "One secure identity, recognized at every visit and provider.",
      qrPlaceholderNote: "Decorative secure-seal graphic — illustrative only, not a scannable code.",
      secureCodeLabel: "Secure ID",
      demoNote: "Illustrative demo card — not a real patient record.",
    },
    overview: {
      eyebrow: "Feature Overview",
      heading: "Everything, at a Glance",
      description: "A quick look at everything MediKiosk brings together in one connected health experience.",
      cards: [
        { title: "AI Health Assistant", subtitle: "Voice + Touch" },
        { title: "Structured Medical History", subtitle: "Organized Health Record" },
        { title: "Medical Timeline", subtitle: "Your Health Journey" },
        { title: "Document Intelligence", subtitle: "Reports & Documents" },
        { title: "Red Flag Detection", subtitle: "Important Information" },
        { title: "Multilingual", subtitle: "English • বাংলা • हिन्दी" },
        { title: "AYUSH Mode", subtitle: "Traditional Health Information" },
        { title: "Secure Health ID", subtitle: "Consent-Based Access" },
      ],
    },
    finalCta: {
      headline: ["Your Health.", "Your History.", "Your Care."],
      subtext: "Experience a more connected way to understand and manage your health information.",
      ctaPrimary: "Get Started",
      ctaSecondary: "How It Works",
    },
  },
  common: {
    voiceMode: "Voice Mode",
    voiceModeHint: "Click to speak",
    touchMode: "Touch Mode",
    touchModeHint: "Tap to answer",
    quickActions: "Quick Actions",
    uploadDocuments: "Upload Documents",
    myTimeline: "My Timeline",
    ayushMode: "AYUSH Mode",
    previousVisits: "Previous Visits",
    secureEnvironment: "You are in a secure and private environment",
    healthId: "Health ID",
    scanToAccess: "Scan to Access Your Health Records",
    comingInPartB: "This screen will be built in Part B.",
    loading: "Loading",
    retry: "Try again",
    save: "Save changes",
    cancel: "Cancel",
    continue: "Continue",
    back: "Back",
    viewAll: "View all",
    optional: "Optional",
    required: "Required",
  },
  status: {
    stable: "Stable",
    attention: "Needs attention",
    critical: "Critical",
    pending: "Pending",
    verified: "Verified",
  },
  emptyState: {
    title: "Nothing here yet",
    description: "Once there's activity, it will show up in this space.",
  },
  patientRegister: {
    privacyPolicyLink: "Privacy Policy",
    step2Badge: "Step 2 of 2",
    step2Title: "Verify your details",
    step2Description:
      "Identity and health-record verification will be added in a future phase. Your Step 1 details are saved so you can continue when this step is built.",
    step2Note: "This is a placeholder — no account has been created yet.",
  },
  patientRegisterAddress: {
    sectionLabel: "Address",
    countryLabel: "Country",
    countryPlaceholder: "Select country",
    stateLabel: "State",
    statePlaceholder: "Select state",
    districtLabel: "District",
    districtPlaceholder: "Enter district",
    zipLabel: "ZIP / PIN Code",
    zipPlaceholder: "Enter ZIP / PIN code",
  },
  patientRegisterConsent: {
    prefix: "I agree to the",
    privacyPolicyLabel: "Privacy Policy",
    connector: "and",
    consentTermsLabel: "Consent Terms",
    error: "Please confirm that you agree to the Privacy Policy and Consent Terms.",
  },
  patientRegisterOtp: {
    emailTitle: "Verify your email",
    emailDescription:
      "Let us know that this email address belongs to you. Enter the code from the email we sent to",
    emailInputLabel: "Enter the code from your email",
    mobileTitle: "Verify your registered mobile number",
    mobileDescription:
      "Let us know that your registered mobile number belongs to you. Enter the code we sent to the mobile number registered with your ABDM ID.",
    mobileInputLabel: "Enter the code sent to your registered mobile number",
    phoneTitle: "Verify your phone number",
    phoneDescription:
      "Let us know that this phone number belongs to you. Enter the code we sent to",
    phoneInputLabel: "Enter the code sent to your phone number",
    resendPrefix: "Didn't receive the code?",
    resendCountdown: "Resend Code in {seconds}s",
    resendAction: "Resend Code",
    incompleteError: "Please enter the complete verification code.",
    invalidError: "Invalid verification code. Please try again.",
    securityNote: "Your health data is secure with us. We follow highest security standards.",
  },
  personalDetailsStep: {
    sectionPersonalTitle: "1. Personal Information",
    sectionContactTitle: "2. Contact Information",
    sectionSecurityTitle: "3. Account Security",
    profilePhotoLabel: "Profile Photo",
    profilePhotoUploadButton: "Upload Photo",
    profilePhotoHint: "JPG or PNG, up to 5 MB.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    alternatePhoneLabel: "Alternate Phone (Optional)",
    alternatePhonePlaceholder: "Enter alternate number",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    phoneRequiredError: "Enter your phone number to continue.",
    passwordMismatchError: "Passwords do not match.",
    whyChooseTitle: "Why Choose MediKiosk?",
    whyChoose: [
      "Secure and encrypted data storage",
      "AI-powered health insights",
      "Easy appointment & records management",
      "Trusted by thousands of users",
      "24/7 support and assistance",
    ],
    tipsTitle: "Tips for a Smooth Registration",
    tips: [
      "Use your correct mobile number",
      "Enter accurate personal details",
      "Keep your documents ready",
      "Review everything before submit",
    ],
    privacySecureConfidential: "Secure & Confidential",
  },
  aiInterview: {
    headerTitle: "AI Health Interview",
    headerSubtitle: "Let's understand your health better.",
    progressLabel: "Interview Progress",
    questionCounter: "Question {current} of {total}",
    intro: {
      greeting: "Hi! I'm your MediKiosk Health Assistant.",
      subtext:
        "I'll ask you a few questions about how you're feeling so we can better understand your health concerns.",
      points: [
        "Your data is private and secure.",
        "Your responses are confidential.",
        "This will take only a few minutes.",
        "You can skip the interview anytime.",
      ],
      feature1Title: "Private & Secure",
      feature1Desc: "Your data is confidential and encrypted.",
      feature2Title: "Personalized Care",
      feature2Desc: "Helps doctors understand your health better.",
      feature3Title: "Quick & Easy",
      feature3Desc: "Takes just a few minutes to complete.",
      startButton: "Start Interview",
      skipButton: "Skip for now",
    },
    questions: [
      "What brings you here today? Please describe your main health concern.",
      "When did you first notice this concern? Please mention the time or duration.",
      "How would you describe the symptoms?",
      "How often does this happen?",
      "Is there anything else you would like your doctor to know?",
    ],
    voiceDemoAnswers: [
      "I've had a headache and mild fever for the past two days.",
      "It started about two days ago and has been on and off since.",
      "It's a dull ache around my forehead, worse in the evenings.",
      "It happens almost every day, mostly in the afternoon.",
      "No, that's everything for now. Thank you.",
    ],
    answerPlaceholder: "Type your answer here...",
    answerRequiredError: "Please type an answer or use Voice Input before continuing.",
    voiceInputButton: "Voice Input",
    nextButton: "Next",
    previousButton: "Previous",
    skipInterview: "Skip Interview",
    tip: "You can type your answer or use voice input for a better experience.",
    interviewTipsTitle: "Interview Tips",
    interviewTips: [
      "Answer honestly",
      "Be as specific as possible",
      "Include all relevant details",
      "Take your time, no rush",
    ],
    listeningTitle: "Listening...",
    listeningSubtitle: "Speak now",
    cancelButton: "Cancel",
    voicePopoverTitle: "Select voice language",
    voicePopoverHint:
      "Voice language can be selected each time you use voice input. It does not change the interface language.",
    acknowledgement: "Got it, thank you. Let's continue.",
    completedTitle: "Interview",
    completedHighlight: "Completed!",
    completedMessage: "Thank you! Your responses have been recorded.",
    completedSubMessage: "You can now continue to the next step.",
    continueButton: "Continue to Next Step",
    skipForNow: "Skip for now",
    privacyNote: "Your responses are confidential and will help us understand your health concerns.",
    medicalDisclaimer:
      "This health assistant is for information gathering and does not provide a medical diagnosis.",
  },
  documentUpload: {
       progressSteps: [
      "Personal Information",
      "Phone Verification",
      "AI Health Interview",
      "Upload Documents",
      "AI Analysis & Red Flags",
      "Health Summary",
      "Review Summary",
      "Account Created",
    ],
    registrationProgressTitle: "Registration Progress",
    progressStatusCompleted: "Completed",
    progressStatusCurrent: "Current Step",
    progressStatusPending: "Pending",
    pageTitle: "Upload Your Health Documents",
    pageSubtitle:
      "Upload your medical documents so they can be organized with your health information.",
    infoBanner:
      "You can upload documents now or skip this step — you'll be able to add them later from your dashboard.",
    dropzone: {
      heading: "Upload your health documents",
      dragText: "Drag & drop your files here",
      orLabel: "or",
      browseButton: "Browse Files",
      supportedFormats: "Supported formats: PDF, JPG, PNG · Max size 10 MB per file",
    },
    aiNote:
      "Choose a category for each document below. Automatic AI detection is coming soon — for now you can pick the category yourself.",
    categoriesTitle: "Document Categories",
    categoriesHint: "Choose a category for each document — you can change it anytime.",
    categories: {
      lab: {
        title: "Lab & Test Reports",
        description: "Blood tests, urine tests, X-Ray reports, ECG, and other laboratory reports",
      },
      medical: {
        title: "Medical Reports",
        description: "Doctor reports, diagnosis summaries, discharge summaries, and clinical notes",
      },
      prescriptions: {
        title: "Prescriptions & Medicines",
        description: "Doctor prescriptions, medicine lists, dosage instructions, and medication history",
      },
      imaging: {
        title: "Imaging & Scan Reports",
        description: "X-Ray, MRI, CT scan, ultrasound, and other scan reports",
      },
    },
    filesCountLabel: "{count} files",
    uploadedTitle: "Uploaded Documents",
    uploadedCountBadge: "{count} files uploaded",
    emptyTitle: "No documents uploaded yet",
    emptyDescription: "Upload your health documents to continue, or skip this step and add them later.",
    detectedCategoryLabel: "Suggested category",
    changeCategoryButton: "Change Category",
    changeCategoryModalTitle: "Change document category",
    changeCategoryModalDescription: "Choose the category that best matches this document.",
    viewButton: "View",
    removeButton: "Remove",
    statusUploading: "Uploading…",
    statusUploaded: "Ready",
    tipsTitle: "Tips for better results",
    tips: [
      "Upload clear and readable files",
      "Make sure all text is visible",
      "You can upload multiple files at once",
      "You can add more documents later from your dashboard",
    ],
    needHelpTitle: "Need help?",
    needHelpDescription: "Our support team is here to help you at any step.",
    contactSupportButton: "Contact Support",
    privacyTitle: "Your privacy is our priority",
    privacyNote:
      "All documents are encrypted and stored securely. Only authorized doctors can access with your permission.",
    skipButton: "Skip for now",
    skipHint: "You can upload documents later from your dashboard.",
    continueButton: "Continue →",
    continueHint: "You can review and confirm your details next.",
    unsupportedFormatError: "{fileName} isn't a supported file type. Please upload PDF, JPG, or PNG files.",
    fileTooLargeError: "{fileName} is larger than 10 MB. Please upload a smaller file.",
    columnFileName: "File Name",
    columnType: "Type",
    columnSize: "Size",
    columnCategory: "Category",
    columnStatus: "Status",
    columnActions: "Actions",
  },
  aiAnalysis: {
    pageTitle: "AI Document Analysis & Red-Flag Detection",
    pageSubtitle: "We've analyzed your uploaded medical documents using advanced AI to detect important health indicators.",
    statusHeading: {
      clear: "No Critical Health Alerts Detected",
      attention: "Some Findings May Need Attention",
      critical: "Important Health Alert",
    },
    statusBody: {
      clear: "We reviewed your uploaded medical documents and did not identify any critical findings that require immediate attention.",
      attention: "We found a few results that you may want to discuss with your doctor.",
      critical: "Our AI has detected potential health concerns in your uploaded documents that may require medical attention. Please consult a qualified doctor for proper evaluation.",
    },
    concernBadgeLabel: "Potential Concern(s)",
    detectedConcernsTitle: "Detected Concerns",
    priorityLabel: {
      low: "Low Priority",
      medium: "Medium Priority",
      high: "High Priority",
      critical: "Critical Priority",
    },
    viewAllDetailsButton: "View All Details",
    summaryTitle: "Analysis Summary",
    metrics: {
      documentsAnalyzed: "Documents Analyzed",
      documentsAnalyzedCaption: "Successfully processed",
      dataPointsExtracted: "Data Points Extracted",
      dataPointsExtractedCaption: "From all documents",
      potentialConcerns: "Potential Concerns Detected",
      potentialConcernsCaption: "Require attention",
      confidenceScore: "Confidence Score",
      confidenceScoreCaption: "High AI Confidence",
    },
    disclaimer: "AI analysis is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.",
    howItWorksTitle: "How AI Analysis Works?",
    howItWorks: [
      "Reads uploaded documents using OCR technology",
      "Extracts important medical information",
      "Detects abnormal values and patterns",
      "Identifies potential health risks and concerns",
      "Flags critical findings for your attention",
    ],
    uploadedDocumentsTitle: "Your Uploaded Documents",
    documentsCountBadge: "{count} Documents",
    uploadedOnLabel: "Uploaded on {date}",
    viewAllDocumentsButton: "View All Documents",
    noDocumentsTitle: "No documents to analyze yet",
    noDocumentsDescription: "You can go back and upload your health documents, or continue without them.",
    backButton: "Back",
    continueButton: "Continue to Review Summary",
    continueHint: "Next: Review your information before creating account",
  },
    healthSummary: {
    pageTitle: "Health Summary",
    pageSubtitle: "AI-generated summary based on your health interview and uploaded medical documents.",
    aiBadge: "AI-generated / Informational",
    generatedLabel: "Generated",
    lastUpdatedLabel: "Last Updated",
    editButton: "Edit / Modify Summary",
    editToastTitle: "Editing coming soon",
    editToastDescription:
      "A guided way to edit this summary is on its way — for now, changes can be made from your dashboard after registration.",
    metrics: {
      documentsAnalyzed: "Documents Analyzed",
      dataPointsExtracted: "Data Points Extracted",
      potentialConcerns: "Potential Concerns",
      confidenceScore: "Confidence Score",
    },
    tabs: {
      summary: "Summary",
      keyFindings: "Key Findings",
      labHighlights: "Lab Highlights",
      timeline: "Timeline",
      lifestyleAyush: "Lifestyle & AYUSH",
    },
    comingSoonTitle: "Coming soon",
    comingSoonDescription: "This tab will be filled in during the next phase of the Health Summary build.",
    sections: {
      overallSummaryTitle: "Overall Summary",
      keyHighlightsLabel: "Key numbers behind this summary:",
      documentsOnFileBullet: "{count} document(s) on file",
      activeMedicationsBullet: "{count} active medication(s) on record",
      abnormalLabValuesBullet: "{count} lab value(s) outside the reference range",
      chiefComplaintTitle: "Chief Complaint",
      hpiTitle: "History of Present Illness (HPI)",
      pastMedicalHistoryTitle: "Past Medical History",
      pastMedicalHistoryEmpty: "No significant past medical history reported.",
      surgeryHistoryTitle: "Surgery / Procedure History",
      surgeryHistoryEmpty: "No previous surgeries or procedures reported.",
      currentMedicinesTitle: "Current Medicines",
      currentMedicinesEmpty: "No current medicines reported.",
      medicineColumns: { medicine: "Medicine", dosage: "Dosage", frequency: "Frequency", purpose: "Purpose", source: "Source" },
      allergiesTitle: "Allergies",
      allergiesEmpty: "No known allergies reported.",
      familyHistoryTitle: "Family History",
      familyHistoryEmpty: "No significant family history reported.",
      lifestyleTitle: "Lifestyle / Personal History",
      lifestyleEmpty: "No lifestyle information reported.",
    },
    disclaimer:
      "This AI-generated summary is for information purposes only and does not replace professional medical advice or diagnosis.",
    backButton: "Back",
    continueButton: "Continue to Review Summary",
    continueHint: "Next: review your information before creating your account",
  },
  reviewSummary: {
    pageTitle: "Review Your Information",
    pageSubtitle: "Please review your details before creating your account.",
    personalInfoTitle: "Personal Information",
    fields: {
      name: "Full Name",
      dob: "Date of Birth",
      gender: "Gender",
      contact: "Email / ABDM ID",
      location: "Location",
    },
    aiInterviewTitle: "AI Health Interview",
    aiInterviewCompleted: "Your health interview responses have been recorded.",
    aiInterviewSkipped: "You skipped the health interview — you can complete it later from your dashboard.",
    documentsTitle: "Uploaded Documents",
    documentsSubtitle: "Here's a summary of the documents you uploaded.",
    documentsUploadedLabel: "{count} Documents Uploaded",
    noDocumentsUploaded: "No documents uploaded yet — you can add them later from your dashboard.",
    backButton: "Back",
    createAccountButton: "Create Account →",
    createAccountHint: "This creates your MediKiosk account with the details above.",
  },
  
  accountCreated: {
    successTitle: "Your Account is Created!",
    successSubtitle: "Welcome to MediKiosk. Your health profile is ready.",
    successNote: "You can now access your dashboard and manage your health.",
    patientSummaryTitle: "Patient Summary",
    patientSummarySubtitle: "Here is your health profile overview.",
    fields: {
      name: "Name",
      dob: "Date of Birth",
      gender: "Gender",
      contact: "Contact",
      location: "Location",
      registeredOn: "Registered On",
    },
    documentsTitle: "Your Uploaded Documents",
    documentsSavedNote: "We have securely saved your documents.",
    documentsCountLabel: "{count} Documents Uploaded",
    noDocumentsNote: "You haven't uploaded any documents yet. You can add them anytime from your dashboard.",
    healthIdTitle: "Your MediKiosk Health ID",
    healthIdSubtitle: "Use this ID or QR code to share your health profile with doctors.",
    keepSafeTitle: "Keep this ID safe",
    keepSafeDescription: "You can share this ID or QR code with doctors to give them access to your health records.",
    downloadQrButton: "Download QR Code",
    whatsNextTitle: "What's Next?",
    whatsNextItems: [
      "Your health profile is ready",
      "You can now access your dashboard",
      "Upload more documents anytime",
      "Share your profile with doctors",
    ],
    finalCtaTitle: "You're All Set!",
    finalCtaDescription:
      "Go to your dashboard to manage your health profile, view documents, and take control of your health.",
    dashboardButton: "Go to Patient Dashboard →",
  },
  privacyPolicy: {
    eyebrow: "Legal",
    title: "MediKiosk Privacy Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdatedValue: "Demo placeholder — final date to be added at launch",
    intro:
      "This Privacy Policy explains, in plain language, how MediKiosk collects, uses, stores, and protects information when you use our patient registration and case-taking experience. This is a demo build; some details below are placeholders and will be finalized before any production launch.",
    backLink: "Back to Registration",
    sections: {
      introduction: {
        heading: "Introduction",
        body: "MediKiosk is an AI-assisted patient case-taking and digital health record platform. This policy applies to the patient registration flow and related account features shown in this demo. It describes what information we ask for, why we ask for it, and the choices available to you.",
      },
      infoCollected: {
        heading: "Information We Collect",
        intro:
          "To create and manage your MediKiosk account, we collect the following categories of information.",
        accountInfo: {
          heading: "Account Information",
          body: "Your first name, last name, date of birth, gender, and the password you set when creating your account.",
        },
        abdmEmail: {
          heading: "ABDM ID / Email Address",
          body: "Either your Ayushman Bharat Digital Mission (ABDM) health ID or an email address, used as your account identifier and, where applicable, to support future ABDM-linked health record access.",
        },
        healthInfo: {
          heading: "Health Information",
          body: "Details you choose to share during case-taking, consultations, or document uploads in later steps of the product, such as symptoms, history, and reports. This registration step does not collect health information — it is gathered only in later stages of the flow.",
        },
      },
      howWeUse: {
        heading: "How We Use Information",
        body: "We use the information you provide to create and secure your account, personalize your MediKiosk experience, support clinical case-taking and doctor review, and improve the product. We do not use your information for purposes unrelated to delivering and improving MediKiosk.",
      },
      consent: {
        heading: "User Consent",
        body: "By completing registration, you consent to MediKiosk collecting and processing the information described in this policy for the purposes described here. Where health information is collected in later steps, you will be asked for specific consent before it is shared with a doctor or care team.",
      },
      dataSecurity: {
        heading: "Data Security",
        body: "We take reasonable technical and organizational measures to protect your information from unauthorized access, alteration, or loss. As this is a demo build, production-grade security measures, audits, and certifications will be documented separately before launch.",
      },
      dataStorage: {
        heading: "Data Storage",
        body: "Account information is stored in the systems supporting this demo. Storage location, retention infrastructure, and backup practices for production use are still being finalized and will be described here once confirmed.",
      },
      dataSharing: {
        heading: "Data Sharing",
        body: "We do not sell your personal information. Information may be shared with treating doctors and clinical staff as part of delivering care through MediKiosk, and with service providers who help us operate the platform, under appropriate confidentiality obligations. We do not share your information with third parties for their own marketing purposes.",
      },
      clinicalVerification: {
        heading: "Doctor / Clinical Verification",
        body: "Health information you share in later steps of the product may be reviewed and verified by a licensed doctor or clinical staff as part of your care. This helps ensure accuracy and clinical oversight of the information in your record.",
      },
      userRights: {
        heading: "User Rights",
        body: "You can generally request access to, correction of, or deletion of your account information, subject to any records we are required to retain. In this demo build, these requests can be simulated through the Contact Information below; production workflows for exercising these rights will be added in a later phase.",
      },
      dataRetention: {
        heading: "Data Retention",
        body: "We retain account information for as long as your account is active, or as needed to provide the service. Retention periods for health records and clinical documentation will follow applicable guidance and will be detailed here as the product matures.",
      },
      thirdParty: {
        heading: "Third-Party Services",
        body: "MediKiosk may rely on third-party infrastructure and service providers (for example, hosting or identity verification) to operate the platform. This demo does not integrate live third-party services beyond what is described in this document; any such integrations will be disclosed here when enabled.",
      },
      cookies: {
        heading: "Cookies and Technical Information",
        body: "We use basic technical storage (such as your selected language and theme preferences) to make the product easier to use. This demo does not use tracking or advertising cookies.",
      },
      childrensPrivacy: {
        heading: "Children's Privacy",
        body: "MediKiosk is intended for use by adults registering on their own behalf or, in future phases, by a parent or guardian registering on behalf of a minor with appropriate consent. This demo registration flow is not designed to independently collect information directly from children.",
      },
      policyUpdates: {
        heading: "Policy Updates",
        body: "We may update this Privacy Policy as MediKiosk evolves, particularly as new registration steps, health information features, and integrations are added. Material changes will be reflected on this page with an updated date.",
      },
      contact: {
        heading: "Contact Information",
        body: "For questions about this Privacy Policy or your information, please reach out using the placeholder contact details below. These will be replaced with verified support channels before production launch.",
        email: "privacy@medikiosk.example (placeholder)",
      },
    },
  },
  consentTerms: {
    eyebrow: "Legal",
    title: "MediKiosk Consent Terms",
    lastUpdatedLabel: "Last updated",
    lastUpdatedValue: "Demo placeholder — final date to be added at launch",
    intro:
      "These Consent Terms explain, in plain language, the specific consents you are giving MediKiosk beyond our general Privacy Policy — including how our AI features work, how possible red flags are handled, and how your information may be shared with healthcare professionals. This is a demo build; some details below are placeholders and will be finalized before any production launch.",
    backLink: "Back to Registration",
    sections: {
      aiConsent: {
        heading: "AI Consent",
        body: "MediKiosk uses AI to help conduct case-taking interviews, organize the information you share, and support document understanding. By agreeing to these terms, you consent to your inputs being processed by AI systems as part of delivering this experience. AI-generated summaries and suggestions are intended to support, not replace, the judgment of a licensed doctor.",
      },
      redFlagDetection: {
        heading: "Red-Flag Detection",
        body: "As part of case-taking, MediKiosk's AI may flag symptoms or combinations of symptoms that could indicate a potentially urgent or serious condition (a \"red flag\"). This detection is a supportive aid, not a diagnosis, and is not a substitute for emergency care. If you are experiencing a medical emergency, seek immediate in-person or emergency medical attention rather than relying on this feature.",
      },
      dataConsent: {
        heading: "Data / Medical Document Consent",
        body: "You may choose to upload medical documents, reports, or other health-related files during later steps of the product. By doing so, you consent to MediKiosk storing and processing these documents to build your health record and to support AI-assisted analysis and doctor review. You control what you choose to upload, and this registration step does not itself collect any medical documents.",
      },
      healthcareSharing: {
        heading: "Healthcare Professional Sharing",
        body: "Information you provide, including AI-assisted case-taking summaries and any documents you upload, may be shared with the licensed doctors and clinical staff involved in your care through MediKiosk, so they can review, verify, and act on it. We do not share this information with healthcare professionals outside the course of delivering your care.",
      },
      consentWithdrawal: {
        heading: "Consent Withdrawal",
        body: "You may withdraw your consent to these terms at any time by contacting us using the details on our Privacy Policy page. Withdrawing consent may limit or end your ability to use AI-assisted case-taking, red-flag detection, and related features, and will not affect the lawfulness of any processing carried out before your withdrawal. In this demo build, withdrawal requests can be simulated through the placeholder contact details; production workflows will be added in a later phase.",
      },
    },
  },
  a11y: {
    switchLanguage: "Switch language",
    switchTheme: "Switch theme",
    closeDialog: "Close dialog",
    openMenu: "Open menu",
  },
};

export default en;