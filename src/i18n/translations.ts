export type Language = 'he' | 'ar' | 'en';

export type HelpSection = 'about' | 'understanding' | 'howto';

export const LANGUAGE_META: Record<
  Language,
  { code: Language; nativeName: string; englishName: string; dir: 'rtl' | 'ltr' }
> = {
  he: { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', dir: 'rtl' },
  ar: { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  en: { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
};

export interface Translations {
  appTitle: string;
  nav: {
    glossary: string;
    map: string;
    assistant: string;
    help: string;
    importExport: string;
  };
  helpMenu: {
    about: string;
    understanding: string;
    howto: string;
  };
  helpModal: {
    close: string;
    aboutTitle: string;
    aboutBody: string[];
    aboutHighlightsTitle: string;
    aboutHighlights: string[];
    understandingTitle: string;
    understandingIntro: string;
    understandingPoints: Array<{ title: string; body: string }>;
    howtoTitle: string;
    howtoIntro: string;
    howtoSteps: Array<{ step: string; title: string; body: string }>;
    goGlossary: string;
    goMap: string;
    gotIt: string;
  };
  banner: {
    languageLabel: string;
    titlePlaceholder: string;
    focusQuestionLabel: string;
    focusQuestionPlaceholder: string;
    templates: string;
    loadStarterHeader: string;
    importJson: string;
    aiReviewSuggest: string;
    stage1Label: string;
    stage2Label: string;
    stage3Label: string;
    definedRatio: (defined: number, total: number) => string;
    linksMapped: (count: number) => string;
    onCanvasRatio: (placed: number, total: number) => string;
    conceptsCount: (count: number) => string;
    linksCount: (count: number) => string;
    missingDefCount: (count: number) => string;
    glossaryTab: string;
    mapTab: string;
  };
  glossary: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    nextConnect: string;
    openVisualMap: string;
    seedMultipleTitle: string;
    addConceptTitle: string;
    switchSingle: string;
    switchBatch: string;
    conceptName: string;
    conceptNamePlaceholder: string;
    category: string;
    categoryPlaceholder: string;
    definition: string;
    definitionPlaceholder: string;
    addBtn: string;
    batchPlaceholder: string;
    batchHint: string;
    addConceptsBtn: string;
    searchPlaceholder: string;
    filterAll: (n: number) => string;
    filterNeedsDef: (n: number) => string;
    filterUnlinked: string;
    filterAiFlagged: (n: number) => string;
    emptyTitle: string;
    emptyDesc: string;
    suggestStarterBtn: string;
    noFilterMatch: string;
    outgoing: (n: number) => string;
    incoming: (n: number) => string;
    missingDefinition: string;
    showOnMap: string;
    deleteConcept: string;
    editDefinitionPlaceholder: string;
    aiReviewPrefix: (severity: string) => string;
    suggestedLabel: string;
    applyBtn: string;
    relatedConcepts: string;
    noLinksYet: string;
    thisConceptSuffix: string;
    linkingPhrasePlaceholder: string;
    linkBtn: string;
    relatesToDefault: string;
  };
  mapCanvas: {
    moveEdit: string;
    drawLink: string;
    newConcept: string;
    autoArrange: string;
    hideDefs: string;
    showDefs: string;
    linkPromptClickTarget: (name: string) => string;
    linkPromptClickSource: string;
    fit: string;
    emptyTitle: string;
    emptyDesc: string;
    addFirstConcept: string;
    linksSuffix: (n: number) => string;
    missingDef: string;
    aiDefFlag: (severity: string) => string;
    dragToConnectTitle: string;
    unplacedTitle: (n: number) => string;
    placeAll: string;
    newNodeModalTitle: string;
    nodeNamePlaceholder: string;
    nodeDefPlaceholder: string;
    cancel: string;
    createNode: string;
    nameRelTitle: string;
    relPhrasePlaceholder: string;
    addLink: string;
    conceptInspector: string;
    nameLabel: string;
    categoryLabel: string;
    defLabel: string;
    defPlaceholder: string;
    aiReviewSeverity: (s: string) => string;
    applySuggestedDef: string;
    relationshipsLabel: string;
    deleteConcept: string;
    relInspector: string;
    linkingPhraseLabel: string;
    reverseDirection: string;
    deleteLink: string;
  };
  aiDrawer: {
    title: string;
    reviewTab: string;
    suggestTab: string;
    askTab: string;
    reviewIntro: string;
    reviewRunning: string;
    reviewBtn: string;
    defFindings: (n: number) => string;
    defsLookGood: string;
    suggestedPrefix: string;
    applyDef: string;
    relFindings: (n: number) => string;
    relsLookGood: string;
    labelPrefix: string;
    addLinkBtn: string;
    updateLinkBtn: string;
    missingKeyConcepts: (n: number) => string;
    addedBtn: string;
    addKeyConceptBtn: string;
    suggestGuidanceLabel: string;
    suggestGuidancePlaceholder: string;
    suggestRunning: string;
    suggestBtn: string;
    addToMapBtn: string;
    askLabel: string;
    askPlaceholder: string;
    askRunning: string;
    askBtn: string;
    addShortBtn: string;
  };
  ioModal: {
    title: string;
    exportTab: string;
    importTab: string;
    jsonTitle: string;
    jsonDesc: string;
    downloadJson: string;
    mdTitle: string;
    mdDesc: string;
    pdfTitle: string;
    pdfDesc: string;
    downloadPdf: string;
    gdocsTitle: string;
    gdocsDesc: string;
    signOut: string;
    signInPrompt: string;
    signInBtn: string;
    signingInBtn: string;
    signedInAs: string;
    docTitlePlaceholder: string;
    exportGdocsBtn: string;
    confirmCreateBtn: string;
    creatingBtn: string;
    cancel: string;
    confirmNotice: (title: string, concepts: number, links: number) => string;
    createdSuccess: (title: string) => string;
    openDocument: string;
    uploadTitle: string;
    uploadDesc: string;
    chooseFile: string;
    pasteLabel: string;
    importBtn: string;
  };
  exportDocLabels: {
    focusQuestion: string;
    conceptsLabel: string;
    relationshipsLabel: string;
    glossaryHeading: string;
    noConceptsYet: string;
    categoryLabel: string;
    definitionLabel: string;
    defMissing: string;
    relatedConceptsLabel: string;
    propositionsHeading: string;
    noLinksYet: string;
    relatesTo: string;
    exportedOn: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  he: {
    appTitle: 'ConceptAtlas',
    nav: {
      glossary: 'מילון מושגים',
      map: 'קנבס המפה',
      assistant: 'עוזר AI',
      help: 'עזרה',
      importExport: 'ייבוא / ייצוא',
    },
    helpMenu: {
      about: 'אודות',
      understanding: 'הבנת מפות מושגים',
      howto: 'איך להשתמש באפליקציה',
    },
    helpModal: {
      close: 'סגור חלון עזרה',
      aboutTitle: 'אודות ConceptAtlas',
      aboutBody: [
        'ConceptAtlas הוא מרחב עבודה מובנה לבניית מפות מושגים. האפליקציה מנחה אתכם מהגדרת מונחים ברורה במילון מושגים ועד למיפוי חזותי של קשרים וסקירה ביקורתית בסיוע בינה מלאכותית.',
        'שתי התצוגות — מילון המושגים וקנבס המפה — מסונכרנות בזמן אמת ופועלות על אותו מודל ידע, כך שניתן לערוך הגדרות וקשרים בכל מקום ולראות את השינוי מיד.',
      ],
      aboutHighlightsTitle: 'יכולות מרכזיות',
      aboutHighlights: [
        'תהליך עבודה מובנה בשלושה שלבים: הגדרת מושגים, ניסוח קשרים, ומיפוי מרחבי.',
        'ייבוא מקובץ JSON או Markdown (.md) וייצוא לקובץ JSON, Markdown (.md), PDF ו-Google Docs.',
        'עוזר AI להצעת צמתים חסרים ולסקירת דיוק ושלמות של הגדרות וקשרים.',
        'תמיכה מלאה בעברית, ערבית ואנגלית עם התאמת כיווניות מלאה (RTL / LTR).',
      ],
      understandingTitle: 'הבנת מפות מושגים',
      understandingIntro:
        'מפת מושגים (Concept Map) היא ייצוג חזותי ומאורגן של ידע, שפותח על ידי ג׳וזף נובאק. היא מורכבת משלושה יסודות מרכזיים:',
      understandingPoints: [
        {
          title: '1. שאלת מיקוד (Focus Question)',
          body: 'שאלה ברורה המגדירה את הגבול ואת המטרה של המפה (למשל: "כיצד לולאות משוב מעצבות מערכות מורכבות?"). כל מושג במפה אמור לתרום למענה על שאלה זו.',
        },
        {
          title: '2. מושגים והגדרות מדויקות',
          body: 'מושגים הם רעיונות, תופעות או אובייקטים מרכזיים. הגדרה קצרה ואי-מעגלית מונעת עמימות ומבטיחה שכל צומת מייצג משמעות מובחנת.',
        },
        {
          title: '3. טענות ומילות קישור (Propositions)',
          body: 'שני מושגים המחוברים בחץ ובביטוי פועלי מדויק (כגון "מגביר", "מווסת", "מורכב מ-") יוצרים משפט משמעותי הניתן לקריאה ובחינה ביקורתית.',
        },
      ],
      howtoTitle: 'איך להשתמש באפליקציה',
      howtoIntro: 'פעלו לפי ארבעת השלבים הבאים כדי לבנות, לבחון ולשמור מפת מושגים:',
      howtoSteps: [
        {
          step: '01',
          title: 'הגדירו את המושגים',
          body: 'בסרגל העליון, הזינו כותרת למפה ושאלת מיקוד. בתצוגת "מילון מושגים", הוסיפו מושגים בודדים או בקבוצות וכתבו הגדרה ברורה לכל אחד.',
        },
        {
          step: '02',
          title: 'נסחו קשרים בין מושגים',
          body: 'בכל כרטיס מושג במילון, קשרו למושגים קשורים בעזרת ביטוי קישור מדויק (למשל "גורם ל-" או "נדרש עבור") ובדקו שאין מושגים מבודדים.',
        },
        {
          step: '03',
          title: 'מפו על הקנבס וסקרו עם AI',
          body: 'עברו לתצוגת "קנבס המפה" כדי לגרור צמתים, לצייר קשרים ישירות על הקנבס או להריץ סידור אוטומטי. פתחו את "עוזר AI" להצעת צמתים חסרים ולסקירת דיוק של הגדרות וקשרים.',
        },
        {
          step: '04',
          title: 'ייצוא וייבוא לשמירה וחזרה למפה',
          body: 'לחצו על כפתור "ייבוא / ייצוא" בסרגל העליון. כדי לשמור מפה ולחזור אליה מאוחר יותר, ייצאו אותה כקובץ JSON (השומר גם את מיקום הצמתים) או כקובץ Markdown (.md). כשתרצו להמשיך לעבוד עליה, פתחו את לשונית "ייבוא" וטענו את קובץ ה-JSON או ה-.md ששמרתם. ניתן גם לייצא למסמך PDF או Google Docs לשיתוף והדפסה.',
        },
      ],
      goGlossary: 'מעבר למילון מושגים',
      goMap: 'מעבר לקנבס המפה',
      gotIt: 'הבנתי',
    },
    banner: {
      languageLabel: 'שפה',
      titlePlaceholder: 'תנו שם למפת המושגים...',
      focusQuestionLabel: 'שאלת מיקוד:',
      focusQuestionPlaceholder: 'איזו שאלה מרכזית מפת המושגים הזו באה להסביר?',
      templates: 'תבניות',
      loadStarterHeader: 'טעינת מפה לדוגמה או מפה ריקה',
      importJson: 'ייבוא JSON',
      aiReviewSuggest: 'סקירה והצעות AI',
      stage1Label: 'הגדרת מושגים',
      stage2Label: 'חיבור קשרים',
      stage3Label: 'מיפוי וסקירה',
      definedRatio: (d, t) => `${d}/${t} הוגדרו`,
      linksMapped: (c) => `${c} קשרים`,
      onCanvasRatio: (p, t) => `${p}/${t} על הקנבס`,
      conceptsCount: (n) => `${n} מושגים`,
      linksCount: (n) => `${n} קשרים`,
      missingDefCount: (n) => `${n} ללא הגדרה`,
      glossaryTab: 'מילון מושגים',
      mapTab: 'מפה',
    },
    glossary: {
      step1Title: 'שלב 1: הגדירו את מושגי הליבה',
      step1Desc:
        'רכזו את המושגים המרכזיים הקשורים לשאלת המיקוד וכתבו הגדרה ברורה ואי-מעגלית לכל מושג לפני שתעברו למיפוי.',
      step2Title: 'שלב 2: חברו בין מושגים קשורים',
      step2Desc:
        'בדקו את הקשרים היוצאים והנכנסים של כל מושג בעזרת ביטויי קישור מדויקים, ולאחר מכן עברו לקנבס המפה החזותי.',
      nextConnect: 'הבא: חיבור קשרים',
      openVisualMap: 'פתיחת המפה החזותית',
      seedMultipleTitle: 'הוספת מספר מושגים בבת אחת',
      addConceptTitle: 'הוספת מושג למילון',
      switchSingle: 'מעבר להוספת מושג בודד',
      switchBatch: 'הוספת מספר מושגים בבת אחת',
      conceptName: 'שם המושג',
      conceptNamePlaceholder: 'לדוגמה: הומאוסטזיס',
      category: 'קטגוריה',
      categoryPlaceholder: 'ליבה',
      definition: 'הגדרה',
      definitionPlaceholder: 'הגדרה ברורה ותמציתית...',
      addBtn: 'הוסף',
      batchPlaceholder:
        'הזינו שמות מושגים מופרדים בפסיקים או בשורות חדשות (למשל: מאגר, זרימה, לולאת חיזוק, לולאת איזון)',
      batchHint: 'ניתן להשלים את ההגדרות מיד לאחר ההוספה.',
      addConceptsBtn: 'הוסף מושגים',
      searchPlaceholder: 'חיפוש מושגים לפי שם, הגדרה או קטגוריה...',
      filterAll: (n) => `הכל (${n})`,
      filterNeedsDef: (n) => `חסרה הגדרה (${n})`,
      filterUnlinked: 'ללא קשרים',
      filterAiFlagged: (n) => `סומנו ע״י AI (${n})`,
      emptyTitle: 'מילון המושגים ריק',
      emptyDesc:
        'הוסיפו את המושג הראשון למעלה, ייבאו קובץ JSON או .md דרך כלי הייבוא/ייצוא, או בקשו מעוזר ה-AI להציע מושגי יסוד לנושא שלכם.',
      suggestStarterBtn: 'הצע מושגי פתיחה עם AI',
      noFilterMatch: 'אין מושגים התואמים לסינון הנוכחי.',
      outgoing: (n) => `${n} יוצאים`,
      incoming: (n) => `${n} נכנסים`,
      missingDefinition: 'חסרה הגדרה',
      showOnMap: 'במפה',
      deleteConcept: 'מחיקת מושג',
      editDefinitionPlaceholder: 'כתבו הגדרה ברורה ומדויקת למושג זה...',
      aiReviewPrefix: (sev) => `סקירת AI (${sev}):`,
      suggestedLabel: 'הצעה:',
      applyBtn: 'החל',
      relatedConcepts: 'מושגים קשורים',
      noLinksYet: 'עדיין לא חוברו קשרים. הוסיפו קשר למטה כדי לחבר מושג זה.',
      thisConceptSuffix: 'מושג זה',
      linkingPhrasePlaceholder: 'ביטוי קישור (למשל: מניע)',
      linkBtn: 'קשר',
      relatesToDefault: 'קשור ל',
    },
    mapCanvas: {
      moveEdit: 'הזזה ועריכה',
      drawLink: 'ציור קשר',
      newConcept: 'מושג חדש',
      autoArrange: 'סידור אוטומטי',
      hideDefs: 'הסתר הגדרות',
      showDefs: 'הצג הגדרות',
      linkPromptClickTarget: (name) => `לחצו על מושג יעד לקישור מתוך "${name}"`,
      linkPromptClickSource: 'לחצו על מושג מקור ולאחר מכן על מושג יעד',
      fit: 'התאמה למסך',
      emptyTitle: 'התחילו למפות מושגים',
      emptyDesc: 'הוסיפו מושגים ישירות על הקנבס או הגדירו אותם תחילה במילון המושגים.',
      addFirstConcept: 'הוסף מושג ראשון',
      linksSuffix: (n) => `${n} קשרים`,
      missingDef: 'חסרה הגדרה',
      aiDefFlag: (sev) => `AI: הגדרה (${sev})`,
      dragToConnectTitle: 'גררו למושג אחר ליצירת קשר',
      unplacedTitle: (n) => `מושגים שטרם מוקמו (${n})`,
      placeAll: 'מקם הכל',
      newNodeModalTitle: 'צומת מושג חדש',
      nodeNamePlaceholder: 'שם המושג...',
      nodeDefPlaceholder: 'הגדרה (מומלץ)...',
      cancel: 'ביטול',
      createNode: 'צור צומת',
      nameRelTitle: 'הגדרת ביטוי קישור',
      relPhrasePlaceholder: 'לדוגמה: מניע, מווסת, מהווה סוג של...',
      addLink: 'הוסף קשר',
      conceptInspector: 'מאפייני מושג',
      nameLabel: 'שם',
      categoryLabel: 'קטגוריה',
      defLabel: 'הגדרה',
      defPlaceholder: 'הגדירו מושג זה בבירור...',
      aiReviewSeverity: (s) => `סקירת AI (${s})`,
      applySuggestedDef: 'החל הגדרה מוצעת',
      relationshipsLabel: 'קשרים',
      deleteConcept: 'מחיקת מושג',
      relInspector: 'מאפייני קשר',
      linkingPhraseLabel: 'ביטוי קישור',
      reverseDirection: 'הפוך כיוון',
      deleteLink: 'מחק קשר',
    },
    aiDrawer: {
      title: 'עוזר מפת המושגים (AI)',
      reviewTab: 'סקירת מפה',
      suggestTab: 'הצעת צמתים',
      askTab: 'שאל את העוזר',
      reviewIntro:
        'סוקר כל הגדרה וכל קשר לאיתור חוסרים, ניסוחים עמומים או אי-דיוקים, ומדגיש מושגי מפתח חסרים במפה.',
      reviewRunning: 'סוקר את מפת המושגים...',
      reviewBtn: 'הפעל סקירת מפה',
      defFindings: (n) => `ממצאים בהגדרות (${n})`,
      defsLookGood: 'כל הגדרות המושגים הקיימות נראות מדויקות וברורות.',
      suggestedPrefix: 'הצעה:',
      applyDef: 'החל הגדרה',
      relFindings: (n) => `ממצאים בקשרים (${n})`,
      relsLookGood: 'הקשרים הקיימים וביטויי הקישור נראים תקינים.',
      labelPrefix: 'תווית:',
      addLinkBtn: 'הוסף קשר',
      updateLinkBtn: 'עדכן קשר',
      missingKeyConcepts: (n) => `מושגי מפתח חסרים (${n})`,
      addedBtn: 'נוסף',
      addKeyConceptBtn: 'הוסף מושג מפתח',
      suggestGuidanceLabel: 'מיקוד או זווית אופציונלית',
      suggestGuidancePlaceholder: 'לדוגמה: התמקד בהתערבויות מעשיות או מקרי קצה...',
      suggestRunning: 'מאתר צמתים חסרים...',
      suggestBtn: 'הצע צמתים חסרים',
      addToMapBtn: 'הוסף למפה',
      askLabel: 'שאלו על המושגים, ההיררכיה או ניסוח הקשרים',
      askPlaceholder: 'לדוגמה: אילו ביטויי קישור מתאימים בין מאגר להתהוות?',
      askRunning: 'חושב...',
      askBtn: 'שלח שאלה לעוזר',
      addShortBtn: '+ הוסף',
    },
    ioModal: {
      title: 'ייבוא וייצוא מפה',
      exportTab: 'ייצוא',
      importTab: 'ייבוא (JSON / .md)',
      jsonTitle: 'קובץ JSON',
      jsonDesc: 'שמירה מלאה של המושגים, ההגדרות, המיקומים והקשרים.',
      downloadJson: 'הורד .json',
      mdTitle: 'Markdown',
      mdDesc: 'מילון מושגים מובנה ורשימת טענות קשר בפורמט טקסט נקי.',
      pdfTitle: 'מסמך PDF',
      pdfDesc: 'כולל תמונת מפת המושגים החזותית ואת מילון המושגים המלא.',
      downloadPdf: 'הורד .pdf',
      gdocsTitle: 'ייצוא ל-Google Docs',
      gdocsDesc:
        'יוצר מסמך Google Doc מעוצב ב-Google Drive שלכם עם שאלת המיקוד, מילון המושגים, ההגדרות והקשרים.',
      signOut: 'התנתק',
      signInPrompt: 'התחברו עם חשבון Google כדי לאשר יצירת מסמך.',
      signInBtn: 'Sign in with Google',
      signingInBtn: 'מתחבר...',
      signedInAs: 'מחובר בתור',
      docTitlePlaceholder: 'כותרת מסמך Google Doc',
      exportGdocsBtn: 'ייצא ל-Google Docs',
      confirmCreateBtn: 'אשר וצור מסמך',
      creatingBtn: 'יוצר מסמך...',
      cancel: 'ביטול',
      confirmNotice: (t, c, l) =>
        `פעולה זו תיצור מסמך Google Doc חדש בשם "${t}" עם ${c} מושגים ו-${l} קשרים.`,
      createdSuccess: (t) => `המסמך "${t}" נוצר בהצלחה ב-Google Docs.`,
      openDocument: 'פתח מסמך',
      uploadTitle: 'העלאת קובץ JSON או Markdown (.md)',
      uploadDesc: 'תומך בקובצי JSON ובקובצי Markdown (.md) שיוצאו מ-ConceptAtlas או בפורמט מושגים וקשרים סטנדרטי.',
      chooseFile: 'בחר קובץ JSON או .md',
      pasteLabel: 'או הדבקת JSON / Markdown ישירות',
      importBtn: 'ייבא מפת מושגים',
    },
    exportDocLabels: {
      focusQuestion: 'שאלת מיקוד',
      conceptsLabel: 'מושגים',
      relationshipsLabel: 'קשרים',
      glossaryHeading: 'מילון מושגים',
      noConceptsYet: 'טרם הוגדרו מושגים.',
      categoryLabel: 'קטגוריה',
      definitionLabel: 'הגדרה',
      defMissing: 'הגדרה טרם סופקה.',
      relatedConceptsLabel: 'מושגים קשורים',
      propositionsHeading: 'טענות וקשרי מושגים',
      noLinksYet: 'טרם מופו קשרים.',
      relatesTo: 'קשור ל',
      exportedOn: 'יוצא בתאריך',
    },
  },

  ar: {
    appTitle: 'ConceptAtlas',
    nav: {
      glossary: 'معجم المفاهيم',
      map: 'لوحة الخريطة',
      assistant: 'مساعد AI',
      help: 'مساعدة',
      importExport: 'استيراد / تصدير',
    },
    helpMenu: {
      about: 'حول التطبيق',
      understanding: 'فهم خرائط المفاهيم',
      howto: 'كيفية استخدام التطبيق',
    },
    helpModal: {
      close: 'إغلاق نافذة المساعدة',
      aboutTitle: 'حول ConceptAtlas',
      aboutBody: [
        'ConceptAtlas هو مساحة عمل منظمة لبناء خرائط المفاهيم. يقودكم التطبيق من تعريف المفاهيم بوضوح في المعجم إلى التمثيل البصري للعلاقات والمراجعة المفاهيمية بمساعدة الذكاء الاصطناعي.',
        'يعمل كل من عرض المعجم وعرض الخريطة البصرية بتزامن تام على نفس نموذج البيانات، مما يتيح تعديل التعريفات والعلاقات في أي عرض ورؤية التحديث فوراً.',
      ],
      aboutHighlightsTitle: 'المزايا الرئيسية',
      aboutHighlights: [
        'سير عمل منظم من ثلاث مراحل: تعريف المفاهيم، ربط العلاقات، والتخطيط المكاني والمراجعة.',
        'استيراد ملفات JSON وMarkdown (.md) وتصدير بصيغ JSON وMarkdown (.md) وPDF وGoogle Docs.',
        'مساعد ذكاء اصطناعي لاقتراح عقد مفقودة ومراجعة دقة واكتمال التعريفات والعلاقات.',
        'دعم كامل للغات العبرية والعربية والإنجليزية مع تخطيط RTL وLTR.',
      ],
      understandingTitle: 'فهم خرائط المفاهيم',
      understandingIntro:
        'خريطة المفاهيم هي أداة بصرية لتنظيم المعرفة وتمثيلها، تعتمد على ثلاثة عناصر أساسية:',
      understandingPoints: [
        {
          title: '1. سؤال التركيز (Focus Question)',
          body: 'سؤال محدد يوضح نطاق الخريطة وهدفها (مثل: "كيف تحكم حلقات التغذية الراجعة الأنظمة المعقدة؟"). ينبغي أن يساهم كل مفهوم في الإجابة عنه.',
        },
        {
          title: '2. المفاهيم والتعريفات الدقيقة',
          body: 'المفاهيم هي الأفكار أو الظواهر الأساسية. يساعد التعريف الواضح وغير الدائري على تجنب الغموض وضمان دلالة مستقلة لكل عقدة.',
        },
        {
          title: '3. القضايا وعبارات الربط (Propositions)',
          body: 'ربط مفهومين بسهم موجه وعبارة ربط فعلية دقيقة (مثل "ينظّم"، "يتكون من"، "يؤدي إلى") يشكل جملة معرفية واضحة قابلة للفحص.',
        },
      ],
      howtoTitle: 'كيفية استخدام التطبيق',
      howtoIntro: 'اتبعوا الخطوات الأربع التالية لبناء خريطة مفاهيم وحفظها والعودة إليها:',
      howtoSteps: [
        {
          step: '01',
          title: 'عرّفوا المفاهيم',
          body: 'أدخلوا عنوان الخريطة وسؤال التركيز في الشريط العلوي. في "معجم المفاهيم"، أضيفوا المفاهيم فردياً أو دفعة واحدة واكتبوا تعريفاً دقيقاً لكل مفهوم.',
        },
        {
          step: '02',
          title: 'اربطوا العلاقات في المعجم',
          body: 'داخل بطاقة كل مفهوم، أضيفوا روابط إلى المفاهيم ذات الصلة مع عبارة ربط واضحة وتأكدوا من عدم بقاء مفاهيم معزولة.',
        },
        {
          step: '03',
          title: 'خططوا الخريطة وراجعوها بالذكاء الاصطناعي',
          body: 'انتقلوا إلى "لوحة الخريطة" لتحريك العقد ورسم الروابط مباشرة أو استخدام الترتيب التلقائي. افتحوا "مساعد AI" لاقتراح عقد مفقودة ومراجعة دقة التعريفات والعلاقات.',
        },
        {
          step: '04',
          title: 'التصدير والاستيراد لحفظ الخريطة والعودة إليها',
          body: 'استخدموا زر "استيراد / تصدير" في الشريط العلوي. لحفظ خريطتكم والعودة إليها لاحقاً، صدّروها بصيغة JSON (يحفظ مواقع العقد أيضاً) أو بصيغة Markdown (.md). وعند العودة، افتحوا تبويب "استيراد" وحمّلوا ملف JSON أو .md الذي حفظتموه. كما يمكن التصدير إلى PDF أو Google Docs للمشاركة والطباعة.',
        },
      ],
      goGlossary: 'الانتقال إلى المعجم',
      goMap: 'الانتقال إلى الخريطة',
      gotIt: 'فهمت',
    },
    banner: {
      languageLabel: 'اللغة',
      titlePlaceholder: 'أدخل عنوان خريطة المفاهيم...',
      focusQuestionLabel: 'سؤال التركيز:',
      focusQuestionPlaceholder: 'ما السؤال المحوري الذي تجيب عنه هذه الخريطة؟',
      templates: 'قوالب',
      loadStarterHeader: 'تحميل خريطة نموذجية أو فارغة',
      importJson: 'استيراد JSON',
      aiReviewSuggest: 'مراجعة واقتراحات AI',
      stage1Label: 'تعريف المفاهيم',
      stage2Label: 'ربط العلاقات',
      stage3Label: 'الخريطة والمراجعة',
      definedRatio: (d, t) => `${d}/${t} معرّف`,
      linksMapped: (c) => `${c} روابط`,
      onCanvasRatio: (p, t) => `${p}/${t} على اللوحة`,
      conceptsCount: (n) => `${n} مفاهيم`,
      linksCount: (n) => `${n} روابط`,
      missingDefCount: (n) => `${n} بدون تعريف`,
      glossaryTab: 'المعجم',
      mapTab: 'الخريطة',
    },
    glossary: {
      step1Title: 'الخطوة 1: تعريف المفاهيم الأساسية',
      step1Desc:
        'اسردوا المفاهيم المرتبطة بسؤال التركيز واكتبوا تعريفاً واضحاً وغير دائري لكل مفهوم قبل الانتقال إلى التخطيط البصري.',
      step2Title: 'الخطوة 2: ربط المفاهيم ذات الصلة',
      step2Desc:
        'راجعوا العلاقات الصادرة والواردة لكل مفهوم باستخدام عبارات ربط فعلية دقيقة، ثم انتقلوا إلى لوحة الخريطة البصرية.',
      nextConnect: 'التالي: ربط العلاقات',
      openVisualMap: 'فتح الخريطة البصرية',
      seedMultipleTitle: 'إضافة عدة مفاهيم دفعة واحدة',
      addConceptTitle: 'إضافة مفهوم إلى المعجم',
      switchSingle: 'التبديل إلى نموذج المفهوم الفردي',
      switchBatch: 'إضافة عدة مفاهيم دفعة واحدة',
      conceptName: 'اسم المفهوم',
      conceptNamePlaceholder: 'مثال: التوازن الداخلي',
      category: 'الفئة',
      categoryPlaceholder: 'أساسي',
      definition: 'التعريف',
      definitionPlaceholder: 'تعريف واضح وموجز...',
      addBtn: 'إضافة',
      batchPlaceholder:
        'أدخلوا أسماء المفاهيم مفصولة بفواصل أو أسطر جديدة (مثل: المخزون، التدفق، حلقة التعزيز، حلقة التوازن)',
      batchHint: 'يمكنكم إكمال التعريفات مباشرة بعد الإضافة.',
      addConceptsBtn: 'إضافة المفاهيم',
      searchPlaceholder: 'تصفية المفاهيم حسب الاسم أو التعريف أو الفئة...',
      filterAll: (n) => `الكل (${n})`,
      filterNeedsDef: (n) => `يحتاج تعريفاً (${n})`,
      filterUnlinked: 'غير مرتبط',
      filterAiFlagged: (n) => `ملاحظات AI (${n})`,
      emptyTitle: 'المعجم فارغ',
      emptyDesc:
        'أضيفوا أول مفهوم أعلاه، أو استوردوا ملف JSON أو .md عبر أداة الاستيراد/التصدير، أو اطلبوا من مساعد AI اقتراح مفاهيم أساسية لموضوعكم.',
      suggestStarterBtn: 'اقتراح مفاهيم البداية بالذكاء الاصطناعي',
      noFilterMatch: 'لا توجد مفاهيم تطابق التصفية الحالية.',
      outgoing: (n) => `${n} صادر`,
      incoming: (n) => `${n} وارد`,
      missingDefinition: 'تعريف مفقود',
      showOnMap: 'الخريطة',
      deleteConcept: 'حذف المفهوم',
      editDefinitionPlaceholder: 'اكتبوا تعريفاً واضحاً ودقيقاً لهذا المفهوم...',
      aiReviewPrefix: (sev) => `مراجعة AI (${sev}):`,
      suggestedLabel: 'المقترح:',
      applyBtn: 'تطبيق',
      relatedConcepts: 'المفاهيم ذات الصلة',
      noLinksYet: 'لم تُربط علاقات بعد. أضيفوا علاقة أدناه لربط هذا المفهوم.',
      thisConceptSuffix: 'هذا المفهوم',
      linkingPhrasePlaceholder: 'عبارة الربط (مثل: يسبب)',
      linkBtn: 'ربط',
      relatesToDefault: 'يرتبط بـ',
    },
    mapCanvas: {
      moveEdit: 'تحريك وتعديل',
      drawLink: 'رسم رابط',
      newConcept: 'مفهوم جديد',
      autoArrange: 'ترتيب تلقائي',
      hideDefs: 'إخفاء التعريفات',
      showDefs: 'إظهار التعريفات',
      linkPromptClickTarget: (name) => `انقروا على مفهوم الهدف للربط من "${name}"`,
      linkPromptClickSource: 'انقروا على مفهوم المصدر ثم على مفهوم الهدف',
      fit: 'ملاءمة العرض',
      emptyTitle: 'ابدأوا برسم خريطة المفاهيم',
      emptyDesc: 'أضيفوا مفاهيم مباشرة على اللوحة أو عرّفوها أولاً في معجم المفاهيم.',
      addFirstConcept: 'إضافة أول مفهوم',
      linksSuffix: (n) => `${n} روابط`,
      missingDef: 'تعريف مفقود',
      aiDefFlag: (sev) => `AI: تعريف (${sev})`,
      dragToConnectTitle: 'اسحبوا إلى مفهوم آخر لإنشاء رابط',
      unplacedTitle: (n) => `مفاهيم غير موضوعة (${n})`,
      placeAll: 'وضع الكل',
      newNodeModalTitle: 'عقدة مفهوم جديدة',
      nodeNamePlaceholder: 'اسم المفهوم...',
      nodeDefPlaceholder: 'التعريف (موصى به)...',
      cancel: 'إلغاء',
      createNode: 'إنشاء عقدة',
      nameRelTitle: 'تسمية العلاقة',
      relPhrasePlaceholder: 'مثل: يدفع، ينظّم، يعد نوعاً من...',
      addLink: 'إضافة رابط',
      conceptInspector: 'فاحص المفهوم',
      nameLabel: 'الاسم',
      categoryLabel: 'الفئة',
      defLabel: 'التعريف',
      defPlaceholder: 'عرّفوا هذا المفهوم بوضوح...',
      aiReviewSeverity: (s) => `مراجعة AI (${s})`,
      applySuggestedDef: 'تطبيق التعريف المقترح',
      relationshipsLabel: 'العلاقات',
      deleteConcept: 'حذف المفهوم',
      relInspector: 'فاحص العلاقة',
      linkingPhraseLabel: 'عبارة الربط',
      reverseDirection: 'عكس الاتجاه',
      deleteLink: 'حذف الرابط',
    },
    aiDrawer: {
      title: 'مساعد خريطة المفاهيم (AI)',
      reviewTab: 'مراجعة الخريطة',
      suggestTab: 'اقتراح عقد',
      askTab: 'اسأل المساعد',
      reviewIntro:
        'يفحص كل تعريف وكل علاقة لاكتشاف النقص أو الغموض أو عدم الدقة، ويبرز المفاهيم الأساسية المفقودة في الخريطة.',
      reviewRunning: 'جارٍ مراجعة خريطة المفاهيم...',
      reviewBtn: 'مراجعة الخريطة الآن',
      defFindings: (n) => `ملاحظات التعريفات (${n})`,
      defsLookGood: 'تبدو جميع تعريفات المفاهيم الحالية دقيقة وواضحة.',
      suggestedPrefix: 'المقترح:',
      applyDef: 'تطبيق التعريف',
      relFindings: (n) => `ملاحظات العلاقات (${n})`,
      relsLookGood: 'تبدو العلاقات الحالية وعبارات الربط سليمة.',
      labelPrefix: 'التسمية:',
      addLinkBtn: 'إضافة رابط',
      updateLinkBtn: 'تحديث الرابط',
      missingKeyConcepts: (n) => `مفاهيم أساسية مفقودة (${n})`,
      addedBtn: 'تمت الإضافة',
      addKeyConceptBtn: 'إضافة مفهوم أساسي',
      suggestGuidanceLabel: 'توجيه أو زاوية اختيارية',
      suggestGuidancePlaceholder: 'مثال: ركّز على التدخلات العملية أو الحالات الحدية...',
      suggestRunning: 'جارٍ البحث عن عقد مفقودة...',
      suggestBtn: 'اقتراح عقد مفقودة',
      addToMapBtn: 'إضافة للخريطة',
      askLabel: 'اسألوا عن المفاهيم أو البنية الهرمية أو صياغة الروابط',
      askPlaceholder: 'مثال: ما أفضل عبارات الربط بين المخزون والانبثاق؟',
      askRunning: 'جارٍ التفكير...',
      askBtn: 'اسأل المساعد',
      addShortBtn: '+ إضافة',
    },
    ioModal: {
      title: 'استيراد وتصدير الخريطة',
      exportTab: 'تصدير',
      importTab: 'استيراد (JSON / .md)',
      jsonTitle: 'أرشيف JSON',
      jsonDesc: 'تنسيق كامل يحفظ المفاهيم والتعريفات والإحداثيات والروابط.',
      downloadJson: 'تنزيل .json',
      mdTitle: 'Markdown',
      mdDesc: 'عناوين معجم منظمة وقائمة قضايا العلاقات.',
      pdfTitle: 'مستند PDF',
      pdfDesc: 'يتضمن صورة بصرية لخريطة المفاهيم بالإضافة إلى المعجم الكامل.',
      downloadPdf: 'تنزيل .pdf',
      gdocsTitle: 'التصدير إلى Google Docs',
      gdocsDesc:
        'ينشئ مستند Google Doc منسقاً في Google Drive يتضمن سؤال التركيز ومعجم المفاهيم والتعريفات والعلاقات.',
      signOut: 'تسجيل الخروج',
      signInPrompt: 'سجّلوا الدخول بحساب Google لمنح إذن إنشاء المستند.',
      signInBtn: 'Sign in with Google',
      signingInBtn: 'جارٍ تسجيل الدخول...',
      signedInAs: 'تم تسجيل الدخول باسم',
      docTitlePlaceholder: 'عنوان مستند Google Doc',
      exportGdocsBtn: 'تصدير إلى Google Docs',
      confirmCreateBtn: 'تأكيد وإنشاء المستند',
      creatingBtn: 'جارٍ الإنشاء...',
      cancel: 'إلغاء',
      confirmNotice: (t, c, l) =>
        `سيتم إنشاء مستند Google Doc جديد بعنوان "${t}" يحتوي على ${c} مفاهيم و${l} روابط.`,
      createdSuccess: (t) => `تم إنشاء المستند "${t}" في Google Docs.`,
      openDocument: 'فتح المستند',
      uploadTitle: 'رفع ملف JSON أو Markdown (.md)',
      uploadDesc: 'يدعم ملفات JSON وMarkdown (.md) المُصدّرة من ConceptAtlas أو البنية القياسية للمفاهيم والعلاقات.',
      chooseFile: 'اختيار ملف JSON أو .md',
      pasteLabel: 'أو لصق JSON / Markdown مباشرة',
      importBtn: 'استيراد خريطة المفاهيم',
    },
    exportDocLabels: {
      focusQuestion: 'سؤال التركيز',
      conceptsLabel: 'مفاهيم',
      relationshipsLabel: 'علاقات',
      glossaryHeading: 'معجم المفاهيم',
      noConceptsYet: 'لم يتم تعريف مفاهيم بعد.',
      categoryLabel: 'الفئة',
      definitionLabel: 'التعريف',
      defMissing: 'لم يُقدّم تعريف بعد.',
      relatedConceptsLabel: 'المفاهيم ذات الصلة',
      propositionsHeading: 'القضايا وروابط العلاقات',
      noLinksYet: 'لم يتم رسم علاقات بعد.',
      relatesTo: 'يرتبط بـ',
      exportedOn: 'تاريخ التصدير',
    },
  },

  en: {
    appTitle: 'ConceptAtlas',
    nav: {
      glossary: 'Glossary',
      map: 'Map Canvas',
      assistant: 'AI Assistant',
      help: 'Help',
      importExport: 'Import / Export',
    },
    helpMenu: {
      about: 'About',
      understanding: 'Understanding Concept Maps',
      howto: 'How to Use This App',
    },
    helpModal: {
      close: 'Close help dialog',
      aboutTitle: 'About ConceptAtlas',
      aboutBody: [
        'ConceptAtlas is a structured concept mapping workspace designed to separate conceptual clarity from spatial diagramming. It guides you through defining terms in a rigorous glossary before arranging and cross-linking them on a visual map.',
        'Both views — Glossary and Map Canvas — remain continuously synchronized on the same underlying knowledge model, so edits in one view immediately update the other.',
      ],
      aboutHighlightsTitle: 'Core Capabilities',
      aboutHighlights: [
        'Three-stage structured process: Define Concepts, Connect Relationships, and Spatial Map & Review.',
        'Import JSON or Markdown (.md) and export to JSON, Markdown (.md), PDF, and Google Docs.',
        'AI Assistant to suggest missing nodes and review definitions, relationships, and missing key concepts.',
        'Full Hebrew, Arabic, and English interface with automatic RTL and LTR layout.',
      ],
      understandingTitle: 'Understanding Concept Maps',
      understandingIntro:
        'A concept map is a structured visual representation of knowledge pioneered by Joseph Novak. Effective concept maps rest on three building blocks:',
      understandingPoints: [
        {
          title: '1. Focus Question',
          body: 'A clear guiding question that frames the scope and purpose of the map (e.g., "How do feedback loops govern complex systems?"). Every concept should help answer this question.',
        },
        {
          title: '2. Well-Defined Concepts',
          body: 'Concepts represent core entities, processes, or ideas. Writing concise, non-circular definitions prevents ambiguity and clarifies each node’s boundary.',
        },
        {
          title: '3. Propositions & Linking Phrases',
          body: 'Two concepts joined by a directed arrow and a precise verb phrase (such as "regulates", "is composed of", or "amplifies") form a readable, testable proposition.',
        },
      ],
      howtoTitle: 'How to Use This App',
      howtoIntro: 'Follow these four steps to construct, review, save, and reload your concept map:',
      howtoSteps: [
        {
          step: '01',
          title: 'Frame & Define Concepts',
          body: 'Enter a map title and focus question in the top toolbar. In the Glossary view, add concepts individually or in a batch and write a clear definition for each.',
        },
        {
          step: '02',
          title: 'Connect Related Concepts',
          body: 'Within each glossary entry, link related concepts using explicit verb phrases and verify that key ideas are not left isolated.',
        },
        {
          step: '03',
          title: 'Map Visually & Review with AI',
          body: 'Switch to Map Canvas to position nodes, draw links directly between ports, or run Auto-Arrange. Open AI Assistant to suggest missing nodes or run a conceptual review.',
        },
        {
          step: '04',
          title: 'Save & Return Using Import / Export',
          body: 'Use the "Import / Export" button in the top bar. To save a map and return to it later, export it as JSON (preserves exact canvas positions) or Markdown (.md). When you come back, open the Import tab in "Import / Export" and load your saved JSON or .md file. You can also export to PDF or Google Docs for sharing and printing.',
        },
      ],
      goGlossary: 'Open Glossary',
      goMap: 'Open Map Canvas',
      gotIt: 'Got it',
    },
    banner: {
      languageLabel: 'Language',
      titlePlaceholder: 'Name your concept map...',
      focusQuestionLabel: 'Focus question:',
      focusQuestionPlaceholder: 'What central question does this concept map answer?',
      templates: 'Templates',
      loadStarterHeader: 'Load starter or blank map',
      importJson: 'Import JSON',
      aiReviewSuggest: 'AI Review & Suggest',
      stage1Label: 'Define Concepts',
      stage2Label: 'Connect Relationships',
      stage3Label: 'Spatial Map & Review',
      definedRatio: (d, t) => `${d}/${t} defined`,
      linksMapped: (c) => `${c} links mapped`,
      onCanvasRatio: (p, t) => `${p}/${t} on canvas`,
      conceptsCount: (n) => `${n} concepts`,
      linksCount: (n) => `${n} links`,
      missingDefCount: (n) => `${n} missing def`,
      glossaryTab: 'Glossary',
      mapTab: 'Map',
    },
    glossary: {
      step1Title: 'Step 1: Define Your Core Concepts',
      step1Desc:
        'List the concepts central to your focus question and write a clear, non-circular definition for each before mapping.',
      step2Title: 'Step 2: Connect Related Concepts',
      step2Desc:
        'Review each concept’s outgoing and incoming relationships with explicit verb phrases, then switch to the visual Map Canvas.',
      nextConnect: 'Next: Connect Relationships',
      openVisualMap: 'Open Visual Map',
      seedMultipleTitle: 'Seed Multiple Concepts',
      addConceptTitle: 'Add Concept to Glossary',
      switchSingle: 'Switch to single concept form',
      switchBatch: 'Seed multiple concepts at once',
      conceptName: 'Concept Name',
      conceptNamePlaceholder: 'e.g. Homeostasis',
      category: 'Category',
      categoryPlaceholder: 'Core',
      definition: 'Definition',
      definitionPlaceholder: 'Clear, concise definition...',
      addBtn: 'Add',
      batchPlaceholder:
        'Enter concept names separated by commas or new lines (e.g. Stock, Flow, Reinforcing Loop, Balancing Loop)',
      batchHint: 'You can fill in definitions right after adding them.',
      addConceptsBtn: 'Add Concepts',
      searchPlaceholder: 'Filter concepts by name, definition, or category...',
      filterAll: (n) => `All (${n})`,
      filterNeedsDef: (n) => `Needs Definition (${n})`,
      filterUnlinked: 'Unlinked',
      filterAiFlagged: (n) => `AI Flagged (${n})`,
      emptyTitle: 'Your glossary is empty',
      emptyDesc:
        'Add your first concept above, import a saved JSON or .md map via Import / Export, or ask the AI Assistant to suggest foundational concepts for your topic.',
      suggestStarterBtn: 'Suggest Starter Concepts with AI',
      noFilterMatch: 'No concepts match the current filter.',
      outgoing: (n) => `${n} outgoing`,
      incoming: (n) => `${n} incoming`,
      missingDefinition: 'Missing definition',
      showOnMap: 'Map',
      deleteConcept: 'Delete concept',
      editDefinitionPlaceholder: 'Write a clear, precise definition for this concept...',
      aiReviewPrefix: (sev) => `AI Review (${sev}):`,
      suggestedLabel: 'Suggested:',
      applyBtn: 'Apply',
      relatedConcepts: 'Related Concepts',
      noLinksYet: 'No relationships linked yet. Add one below to connect this concept.',
      thisConceptSuffix: 'this concept',
      linkingPhrasePlaceholder: 'linking phrase (e.g. drives)',
      linkBtn: 'Link',
      relatesToDefault: 'relates to',
    },
    mapCanvas: {
      moveEdit: 'Move & Edit',
      drawLink: 'Draw Link',
      newConcept: 'New Concept',
      autoArrange: 'Auto-Arrange',
      hideDefs: 'Hide Definitions',
      showDefs: 'Show Definitions',
      linkPromptClickTarget: (name) => `Click a target concept to link from "${name}"`,
      linkPromptClickSource: 'Click a source concept, then click a target concept',
      fit: 'Fit',
      emptyTitle: 'Start Mapping Concepts',
      emptyDesc: 'Add concepts directly on this canvas or define them first in the Glossary view.',
      addFirstConcept: 'Add First Concept',
      linksSuffix: (n) => `${n} links`,
      missingDef: 'Missing definition',
      aiDefFlag: (sev) => `AI: ${sev} definition`,
      dragToConnectTitle: 'Drag to another concept to create a link',
      unplacedTitle: (n) => `Unplaced Concepts (${n})`,
      placeAll: 'Place all',
      newNodeModalTitle: 'New Concept Node',
      nodeNamePlaceholder: 'Concept name...',
      nodeDefPlaceholder: 'Definition (recommended)...',
      cancel: 'Cancel',
      createNode: 'Create Node',
      nameRelTitle: 'Name Relationship',
      relPhrasePlaceholder: 'e.g. drives, regulates, is a type of...',
      addLink: 'Add Link',
      conceptInspector: 'Concept Inspector',
      nameLabel: 'Name',
      categoryLabel: 'Category',
      defLabel: 'Definition',
      defPlaceholder: 'Define this concept clearly...',
      aiReviewSeverity: (s) => `AI Review (${s})`,
      applySuggestedDef: 'Apply Suggested Definition',
      relationshipsLabel: 'Relationships',
      deleteConcept: 'Delete Concept',
      relInspector: 'Relationship Inspector',
      linkingPhraseLabel: 'Linking Phrase',
      reverseDirection: 'Reverse Direction',
      deleteLink: 'Delete Link',
    },
    aiDrawer: {
      title: 'AI Map Assistant',
      reviewTab: 'Review Map',
      suggestTab: 'Suggest Nodes',
      askTab: 'Ask',
      reviewIntro:
        'Audits every definition and relationship for missing, vague, or inaccurate entries and highlights essential concepts missing from your map.',
      reviewRunning: 'Reviewing Concept Map...',
      reviewBtn: 'Review Map Now',
      defFindings: (n) => `Definition Findings (${n})`,
      defsLookGood: 'All existing concept definitions look accurate and clear.',
      suggestedPrefix: 'Suggested:',
      applyDef: 'Apply Definition',
      relFindings: (n) => `Relationship Findings (${n})`,
      relsLookGood: 'Existing relationships and linking phrases look well-formed.',
      labelPrefix: 'Label:',
      addLinkBtn: 'Add Link',
      updateLinkBtn: 'Update Link',
      missingKeyConcepts: (n) => `Missing Key Concepts (${n})`,
      addedBtn: 'Added',
      addKeyConceptBtn: 'Add Key Concept',
      suggestGuidanceLabel: 'Optional Focus or Angle',
      suggestGuidancePlaceholder: 'e.g. Focus on real-world interventions or edge cases...',
      suggestRunning: 'Finding Missing Nodes...',
      suggestBtn: 'Suggest Missing Nodes',
      addToMapBtn: 'Add to Map',
      askLabel: 'Ask about your concepts, hierarchy, or phrasing',
      askPlaceholder: 'e.g. What linking phrases best connect Stock and Emergence?',
      askRunning: 'Thinking...',
      askBtn: 'Ask Assistant',
      addShortBtn: '+ Add',
    },
    ioModal: {
      title: 'Import & Export Map',
      exportTab: 'Export',
      importTab: 'Import (JSON / .md)',
      jsonTitle: 'JSON Archive',
      jsonDesc: 'Lossless data format with concepts, definitions, coordinates, and links.',
      downloadJson: 'Download .json',
      mdTitle: 'Markdown',
      mdDesc: 'Structured glossary headings and propositional relationship list.',
      pdfTitle: 'PDF Document',
      pdfDesc: 'Includes visual concept map diagram snapshot plus complete glossary.',
      downloadPdf: 'Download .pdf',
      gdocsTitle: 'Export to Google Docs',
      gdocsDesc:
        'Creates a formatted Google Doc in your Google Drive with the focus question, concept glossary, definitions, and relationship propositions.',
      signOut: 'Sign out',
      signInPrompt: 'Sign in with Google to grant permission to create your document.',
      signInBtn: 'Sign in with Google',
      signingInBtn: 'Signing in...',
      signedInAs: 'Signed in as',
      docTitlePlaceholder: 'Google Doc title',
      exportGdocsBtn: 'Export to Google Docs',
      confirmCreateBtn: 'Confirm & Create Doc',
      creatingBtn: 'Creating...',
      cancel: 'Cancel',
      confirmNotice: (t, c, l) =>
        `This will create a new Google Doc titled "${t}" with ${c} concepts and ${l} relationships.`,
      createdSuccess: (t) => `Created "${t}" in Google Docs.`,
      openDocument: 'Open Document',
      uploadTitle: 'Upload a JSON or Markdown (.md) file',
      uploadDesc: 'Supports ConceptAtlas JSON/Markdown exports as well as standard { concepts/nodes, links/relationships } JSON or ### Concept Markdown.',
      chooseFile: 'Choose JSON or .md File',
      pasteLabel: 'Or paste JSON / Markdown directly',
      importBtn: 'Import Concept Map',
    },
    exportDocLabels: {
      focusQuestion: 'Focus Question',
      conceptsLabel: 'Concepts',
      relationshipsLabel: 'Relationships',
      glossaryHeading: 'Concept Glossary',
      noConceptsYet: 'No concepts defined yet.',
      categoryLabel: 'Category',
      definitionLabel: 'Definition',
      defMissing: 'Definition not yet provided.',
      relatedConceptsLabel: 'Related Concepts',
      propositionsHeading: 'Propositions & Relationship Links',
      noLinksYet: 'No relationships mapped yet.',
      relatesTo: 'relates to',
      exportedOn: 'Exported',
    },
  },
};
