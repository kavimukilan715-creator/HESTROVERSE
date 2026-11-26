export type EraId =
  | 'all'
  | 'ancient-near-east'
  | 'classical-antiquity'
  | 'imperial-asia'
  | 'medieval-early-modern'
  | 'enlightenment-reform';

export type GeoRegionId =
  | 'all'
  | 'mesopotamia'
  | 'mediterranean'
  | 'europe'
  | 'asia';

export type SanctionCategory = 'Corporal & Torture' | 'Capital' | 'Restitution & Civil' | 'Procedure & Reform';

export interface LawConsequenceRow {
  statuteRef: string;
  offenseOrRule: string;
  documentedPunishment: string;
  category: SanctionCategory;
  classOrEvidentiaryNote: string;
}

export interface RulerArchiveEntry {
  id: string;
  accessionNumber: string;
  ruler: string;
  titleOrRole: string;
  codeName: string;
  yearLabel: string;
  sortYear: number;
  era: Exclude<EraId, 'all'>;
  eraLabel: string;
  region: string;
  geoRegion: Exclude<GeoRegionId, 'all'>;
  mapPoint: { x: number; y: number; city: string };
  imageSrc: string;
  imageAlt: string;
  figureCaption: string;
  authoritySource: string;
  classEquality: string;
  tortureStatus: string;
  punishmentPhilosophy: string;
  summary: string;
  historicalContext: string;
  primaryExcerpt: {
    citation: string;
    quote: string;
  };
  tortureAndPunishmentDetail: string;
  proceduralSafeguards: string;
  reformLegacy: string;
  lawConsequences: LawConsequenceRow[];
}

export interface JudicialDoctrineStudy {
  id: string;
  index: string;
  title: string;
  period: string;
  region: string;
  legalPurpose: string;
  summary: string;
  mechanics: string[];
  turningPoint: string;
}

export interface QuizQuestion {
  id: string;
  eraLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface HistoricEventEntry {
  id: string;
  yearLabel: string;
  sortYear: number;
  title: string;
  region: string;
  eraLabel: string;
  relatedRulerId?: string;
  tags: string[];
  summary: string;
  legalSignificance: string;
  punishmentContext: string;
}

export interface CenturyLegalDatum {
  year: number;
  yearLabel: string;
  centuryLabel: string;
  eraLabel: string;
  lawCodeDensity: number;
  tortureFrequency: number;
  tortureClassification: string;
  keyCodices: string[];
  relatedRulerId?: string;
  summary: string;
}

export const HERO_IMAGE = {
  src: '/src/assets/images/hero_codex_archive_1795704594395.jpg',
  alt: 'Museum gallery display featuring a carved basalt law stele, parchment legal scrolls, bronze balance scales, and wrought-iron judicial seals on limestone.',
  caption: 'Fig. 1 — Comparative exhibition centerpiece: Mesopotamian basalt law stele alongside vellum decrees, scales of equity, and judicial iron seals.',
};

export const ERA_FILTERS: { id: EraId; label: string; span: string }[] = [
  { id: 'all', label: 'All Eras', span: '1750 BCE – 1786 CE' },
  { id: 'ancient-near-east', label: 'Ancient Near East', span: '1750 BCE' },
  { id: 'classical-antiquity', label: 'Classical Antiquity', span: '621 BCE – 534 CE' },
  { id: 'imperial-asia', label: 'Imperial Asia', span: '221 BCE – 1742 CE' },
  { id: 'medieval-early-modern', label: 'Medieval & Early Modern', span: '1215 – 1670 CE' },
  { id: 'enlightenment-reform', label: 'Enlightenment & Reform', span: '1764 – 1786 CE' },
];

export const GEO_REGIONS: {
  id: Exclude<GeoRegionId, 'all'>;
  label: string;
  shortLabel: string;
  span: string;
  description: string;
}[] = [
  {
    id: 'mesopotamia',
    label: 'Mesopotamia',
    shortLabel: 'Mesopotamia',
    span: 'c. 1750 BCE',
    description: 'Tigris–Euphrates alluvial basin where cuneiform steles codified public royal statutes, class-scaled retaliation, and river ordeals.',
  },
  {
    id: 'mediterranean',
    label: 'Greece & Byzantium',
    shortLabel: 'Mediterranean',
    span: '621 BCE – 534 CE',
    description: 'Aegean polis and Eastern Roman imperial courts that formalized citizen immunity, basanos of enslaved witnesses, and Roman quaestio.',
  },
  {
    id: 'europe',
    label: 'Western & Central Europe',
    shortLabel: 'Europe',
    span: '1215 – 1786 CE',
    description: 'Feudal charters, papal and imperial inquisitorial codes, royal criminal ordinances, and the Tuscan Enlightenment abolition of torture.',
  },
  {
    id: 'asia',
    label: 'East Asia',
    shortLabel: 'Asia',
    span: '221 BCE – 1742 CE',
    description: 'Chinese Legalist collective liability and Tokugawa shogunal manuals restricting regulated gōmon interrogation to grave capital offenses.',
  },
];

export const RULER_ARCHIVE: RulerArchiveEntry[] = [
  {
    id: 'hammurabi',
    accessionNumber: 'ACC. 1750BCE.01',
    ruler: 'Hammurabi',
    titleOrRole: 'Sixth King of the First Babylonian Dynasty',
    codeName: 'Code of Hammurabi (Codex Hammurabi)',
    yearLabel: 'c. 1750 BCE',
    sortYear: -1750,
    era: 'ancient-near-east',
    eraLabel: 'Ancient Near East',
    region: 'Babylon (Mesopotamia)',
    geoRegion: 'mesopotamia',
    mapPoint: { x: 388, y: 268, city: 'Babylon' },
    imageSrc: '/src/assets/images/artifact_hammurabi_stele_1795704594685.jpg',
    imageAlt: 'Black diorite stele inscribed with horizontal cuneiform columns of Babylonian legal statutes.',
    figureCaption: 'Fig. 2 — Carved diorite stele format preserving 282 Akkadian statutes in public cuneiform columns.',
    authoritySource: 'Divine Mandate (Shamash, God of Justice)',
    classEquality: 'Stratified (Awilum, Mushkenum, Wardum)',
    tortureStatus: 'River Ordeal & Retaliatory Mutilation',
    punishmentPhilosophy: 'Lex Talionis & Social Deterrence',
    summary:
      'Inscribed on a public black diorite stele, Hammurabi’s 282 laws standardized civil contracts, family obligations, and corporal retaliation across Mesopotamia while scaling penalties strictly by social rank.',
    historicalContext:
      'Ruling an expanded Babylonian empire uniting diverse Sumerian and Akkadian city-states, Hammurabi sought uniform royal jurisprudence to replace fragmented temple and tribal customs. By carving the code onto public steles, the crown established written predictability—yet anchored justice in rigid three-tier class hierarchy.',
    primaryExcerpt: {
      citation: 'Statutes §§ 196–199, Akkadian Cuneiform Stele (c. 1750 BCE)',
      quote:
        'If a free man has destroyed the eye of a member of the aristocracy, they shall destroy his eye. If he has destroyed the eye of a commoner or broken the bone of a commoner, he shall pay one mina of silver. If he has destroyed the eye of a free man’s slave, he shall pay one-half of his value.',
    },
    tortureAndPunishmentDetail:
      'Babylonian jurisprudence did not use systematic inquisitorial torture to extract confessions as later Roman courts would; instead, unresolved accusations of sorcery or adultery triggered the "Ordeal by River" (submersion in the Euphrates, where drowning proved guilt). Punishments relied heavily on symmetrical bodily mutilation—amputating a surgeon’s hands after a fatal operation or severing a son’s hand for striking his father—alongside drowning, burning, or impalement.',
    proceduralSafeguards:
      'Accusers who failed to substantiate a capital charge faced the exact penalty the accused would have suffered (Statute § 1), deterring malicious litigation. Judges who altered a sealed verdict were fined twelvefold and permanently removed from the bench.',
    reformLegacy:
      'Demonstrated that sovereign statutes could be publicly posted and binding even on magistrates, establishing early concepts of evidentiary witness testimony and proportional judicial accountability.',
    lawConsequences: [
      {
        statuteRef: '§ 1–2',
        offenseOrRule: 'Unproven capital accusation or witchcraft charge submitted to the River Ordeal',
        documentedPunishment: 'Execution of false accuser; drowning in the Euphrates regarded as divine verdict',
        category: 'Capital',
        classOrEvidentiaryNote: 'Applies equally to all accusers failing witness proof',
      },
      {
        statuteRef: '§ 195',
        offenseOrRule: 'A son striking his own father',
        documentedPunishment: 'Amputation of the son’s hand',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Patriarchal authority statute',
      },
      {
        statuteRef: '§ 196–199',
        offenseOrRule: 'Destroying another person’s eye or breaking a limb',
        documentedPunishment: 'Identical bodily mutilation against an aristocrat; 1 mina silver fine against a commoner',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Penalty scales directly by social class (Awilum vs. Mushkenum)',
      },
      {
        statuteRef: '§ 218',
        offenseOrRule: 'Physician performing surgery that causes the death or blindness of a noble patient',
        documentedPunishment: 'Amputation of the physician’s hands',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Silver replacement required if victim was enslaved (§ 219)',
      },
      {
        statuteRef: '§ 229',
        offenseOrRule: 'Builder constructing a house that collapses and kills the homeowner',
        documentedPunishment: 'Execution of the builder (or builder’s son if homeowner’s son died)',
        category: 'Capital',
        classOrEvidentiaryNote: 'Strict professional liability rule',
      },
    ],
  },
  {
    id: 'draco-solon',
    accessionNumber: 'ACC. 621BCE.02',
    ruler: 'Draco & Solon',
    titleOrRole: 'Athenian Lawgivers (Thesmothetai & Archon)',
    codeName: 'Draconian Constitution & Solonian Reforms',
    yearLabel: '621–594 BCE',
    sortYear: -621,
    era: 'classical-antiquity',
    eraLabel: 'Classical Antiquity',
    region: 'Athens (Classical Greece)',
    geoRegion: 'mediterranean',
    mapPoint: { x: 285, y: 245, city: 'Athens' },
    imageSrc: '/src/assets/images/artifact_hammurabi_stele_1795704594685.jpg',
    imageAlt: 'Inscribed stone stele representing early codified Mediterranean civic statutes.',
    figureCaption: 'Fig. 3 — Early Attic statutes were carved on rotating wooden axles (axones) and stone pillars for public inspection.',
    authoritySource: 'Polis Civic Mandate',
    classEquality: 'Citizen Equality Expanded; Enslaved Excluded',
    tortureStatus: 'Basanos (Torture of Enslaved Witnesses Only)',
    punishmentPhilosophy: 'Strict Deterrence (Draco) -> Civic Equity (Solon)',
    summary:
      'Draco first committed Athenian law to public writing—infamously prescribing death for even minor thefts—before Solon repealed nearly all Draconian capital penalties, outlawed debt slavery, and shaped classical Athenian court procedure.',
    historicalContext:
      'Prior to 621 BCE, aristocratic Eupatrid magistrates interpreted unwritten custom arbitrarily. Draco’s public inscription ended aristocratic monopoly over legal knowledge, though its extreme severity provoked social unrest. Thirty years later, Archon Solon cancelled agricultural debt-bondage (seisachtheia) and empowered citizens to appeal verdicts before popular juries (Heliaia).',
    primaryExcerpt: {
      citation: 'Plutarch, Life of Solon 17 (summarizing the repeal of Draco, c. 594 BCE)',
      quote:
        'Solon repealed all the laws of Draco except those concerning homicide, because they were too severe and their punishments too heavy; for almost a single penalty, death, was appointed for nearly all offenses.',
    },
    tortureAndPunishmentDetail:
      'Under Draco, petty theft of vegetables or idleness carried capital execution alongside murder. Solon replaced those penalties with graded fines, exile, and loss of civic rights (atimia). Crucially, classical Athenian courts practiced basanos—judicial torture using the rack or whip—exclusively on enslaved persons whose testimony was only considered admissible if extracted under physical duress, while free Athenian citizens were legally immune from judicial torture.',
    proceduralSafeguards:
      'Draco’s surviving homicide law introduced the landmark legal distinction between premeditated murder (tried by the Areopagus) and involuntary manslaughter (punishable by temporary exile rather than blood feud). Solon allowed any citizen to bring suit on behalf of an injured party.',
    reformLegacy:
      'Established the principle that written law binds magistrates, separated intentional from unintentional homicide, and laid institutional groundwork for citizen jury courts.',
    lawConsequences: [
      {
        statuteRef: 'Draco (621 BCE)',
        offenseOrRule: 'Petty theft of produce, idleness, or sacrilege',
        documentedPunishment: 'Execution (later repealed by Solon in 594 BCE)',
        category: 'Capital',
        classOrEvidentiaryNote: 'Uniform severity regardless of property value',
      },
      {
        statuteRef: 'Draco Homicide Law',
        offenseOrRule: 'Unintentional killing without premeditation',
        documentedPunishment: 'Exile from Attica unless pardoned by the victim’s kin',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Replaced private family blood feuds with court trials',
      },
      {
        statuteRef: 'Solon (594 BCE)',
        offenseOrRule: 'Defaulting on agricultural loans secured by personal freedom',
        documentedPunishment: 'Debt-slavery abolished; enslaved Athenians emancipated',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Protected Athenian citizens from bodily seizure for debt',
      },
      {
        statuteRef: 'Attic Basanos Rule',
        offenseOrRule: 'Enslaved person called as witness in civic or homicide litigation',
        documentedPunishment: 'Interrogation on the wheel or rack (basanos) to validate testimony',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Free Athenian citizens strictly exempt from judicial torture',
      },
    ],
  },
  {
    id: 'qin-shi-huang',
    accessionNumber: 'ACC. 221BCE.03',
    ruler: 'Qin Shi Huang',
    titleOrRole: 'First Emperor of a Unified China',
    codeName: 'Qin Legalist Code (Qinlü)',
    yearLabel: '221–210 BCE',
    sortYear: -221,
    era: 'imperial-asia',
    eraLabel: 'Imperial Asia',
    region: 'Qin Empire (China)',
    geoRegion: 'asia',
    mapPoint: { x: 748, y: 245, city: 'Xianyang' },
    imageSrc: '/src/assets/images/hero_codex_archive_1795704594395.jpg',
    imageAlt: 'Archival display of early imperial legal seals and written edicts.',
    figureCaption: 'Fig. 4 — Qin statutes survived on bamboo slips (Shuihudi finds), detailing strict administrative and corporal schedules.',
    authoritySource: 'Legalist Imperial Absolutism (Fajia)',
    classEquality: 'Uniform Liability (Nobles Not Exempt)',
    tortureStatus: 'Interrogative Beating & Five Mutilating Punishments',
    punishmentPhilosophy: 'Collective Responsibility & Uncompromising Deterrence',
    summary:
      'Guided by Legalist thinkers Shang Yang and Li Si, Qin Shi Huang unified weights, script, and criminal law under meticulous bamboo-slip statutes backed by mutual surveillance, collective family guilt, and corporal mutilation.',
    historicalContext:
      'Emerging from centuries of Warring States warfare, the Qin dynasty treated law (fa) not as moral persuasion, as Confucians urged, but as a mechanical instrument of state survival. Every household was grouped into units of five and ten (baojia) legally obligated to report neighbors’ infractions or share their punishment.',
    primaryExcerpt: {
      citation: 'Shuihudi Qin Bamboo Slips, Models for Sealing and Physical Examinations (c. 217 BCE)',
      quote:
        'In interrogating a prisoner, first hear his full statement and write it down; only when he lies repeatedly and refuses to confess may the magistrate apply rod-beating, recording every stroke on the dossier.',
    },
    tortureAndPunishmentDetail:
      'Qin jurisprudence preserved the archaic "Five Punishments" (Wuxing): facial tattooing (mo), cutting off the nose (yi), amputating one or both feet (yue), castration (gong), and death by waist-chopping or tearing apart by chariots (chelie). Magistrates were legally permitted to beat suspects with bamboo rods during interrogation if discrepancies appeared, though beating was officially regulated to avoid killing a suspect before confession.',
    proceduralSafeguards:
      'Surprisingly bureaucratic: Shuihudi bamboo slips reveal mandatory written transcripts, forensic autopsies for suspicious deaths, and penalties against officials who used torture recklessly without first recording oral testimony or who delayed trials.',
    reformLegacy:
      'Subsequent Han Emperor Wen (167 BCE) abolished bodily mutilating punishments like nose and foot amputation, replacing them with regulated bastinado and hard labor, though Legalist administrative precision shaped imperial Chinese law for two millennia.',
    lawConsequences: [
      {
        statuteRef: 'Qinlü · Baojia',
        offenseOrRule: 'Failing to denounce a neighbor’s crime within a five-household mutual group',
        documentedPunishment: 'Waist-chopping or shared criminal liability identical to the perpetrator',
        category: 'Capital',
        classOrEvidentiaryNote: 'Collective liability enforced across households and kin',
      },
      {
        statuteRef: 'Qinlü · Wuxing',
        offenseOrRule: 'Major theft, assault, or desertion from state labor',
        documentedPunishment: 'Facial tattooing, nose amputation, or foot amputation plus wall-building labor',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Visible permanent marks prevented escape from conscript labor',
      },
      {
        statuteRef: '213 BCE Edict',
        offenseOrRule: 'Discussing suppressed Confucian classics or criticizing imperial policy',
        documentedPunishment: 'Execution in the marketplace; clan extermination for seditious assembly',
        category: 'Capital',
        classOrEvidentiaryNote: 'Targeted scholars and unauthorized private book collections',
      },
      {
        statuteRef: 'Shuihudi Procedure',
        offenseOrRule: 'Official arriving late to muster conscripts due to rain or road failure',
        documentedPunishment: 'Execution under strict military punctuality statutes (historically sparked Chen Sheng rebellion)',
        category: 'Capital',
        classOrEvidentiaryNote: 'Strict-liability administrative statute',
      },
    ],
  },
  {
    id: 'justinian',
    accessionNumber: 'ACC. 529CE.04',
    ruler: 'Emperor Justinian I',
    titleOrRole: 'Eastern Roman (Byzantine) Emperor',
    codeName: 'Corpus Juris Civilis (Digest & Codex)',
    yearLabel: '529–534 CE',
    sortYear: 529,
    era: 'classical-antiquity',
    eraLabel: 'Classical Antiquity',
    region: 'Constantinople (Byzantine Empire)',
    geoRegion: 'mediterranean',
    mapPoint: { x: 312, y: 215, city: 'Constantinople' },
    imageSrc: '/src/assets/images/artifact_enlightenment_treatise_1795704595708.jpg',
    imageAlt: 'Bound multi-volume legal codex opened to classical Latin jurisprudence.',
    figureCaption: 'Fig. 5 — The Corpus Juris Civilis preserved Roman legal treatises (Digesta) that later Continental courts revived for inquisitorial law.',
    authoritySource: 'Imperial Sovereignty & Christian Roman Law',
    classEquality: 'Honestiores (Privileged) vs. Humiliores (Lower Ranks)',
    tortureStatus: 'Quaestio Permitted on Circumstantial Indicia',
    punishmentPhilosophy: 'Imperial Order & Evidentiary Certainty',
    summary:
      'Justinian’s jurists compiled centuries of Roman law into the Corpus Juris Civilis—the foundational text of European civil law—which simultaneously codified sharp class privileges and formalized evidentiary rules governing judicial torture (quaestio).',
    historicalContext:
      'Seeking to restore the grandeur and administrative unity of the Roman Empire, Justinian tasked jurist Tribonian with harmonizing contradictory imperial edicts and classical legal opinions. Book 48 of the Digest (De Quaestionibus) became the blueprint used seven centuries later when medieval European universities rediscovered Roman law.',
    primaryExcerpt: {
      citation: 'Digest of Justinian, 48.18.1.23 (quoting Ulpian, codified 533 CE)',
      quote:
        'Torture is a fragile and dangerous thing, and often deceives the truth; for many, through endurance or hardihood, despise torture so that the truth can in no way be wrung from them, while others have so little endurance that they prefer to tell any lie rather than suffer pain.',
    },
    tortureAndPunishmentDetail:
      'While Ulpian himself warned that torture was "fragile and dangerous," the Corpus Juris Civilis authorized quaestio (principally the rack, hooks, and scourging) when partial proof existed. Originally limited to enslaved witnesses and lower-status citizens (humiliores), torture was explicitly permitted against even high-ranking nobles (honestiores) in cases of treason (crimen laesae majestatis), magic, and forgery. Punishments ranged from fines and exile (deportatio) for elites to mines, crucifixion (earlier Roman law, replaced by hanging under Christian emperors), or burning.',
    proceduralSafeguards:
      'Prohibited initiating a criminal inquiry solely with torture: prosecutors had to present prior circumstantial evidence (indicia) before a judge could order quaestio, and confessions extracted under torture were scrutinized for consistency with independent facts.',
    reformLegacy:
      'When rediscovered at Bologna in the 11th century, Justinian’s Digest directly shaped the Romano-canonical law of proof across Europe—both its rational evidentiary thresholds and its tragic reliance on judicial torture.',
    lawConsequences: [
      {
        statuteRef: 'Dig. 48.18',
        offenseOrRule: 'Suspected felony where strong circumstantial clues (indicia) exist',
        documentedPunishment: 'Judicial quaestio (rack or flogging) to verify testimony',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Senators and equestrians exempt except in treason/magic',
      },
      {
        statuteRef: 'Dig. 48.4',
        offenseOrRule: 'Crimen laesae majestatis (treason against the Emperor or state)',
        documentedPunishment: 'All class immunities suspended; torture, execution, and estate confiscation',
        category: 'Capital',
        classOrEvidentiaryNote: 'Applied even posthumously to forfeit treasonous estates',
      },
      {
        statuteRef: 'Novellae 134',
        offenseOrRule: 'Property theft without aggravated violence (Justinianic Novellae)',
        documentedPunishment: 'Replaced death penalty for simple theft with mutilation limits or financial restitution',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Forbade double-hand amputation for non-violent theft',
      },
      {
        statuteRef: 'Codex 9.18',
        offenseOrRule: 'Practicing maleficent sorcery or poisoning',
        documentedPunishment: 'Capital execution (burning or wild beasts/sword depending on rank)',
        category: 'Capital',
        classOrEvidentiaryNote: 'Classified alongside treason in evidentiary severity',
      },
    ],
  },
  {
    id: 'king-john-lateran',
    accessionNumber: 'ACC. 1215CE.05',
    ruler: 'King John & Lateran IV',
    titleOrRole: 'English Crown & Fourth Lateran Council',
    codeName: 'Magna Carta & Trial by Ordeal Abolition',
    yearLabel: '1215 CE',
    sortYear: 1215,
    era: 'medieval-early-modern',
    eraLabel: 'Medieval & Early Modern',
    region: 'England & Western Christendom',
    geoRegion: 'europe',
    mapPoint: { x: 142, y: 130, city: 'Runnymede' },
    imageSrc: '/src/assets/images/artifact_medieval_charter_1795704595451.jpg',
    imageAlt: 'Medieval vellum charter bearing a crimson royal wax seal and wrought-iron key.',
    figureCaption: 'Fig. 6 — Vellum charter seal format echoing the 1215 Runnymede Magna Carta liberties and judicial due process clauses.',
    authoritySource: 'Feudal Compact & Ecclesiastical Canon',
    classEquality: 'Free Men Protected by Law of the Land',
    tortureStatus: 'Ordeals Abolished -> Divergence: Jury vs. Torture',
    punishmentPhilosophy: 'Due Process Restraint on Royal Power',
    summary:
      'The year 1215 reshaped European justice twice: Magna Carta barred the English monarch from imprisoning or punishing free men without lawful judgment, while the Fourth Lateran Council abolished trial by hot iron and cold water—forcing Europe to invent new methods of proof.',
    historicalContext:
      'For centuries, medieval European courts resolved unprovable crimes by asking God to perform a miracle via the Ordeal (carrying red-hot iron or sinking in blessed water). When Pope Innocent III forbade priests from blessing ordeals in November 1215, courts faced an evidentiary vacuum. England responded by expanding lay twelve-person juries; Continental Europe revived Roman-canon inquisitorial torture.',
    primaryExcerpt: {
      citation: 'Magna Carta, Clause 39 (Runnymede, June 1215)',
      quote:
        'No free man shall be seized or imprisoned, or stripped of his rights or possessions, or outlawed or exiled, or deprived of his standing in any way, nor will we proceed with force against him, or send others to do so, except by the lawful judgment of his equals or by the law of the land.',
    },
    tortureAndPunishmentDetail:
      'Before 1215, trial by ordeal inflicted severe burns or near-drowning simply to determine guilt. After 1215, England largely avoided Continental-style inquisitorial torture in ordinary common-law courts, though English law developed the brutal exception of peine forte et dure (pressing suspects under heavy iron weights if they refused to enter a plea, so their family lands would not be forfeited by felony conviction). Executions for felony remained hanging or, for high treason, drawing and quartering.',
    proceduralSafeguards:
      'Clause 20 of Magna Carta mandated proportionality in fines ("amercements") so a merchant’s stock or peasant’s plow could never be seized; Clause 40 barred the crown from selling or delaying justice.',
    reformLegacy:
      'Clause 39 became the foundational stone of due process, habeas corpus, and jury trial traditions, explaining why English common law diverged sharply from Continental inquisitorial torture.',
    lawConsequences: [
      {
        statuteRef: 'Magna Carta § 39',
        offenseOrRule: 'Crown seizure, imprisonment, or execution without lawful judgment',
        documentedPunishment: 'Declared unlawful; subject to baronial enforcement council (§ 61)',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Applied to "free men" (later broadened to all subjects)',
      },
      {
        statuteRef: 'Magna Carta § 20',
        offenseOrRule: 'Fines imposed for minor or moderate offenses',
        documentedPunishment: 'Financial penalty proportional to offense; livelihood tools protected',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Protected merchants’ goods and villeins’ farm implements',
      },
      {
        statuteRef: 'Lateran IV Canon 18',
        offenseOrRule: 'Clerical blessing of hot-iron or cold-water judicial ordeals',
        documentedPunishment: 'Strictly prohibited across Christendom, ending ordeal trials',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Catalyzed jury trials in England and quaestio on the Continent',
      },
      {
        statuteRef: 'Statute of Westminster (1275)',
        offenseOrRule: 'Felony defendant refusing to plead before a common-law jury',
        documentedPunishment: 'Peine forte et dure (confinement under escalating iron weights)',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Used to compel plea rather than extract confession',
      },
    ],
  },
  {
    id: 'innocent-iv',
    accessionNumber: 'ACC. 1252CE.06',
    ruler: 'Pope Innocent IV',
    titleOrRole: 'Pontiff & Canon Jurist',
    codeName: 'Papal Bull Ad Extirpanda',
    yearLabel: '1252 CE',
    sortYear: 1252,
    era: 'medieval-early-modern',
    eraLabel: 'Medieval & Early Modern',
    region: 'Papal States & Northern Italy',
    geoRegion: 'europe',
    mapPoint: { x: 225, y: 218, city: 'Rome' },
    imageSrc: '/src/assets/images/artifact_medieval_charter_1795704595451.jpg',
    imageAlt: 'Sealed medieval ecclesiastical decree on aged parchment.',
    figureCaption: 'Fig. 7 — Papal bulls formally regulated inquisitorial procedure and transferred physical interrogation to civil magistrates.',
    authoritySource: 'Papal Canon Law',
    classEquality: 'Clerical vs. Lay Jurisdictional Rules',
    tortureStatus: 'Explicitly Authorized (Non-Lethal Limits)',
    punishmentPhilosophy: 'Salvation via Confession & Suppression of Heresy',
    summary:
      'Issued to Italian city-states, Ad Extirpanda became the first papal bull to formally authorize judicial torture in heresy trials, treating unrepentant heresy as spiritual treason while attempting to place strict limits against bloodshed or death.',
    historicalContext:
      'Facing widespread Cathar and Waldensian movements in Lombardy and southern France, the medieval Papacy merged Roman criminal procedure with ecclesiastical courts. Because Roman-canon law required two eyewitnesses or a confession for conviction, and heresy was an internal belief, inquisitors argued confession had to be compelled.',
    primaryExcerpt: {
      citation: 'Papal Bull Ad Extirpanda, Law 25 (May 15, 1252)',
      quote:
        'The Podestà or Ruler is held to force all captured heretics—short of danger to life or limb—to expressly confess their errors and accuse other heretics whom they know, just as thieves and robbers of temporal goods are forced to accuse their accomplices.',
    },
    tortureAndPunishmentDetail:
      'Inquisitorial courts primarily used the strappado (hoisting the bound suspect by the wrists behind the back and dropping them short of the floor), the rack, and later water torture (toca). Technically, clerics could not shed blood, so civil magistrates executed the torture—until Pope Alexander IV allowed inquisitors to absolve one another for attending. Repentant heretics faced imprisonment, penance, or wearing yellow crosses; obstinate or "relapsed" heretics were handed to secular authorities to be burned at the stake.',
    proceduralSafeguards:
      'Canon rules stated torture could be applied only once (though inquisitors bypassed this by "continuing" rather than repeating a session), could not cause permanent mutilation or death, and any confession had to be freely ratified at least 24 hours later outside the torture chamber.',
    reformLegacy:
      'Created the institutional template later expanded by the Spanish Inquisition (1478) and early modern witch trials, illustrating how ostensibly "regulated" torture inevitably expanded in practice.',
    lawConsequences: [
      {
        statuteRef: 'Ad Extirpanda § 25',
        offenseOrRule: 'Suspected heretic refusing to confess or name associates',
        documentedPunishment: 'Judicial torture (strappado/rack) short of limb loss or death',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Confession required subsequent ratification outside chamber',
      },
      {
        statuteRef: 'Canon 3 (Lateran IV / Bull)',
        offenseOrRule: 'Relapsed or obstinate refusal to recant heresy',
        documentedPunishment: 'Relaxation to the secular arm for burning at the stake',
        category: 'Capital',
        classOrEvidentiaryNote: 'All property simultaneously confiscated by crown or city',
      },
      {
        statuteRef: 'Canonical Penance',
        offenseOrRule: 'First-time confession and abjuration of heresy',
        documentedPunishment: 'Perpetual or temporary imprisonment (murus strictus) or penitential crosses',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Spared execution upon full confession',
      },
      {
        statuteRef: 'Secular Magistrate Duty',
        offenseOrRule: 'City ruler refusing to enforce inquisitorial sentences',
        documentedPunishment: 'Excommunication, removal from office, and forfeiture of civic authority',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Bound civil podsestàs to papal enforcement',
      },
    ],
  },
  {
    id: 'charles-v',
    accessionNumber: 'ACC. 1532CE.07',
    ruler: 'Emperor Charles V',
    titleOrRole: 'Holy Roman Emperor',
    codeName: 'Constitutio Criminalis Carolina (CCC)',
    yearLabel: '1532 CE',
    sortYear: 1532,
    era: 'medieval-early-modern',
    eraLabel: 'Medieval & Early Modern',
    region: 'Holy Roman Empire (Central Europe)',
    geoRegion: 'europe',
    mapPoint: { x: 218, y: 160, city: 'Regensburg' },
    imageSrc: '/src/assets/images/artifact_enlightenment_treatise_1795704595708.jpg',
    imageAlt: 'Printed 16th-century European legal codex with marginalia and brass clasp.',
    figureCaption: 'Fig. 8 — The Constitutio Criminalis Carolina unified criminal procedure across hundreds of German principalities.',
    authoritySource: 'Imperial Diet & Roman-Canon Jurisprudence',
    classEquality: 'Unified Imperial Standard (With Nobles’ Privileges)',
    tortureStatus: 'Strictly Codified Proof System (Peinliche Frage)',
    punishmentPhilosophy: 'Evidentiary Certainty & Aggravated Deterrence',
    summary:
      'Ratified at the Imperial Diet of Regensburg in 1532, the Carolina was the first unified criminal code of the Holy Roman Empire, balancing strict legal protections against arbitrary torture with horrifying aggravated death penalties.',
    historicalContext:
      'Before 1532, local German lords and municipal courts tortured and executed suspects on flimsy rumors or private grudges. Charles V’s jurist Johann von Schwarzenberg drafted the Carolina to curb reckless local judges by imposing rigorous rules of circumstantial evidence (redliche Anzeigung) and requiring consultations with university law faculties in doubtful cases.',
    primaryExcerpt: {
      citation: 'Constitutio Criminalis Carolina, Article 22 (1532)',
      quote:
        'No one shall finally be condemned to criminal punishment upon any presumptions or suspicions, howsoever strong, but only upon his own confession or sufficient testimony; yet upon credible indications, one may proceed to painful interrogation.',
    },
    tortureAndPunishmentDetail:
      'The Carolina codified "painful interrogation" (peinliche Frage) using thumbscrews, leg vises (Spanish boot), and the strappado, yet forbade judges from asking leading questions ("Did you kill him with a knife?")—suspects had to supply verifiable details only the perpetrator could know. For convicted capital offenders, the code prescribed graduated horrors: hanging for theft, beheading by sword for nobles or manslaughter, breaking on the wheel for aggravated murder, and burning for arson, counterfeiting, or witchcraft.',
    proceduralSafeguards:
      'Prohibited conviction on circumstantial evidence alone; mandated medical inspection before torture; required magistrates to verify the factual truth of any tortured confession (e.g., locating the hidden weapon or stolen goods) before sentencing.',
    reformLegacy:
      'Remained the foundational criminal code across German territories for nearly three centuries, though its high threshold of "full proof" paradoxically made judicial torture indispensable until Enlightenment jurists dismantled the two-witness rule.',
    lawConsequences: [
      {
        statuteRef: 'CCC Art. 22 & 54',
        offenseOrRule: 'Credible circumstantial evidence (redliche Anzeigung) of a felony without confession',
        documentedPunishment: 'Graduated judicial torture (thumbscrews, strappado) to secure verifiable confession',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Leading questions prohibited; facts had to be independently verified',
      },
      {
        statuteRef: 'CCC Art. 137',
        offenseOrRule: 'Premeditated murder or poisoning',
        documentedPunishment: 'Breaking on the wheel (men) or drowning/burial (infanticide), preceded by red-hot pincers for aggravated cases',
        category: 'Capital',
        classOrEvidentiaryNote: 'Distinguished from unpremeditated manslaughter (beheading)',
      },
      {
        statuteRef: 'CCC Art. 109 & 125',
        offenseOrRule: 'Arson, counterfeiting coin, or malicious sorcery causing harm',
        documentedPunishment: 'Death by burning at the stake',
        category: 'Capital',
        classOrEvidentiaryNote: 'Required physical harm in original 1532 witchcraft clause',
      },
      {
        statuteRef: 'CCC Art. 157–162',
        offenseOrRule: 'Grand theft or repeat third-offense larceny',
        documentedPunishment: 'Hanging (men) or drowning (women); simple first theft punished by restitution and pillory',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Graduated by value, repetition, and nighttime entry',
      },
    ],
  },
  {
    id: 'louis-xiv',
    accessionNumber: 'ACC. 1670CE.08',
    ruler: 'King Louis XIV',
    titleOrRole: 'King of France',
    codeName: 'Ordonnance Criminelle of 1670',
    yearLabel: '1670 CE',
    sortYear: 1670,
    era: 'medieval-early-modern',
    eraLabel: 'Medieval & Early Modern',
    region: 'Kingdom of France',
    geoRegion: 'europe',
    mapPoint: { x: 162, y: 162, city: 'Paris' },
    imageSrc: '/src/assets/images/artifact_medieval_charter_1795704595451.jpg',
    imageAlt: 'Royal crimson-sealed parchment decree symbolizing French absolutist criminal procedure.',
    figureCaption: 'Fig. 9 — Royal ordinances centralized criminal jurisdiction under Bourbon magistrates, eclipsing seigneurial courts.',
    authoritySource: 'Absolutist Divine Right Monarchy',
    classEquality: 'Nobles Beheaded; Commoners Broken or Hanged',
    tortureStatus: 'Question Préparatoire & Question Préalable',
    punishmentPhilosophy: 'Royal Majesty & Public Exemplary Terror',
    summary:
      'Part of Louis XIV’s sweeping legal codification under Colbert, the 1670 Criminal Ordinance standardized secret, written inquisitorial trials across France—denying defense counsel in capital cases and dividing judicial torture into pre-verdict and pre-execution stages.',
    historicalContext:
      'Prior to 1670, French criminal courts operated under conflicting regional customs and aristocratic courts. Louis XIV’s jurists created a single national procedure that placed absolute power in the royal investigating magistrate (lieutenant criminel), operating behind closed doors without a jury or defense lawyer.',
    primaryExcerpt: {
      citation: 'Ordonnance Criminelle, Title XIX, Article 1 (August 1670)',
      quote:
        'If there is considerable proof against the accused of a crime that merits the death penalty, and that proof is consistent, all judges may order that the accused be put to the question, even with reservation of existing proofs.',
    },
    tortureAndPunishmentDetail:
      'French law institutionalized two distinct tortures: the question préparatoire (rack, water-funnel swallowing, or leg-crushing brodequins) to extract a confession before judgment, and the question préalable applied after a death sentence solely to compel the condemned to name accomplices. Public executions—dramatized in cases like regicide Robert-François Damiens (1757)—included breaking on the wheel, royal galleys (forçats) for lesser felons, and quartering for regicide.',
    proceduralSafeguards:
      'Created automatic appellate review by the regional Parlements for every sentence imposing torture, galley servitude, or death—significantly reducing rash local executions compared to earlier centuries.',
    reformLegacy:
      'Voltaire’s fierce campaigns against secret trials under the 1670 Ordinance (notably the Calas Affair of 1762) catalyzed French public outrage; Louis XVI abolished the question préparatoire in 1780 and question préalable in 1788, before the Revolution ended inquisitorial secrecy.',
    lawConsequences: [
      {
        statuteRef: 'Title XIX · Art. 1',
        offenseOrRule: 'Capital offense backed by strong but incomplete proof',
        documentedPunishment: 'Question préparatoire (water torture or brodequins boot) prior to verdict',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'With "reservation of proofs," judges could still condemn to lesser penalties if suspect endured',
      },
      {
        statuteRef: 'Title XIX · Art. 12',
        offenseOrRule: 'Condemned capital felon suspected of having co-conspirators',
        documentedPunishment: 'Question préalable administered immediately before execution',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Abolished by Louis XVI in 1788',
      },
      {
        statuteRef: 'Title XIV · Art. 8',
        offenseOrRule: 'Defendant accused of a capital felony requesting legal representation',
        documentedPunishment: 'Defense counsel barred in capital trials; secret written interrogation only',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Overturned by 1789 Revolutionary criminal reforms',
      },
      {
        statuteRef: 'Royal Penal Custom',
        offenseOrRule: 'High treason / regicide vs. common highway robbery',
        documentedPunishment: 'Drawing and quartering for regicide; breaking on wheel or galley servitude for commoners',
        category: 'Capital',
        classOrEvidentiaryNote: 'Nobles granted the privilege of decapitation over hanging',
      },
    ],
  },
  {
    id: 'tokugawa-yoshimune',
    accessionNumber: 'ACC. 1742CE.09',
    ruler: 'Tokugawa Yoshimune',
    titleOrRole: 'Eighth Shogun of the Tokugawa Shogunate',
    codeName: 'Kujikata Osadamegaki',
    yearLabel: '1603–1742 CE',
    sortYear: 1742,
    era: 'imperial-asia',
    eraLabel: 'Imperial Asia',
    region: 'Edo Period Japan',
    geoRegion: 'asia',
    mapPoint: { x: 902, y: 224, city: 'Edo' },
    imageSrc: '/src/assets/images/hero_codex_archive_1795704594395.jpg',
    imageAlt: 'Archival legal scales and iron seals representing Edo-period shogunal justice.',
    figureCaption: 'Fig. 10 — The Kujikata Osadamegaki served as an internal magistrate manual governing trials, gōmon torture, and ranked penalties.',
    authoritySource: 'Shogunal Military Governance (Bakufu)',
    classEquality: 'Four-Tier Status System (Samurai Privilege of Seppuku)',
    tortureStatus: 'Gōmon Restricted to Four Capital Crimes',
    punishmentPhilosophy: 'Social Harmony & Status Deterrence',
    summary:
      'Consolidating Tokugawa Ieyasu’s precedents, Shogun Yoshimune promulgated the Kujikata Osadamegaki in 1742—a confidential judicial manual that severely restricted formal torture (gōmon) to four capital crimes while codifying status-based executions.',
    historicalContext:
      'For over a century after 1603, Edo magistrates relied on unwritten precedents. Yoshimune ordered a systematic two-volume compilation: administrative edicts and criminal statutes. Because Tokugawa justice prized confessions as essential for moral closure, magistrates used regulated physical duress only when guilt was already virtually certain.',
    primaryExcerpt: {
      citation: 'Kujikata Osadamegaki, Book II, Article 83 (1742)',
      quote:
        'Formal torture (gōmon) is strictly limited to four offenses: murder, arson, banditry, and breaking through barriers; and it may be applied only when clear evidence already establishes guilt yet the accused refuses to confess.',
    },
    tortureAndPunishmentDetail:
      'The Bakufu distinguished light interrogation beating (rōmon—scourging with bamboo-and-hemp whips) from formal gōmon, which included stone-hugging (ishidaki—stacking heavy flagstones across the shins while kneeling on ridged timber), lobster-binding (ebi-zeme), and ceiling suspension. Capital punishments were hierarchically ranked: samurai convicted of serious offenses were permitted honorable seppuku, whereas commoners faced beheading, burning at the stake for arson, or crucifixion (haritsuke) for parricide.',
    proceduralSafeguards:
      'A prison physician and scribe attended every formal gōmon session to halt torture before fatal injury; magistrates faced severe sanctions for torturing suspects outside the four enumerated capital crimes.',
    reformLegacy:
      'Gōmon remained legal until 1879, when Meiji legal reformer Gustave Boissonade and Japanese jurists abolished judicial torture entirely to modernize Japan’s courts and end unequal foreign treaties.',
    lawConsequences: [
      {
        statuteRef: 'Osadamegaki Art. 83',
        offenseOrRule: 'Murder, arson, banditry, or barrier-breaking with strong proof but no confession',
        documentedPunishment: 'Regulated gōmon (stone-stacking, suspension) attended by scribe and physician',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Strictly barred for minor civil or misdemeanor cases',
      },
      {
        statuteRef: 'Osadamegaki · Arson',
        offenseOrRule: 'Intentional arson in densely populated timber cities like Edo',
        documentedPunishment: 'Public parading followed by burning at the stake (hiaburi)',
        category: 'Capital',
        classOrEvidentiaryNote: 'Severe deterrence against urban fire catastrophes',
      },
      {
        statuteRef: 'Status Execution Rule',
        offenseOrRule: 'Samurai vs. commoner convicted of capital treason or homicide',
        documentedPunishment: 'Samurai granted ritual seppuku; commoners subjected to beheading or crucifixion',
        category: 'Capital',
        classOrEvidentiaryNote: 'Reflected strict Neo-Confucian four-class hierarchy',
      },
      {
        statuteRef: 'Osadamegaki · Petty Theft',
        offenseOrRule: 'Non-violent theft below 10 ryō gold threshold',
        documentedPunishment: 'Tattooing on the forearm (irezumi) and public flogging (tataki)',
        category: 'Corporal & Torture',
        classOrEvidentiaryNote: 'Third tattooed offense escalated to capital punishment',
      },
    ],
  },
  {
    id: 'leopold-beccaria',
    accessionNumber: 'ACC. 1786CE.10',
    ruler: 'Pietro Leopoldo & Beccaria',
    titleOrRole: 'Grand Duke of Tuscany & Jurist Cesare Beccaria',
    codeName: 'The Leopoldina Penal Code (1786)',
    yearLabel: '1764–1786 CE',
    sortYear: 1786,
    era: 'enlightenment-reform',
    eraLabel: 'Enlightenment & Reform',
    region: 'Grand Duchy of Tuscany (Italy)',
    geoRegion: 'europe',
    mapPoint: { x: 215, y: 206, city: 'Florence' },
    imageSrc: '/src/assets/images/artifact_enlightenment_treatise_1795704595708.jpg',
    imageAlt: 'Opened 18th-century Enlightenment legal treatise beside brass dividers on travertine.',
    figureCaption: 'Fig. 11 — Enlightenment jurisprudence translated Beccaria’s 1764 treatise into the first permanent state abolition of torture and capital punishment.',
    authoritySource: 'Social Contract & Utilitarian Reason',
    classEquality: 'Equal Civic Standing Before Penal Law',
    tortureStatus: 'Completely Abolished by Statute',
    punishmentPhilosophy: 'Proportionate Deterrence & Rehabilitation',
    summary:
      'Guided by Cesare Beccaria’s landmark 1764 treatise On Crimes and Punishments, Grand Duke Pietro Leopoldo enacted the 1786 Leopoldina—making Tuscany the first modern state in the world to formally abolish both judicial torture and the death penalty.',
    historicalContext:
      'In 1764, Milanese jurist Cesare Beccaria argued in Dei delitti e delle pene that torture punishes an innocent person before guilt is proven and rewards the physically strong criminal while condemning the weak innocent. Prussia (1740/1754) and Sweden (1772) had already curtailed torture, and in 1786 Leopold II translated Enlightenment theory into comprehensive statutory law.',
    primaryExcerpt: {
      citation: 'Cesare Beccaria, On Crimes and Punishments, Ch. XVI (1764) & Leopoldina Art. LI (1786)',
      quote:
        'No man can be judged a criminal until he be found guilty; nor can society take from him the public protection until it have been proved that he has violated the conditions on which it was granted. What right, then, but that of power, can authorize a judge to inflict punishment on a citizen while his guilt is still in doubt?',
    },
    tortureAndPunishmentDetail:
      'The Leopoldina (November 30, 1786) ordered the public burning of all racks, gallows, and instruments of torture in Florence. It banned capital execution, mutilation, branding, and confiscation of family property, replacing them with fixed terms of imprisonment, public works labor, restitution to victims, and open judicial reasoning.',
    proceduralSafeguards:
      'Mandated that trials be transparent, accused persons receive defense counsel, sentences rely on coherent moral certainty rather than tortured confessions, and judges publish written legal grounds for every verdict.',
    reformLegacy:
      'Sparked the modern international abolition movement; Tuscany still commemorates November 30 annually as the "Festa della Toscana" marking the first legislative abolition of capital punishment and torture.',
    lawConsequences: [
      {
        statuteRef: 'Leopoldina Art. XXXIII',
        offenseOrRule: 'Use of any physical torture during criminal interrogation',
        documentedPunishment: 'Permanently abolished; judicial instruments ordered destroyed',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Coerced confessions declared legally void',
      },
      {
        statuteRef: 'Leopoldina Art. LI',
        offenseOrRule: 'All crimes formerly carrying execution (murder, treason, robbery)',
        documentedPunishment: 'Death penalty abolished; replaced by life or fixed public labor imprisonment',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'First modern state code to abolish capital punishment completely',
      },
      {
        statuteRef: 'Leopoldina Art. XLVI',
        offenseOrRule: 'Property theft or economic fraud',
        documentedPunishment: 'Mandatory victim restitution combined with proportionate detention',
        category: 'Restitution & Civil',
        classOrEvidentiaryNote: 'Ended estate confiscation that punished innocent families',
      },
      {
        statuteRef: 'Leopoldina Art. LXII',
        offenseOrRule: 'Crime of "lèse-majesté" (verbal criticism of the sovereign)',
        documentedPunishment: 'Abolished as a capital treason category; treated as ordinary defamation or disorder',
        category: 'Procedure & Reform',
        classOrEvidentiaryNote: 'Dismantled ancient Roman treason exemptions',
      },
    ],
  },
];

export const JUDICIAL_DOCTRINES: JudicialDoctrineStudy[] = [
  {
    id: 'regina-probationum',
    index: '01',
    title: 'Roman-Canon Law & "Queen of Proofs"',
    period: '12th–18th Century Europe',
    region: 'Continental Europe',
    legalPurpose: 'Evidentiary Extraction (Quaestio)',
    summary:
      'Because medieval Continental judges could not convict a suspect of a capital crime without either two unimpeachable eyewitnesses or a confession, judicial torture was legally framed not as punishment, but as a strict mechanism to obtain the "queen of proofs" (regina probationum).',
    mechanics: [
      'Required prior circumstantial proof (indicia) before torture could be ordered.',
      'Forbidden to ask leading questions; the accused had to supply verifiable facts.',
      'Confessions had to be repeated voluntarily outside the torture chamber within 24 hours.',
    ],
    turningPoint: 'Collapsed in the 18th century as jurists recognized free judicial evaluation of circumstantial evidence without needing forced confessions.',
  },
  {
    id: 'trial-by-ordeal',
    index: '02',
    title: 'Trial by Ordeal & Divine Judgment',
    period: '1750 BCE – 1215 CE',
    region: 'Mesopotamia & Medieval Europe',
    legalPurpose: 'Supernatural Adjudication',
    summary:
      'When human witnesses were lacking—in witchcraft, adultery, or secret poisoning—ancient and early medieval societies shifted the burden of judgment to the divine through fire, boiling water, or river submersion.',
    mechanics: [
      'Babylonian River Ordeal: survival in the Euphrates currents proved innocence.',
      'Medieval Hot Iron: carrying heated iron nine paces; clean healing after three days signaled divine acquittal.',
      'Cold Water Ordeal: pure water was believed to "reject" the guilty by making them float.',
    ],
    turningPoint: 'Ended across Western Christendom in 1215 when the Fourth Lateran Council forbade clergy from consecrating ordeals.',
  },
  {
    id: 'legalist-deterrence',
    index: '03',
    title: 'Legalist Deterrence & Collective Liability',
    period: '350 BCE – 210 BCE',
    region: 'Warring States & Qin China',
    legalPurpose: 'Administrative Control & Deterrence',
    summary:
      'Early Chinese Legalists (Shang Yang, Han Feizi) rejected moral persuasion in favor of transparent, inescapable penalties designed to make the cost of disobedience terrifyingly certain for every rank.',
    mechanics: [
      'Baojia mutual surveillance forced neighbors and kin to report infractions or share guilt.',
      'The Five Punishments combined bodily mutilation with lifelong state labor.',
      'Magistrates faced strict penalties themselves if they falsified interrogation logs.',
    ],
    turningPoint: 'Reformed under Han Emperor Wen (167 BCE), who abolished permanent facial and limb mutilations in favor of flogging and labor terms.',
  },
  {
    id: 'enlightenment-abolition',
    index: '04',
    title: 'Enlightenment Abolition & Proportionality',
    period: '1740 – 1800 CE',
    region: 'Prussia, Tuscany, France & Sweden',
    legalPurpose: 'Rights-Based Procedural Reform',
    summary:
      'Eighteenth-century thinkers proved that judicial torture inverted justice—acquitting guilty suspects with high pain tolerance while forcing innocent people to confess falsely—and argued that certainty, not cruelty, deters crime.',
    mechanics: [
      'Frederick the Great restricted and effectively abolished Prussian judicial torture (1740–1754).',
      'Beccaria’s 1764 treatise argued punishment must be public, prompt, and strictly proportionate.',
      'Tuscany’s 1786 Leopoldina eliminated both torture and execution in a single statutory code.',
    ],
    turningPoint: 'Inspired constitutional bans on cruel and unusual punishment (1789 US Bill of Rights) and the French Declaration of the Rights of Man.',
  },
];

export const HISTORICAL_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    eraLabel: 'Ancient Near East',
    question: 'In Hammurabi’s Code (c. 1750 BCE), how did social rank affect the penalty for physical injury?',
    options: [
      'All inhabitants received identical bodily retaliation regardless of status.',
      'Mirror retaliation (eye for an eye) applied among elites, while injuries to commoners or enslaved people resulted in silver fines.',
      'Only priests were subject to silver fines while kings faced exile.',
      'Physical injury was never punished; only property theft carried penalties.',
    ],
    correctIndex: 1,
    explanation:
      'Statutes §§ 196–199 explicitly scaled justice by rank: destroying an aristocrat’s eye brought identical retaliation, whereas injuring a commoner or enslaved person required silver compensation.',
  },
  {
    id: 'q2',
    eraLabel: 'Medieval Europe · 1215 CE',
    question: 'Why did the Fourth Lateran Council’s 1215 ban on Trial by Ordeal unintentionally lead to increased judicial torture in Continental Europe?',
    options: [
      'It ordered kings to execute all accused persons immediately without trial.',
      'Without divine ordeals, Continental Roman-canon courts required two eyewitnesses or a confession for conviction, turning to torture to extract confessions.',
      'It legalized private blood feuds across every European city.',
      'It abolished all written records in favor of oral combat.',
    ],
    correctIndex: 1,
    explanation:
      'Once clergy stopped consecrating hot-iron and cold-water ordeals in 1215, England expanded lay jury verdicts while Continental courts adopted Roman-canon proof standards that relied on extracting confessions under quaestio.',
  },
  {
    id: 'q3',
    eraLabel: 'Imperial Asia · 1742 CE',
    question: 'Under Tokugawa Yoshimune’s Kujikata Osadamegaki (1742), when was formal judicial torture (gōmon) legally permitted?',
    options: [
      'For any civil debt or verbal disagreement between merchants.',
      'Strictly for four capital crimes (murder, arson, banditry, barrier-breaking) when clear evidence already existed.',
      'Only against samurai nobles, while commoners were immune.',
      'Before any witnesses were interviewed or evidence gathered.',
    ],
    correctIndex: 1,
    explanation:
      'Article 83 of the Kujikata Osadamegaki restricted formal gōmon to four grave capital crimes and required strong preexisting evidence before a physician-monitored session could proceed.',
  },
  {
    id: 'q4',
    eraLabel: 'Enlightenment Reform · 1786 CE',
    question: 'Which sovereign state enacted the first modern statutory code (the Leopoldina of 1786) to permanently abolish both judicial torture and the death penalty?',
    options: [
      'The Kingdom of France under Louis XIV',
      'The Grand Duchy of Tuscany under Pietro Leopoldo',
      'The Holy Roman Empire under Charles V',
      'The Babylonian Empire under Hammurabi',
    ],
    correctIndex: 1,
    explanation:
      'Inspired by Cesare Beccaria’s On Crimes and Punishments (1764), Grand Duke Pietro Leopoldo promulgated the Leopoldina on November 30, 1786, destroying Tuscany’s torture instruments and abolishing capital punishment.',
  },
];

export const HISTORIC_EVENTS: HistoricEventEntry[] = [
  {
    id: 'ur-nammu',
    yearLabel: 'c. 2100 BCE',
    sortYear: -2100,
    title: 'Code of Ur-Nammu Promulgated in Sumer',
    region: 'Ur (Mesopotamia)',
    eraLabel: 'Ancient Near East',
    relatedRulerId: 'hammurabi',
    tags: ['sumer', 'ur-nammu', 'oldest law code', 'silver fines', 'ordeal'],
    summary: 'The oldest surviving written law code in human history, predating Hammurabi by roughly three centuries, favored monetary silver compensation over bodily mutilation for non-capital injuries.',
    legalSignificance: 'Established standardized weights, marriage protections, and financial restitution schedules centuries before Babylonian lex talionis.',
    punishmentContext: 'Capital penalties were reserved for murder, robbery, and adultery; unresolved witchcraft accusations used the Euphrates River Ordeal.',
  },
  {
    id: 'trial-of-socrates',
    yearLabel: '399 BCE',
    sortYear: -399,
    title: 'Trial and Execution of Socrates in Athens',
    region: 'Athens (Classical Greece)',
    eraLabel: 'Classical Antiquity',
    relatedRulerId: 'draco-solon',
    tags: ['socrates', 'athens', 'hemlock', 'impiety', 'jury', 'dikasteria'],
    summary: 'Tried before 501 Athenian citizen jurors (dikasteria) for impiety and corrupting youth, Socrates was convicted by majority vote and condemned to drink hemlock.',
    legalSignificance: 'Demonstrated both the procedural power of Solonian popular jury courts and the absence of constitutional protections for minority speech.',
    punishmentContext: 'Free Athenian citizens were exempt from judicial torture (basanos) and executed privately via hemlock rather than public crucifixion.',
  },
  {
    id: 'burning-of-books',
    yearLabel: '213–212 BCE',
    sortYear: -213,
    title: 'Qin Suppression of Dissenting Classics & Scholars',
    region: 'Qin Empire (China)',
    eraLabel: 'Imperial Asia',
    relatedRulerId: 'qin-shi-huang',
    tags: ['qin shi huang', 'li si', 'legalism', 'censorship', 'execution'],
    summary: 'Acting on Chancellor Li Si’s memorial, Emperor Qin Shi Huang ordered private historical chronicles and Confucian treatises surrendered for burning to prevent scholars from criticizing imperial decrees.',
    legalSignificance: 'Marked an early imperial precedent linking ideological dissent directly to capital treason statutes.',
    punishmentContext: 'Possessing banned texts thirty days after the decree carried facial tattooing and four years of frontier wall labor; quoting classics to criticize the court brought marketplace execution.',
  },
  {
    id: 'knights-templar-trial',
    yearLabel: '1307–1314 CE',
    sortYear: 1307,
    title: 'Arrest & Inquisitorial Trial of the Knights Templar',
    region: 'Kingdom of France',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'innocent-iv',
    tags: ['templar', 'philip iv', 'inquisition', 'torture', 'strappado', 'burning'],
    summary: 'King Philip IV of France ordered simultaneous dawn arrests of the Knights Templar, deploying royal inquisitors to extract confessions of heresy using prolonged torture.',
    legalSignificance: 'Exposed how monarchs could weaponize Romano-canonical heresy procedures for political and financial confiscation.',
    punishmentContext: 'Templars who retracted tortured confessions—including Grand Master Jacques de Molay in 1314—were condemned as relapsed heretics and burned alive in Paris.',
  },
  {
    id: 'trial-of-joan-of-arc',
    yearLabel: '1431 CE',
    sortYear: 1431,
    title: 'Inquisitorial Trial of Joan of Arc at Rouen',
    region: 'Rouen (Anglo-French Hundred Years’ War)',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'innocent-iv',
    tags: ['joan of arc', 'rouen', 'heresy', 'inquisition', 'burning'],
    summary: 'Captured by Burgundian forces and transferred to an English-backed ecclesiastical court, Joan of Arc faced months of hostile interrogation without legal counsel.',
    legalSignificance: 'Twenty-five years later, a papal nullification court overturned the 1431 verdict due to procedural violations, lack of defense advocacy, and coerced relapse.',
    punishmentContext: 'Though spared physical torture after examiners feared it would undermine English propaganda, Joan was threatened with the rack and burned as a relapsed heretic on May 30, 1431.',
  },
  {
    id: 'spanish-inquisition',
    yearLabel: '1478–1834 CE',
    sortYear: 1478,
    title: 'Establishment of the Spanish Inquisition',
    region: 'Castile & Aragon (Spain)',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'innocent-iv',
    tags: ['spanish inquisition', 'torquemada', 'auto de fe', 'toca', 'garrucha', 'heresy'],
    summary: 'Authorized by Pope Sixtus IV at the request of Ferdinand II and Isabella I, the Spanish Inquisition operated directly under the Spanish Crown to police religious orthodoxy.',
    legalSignificance: 'Centralized secret tribunals across Spanish territories, keeping meticulous interrogation transcripts while stripping accused persons of knowing their accusers’ identities.',
    punishmentContext: 'Employed regulated torture (garrucha suspension, toca water-boarding, and the potro rack) in a minority of trials; unrepentant prisoners were "relaxed" to civil authorities at public autos-da-fé for burning.',
  },
  {
    id: 'tudor-treason-acts',
    yearLabel: '1534–1605 CE',
    sortYear: 1534,
    title: 'Tudor Treason Acts & Tower of London Torture Warrants',
    region: 'Kingdom of England',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'king-john-lateran',
    tags: ['henry viii', 'tower of london', 'treason', 'guy fawkes', 'rack', 'quartering'],
    summary: 'Although English common law prohibited torture in ordinary felony courts, the Tudor and early Stuart Privy Council issued special royal warrants authorizing torture in the Tower of London for high treason.',
    legalSignificance: 'Demonstrated the boundary between common-law due process (Magna Carta) and royal prerogative in state security cases—famously used during the 1605 Gunpowder Plot investigation.',
    punishmentContext: 'Suspects like Guy Fawkes and Anne Askew were stretched on the rack; treason convictions carried hanging, drawing, and quartering for men or burning for women.',
  },
  {
    id: 'salem-witch-trials',
    yearLabel: '1692–1693 CE',
    sortYear: 1692,
    title: 'Salem Witch Trials in Colonial Massachusetts',
    region: 'Massachusetts Bay Colony',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'charles-v',
    tags: ['salem', 'witchcraft', 'spectral evidence', 'giles corey', 'peine forte et dure'],
    summary: 'Over 200 people were accused of witchcraft in colonial New England; nineteen were hanged and one—Giles Corey—was pressed to death under heavy stones for refusing to enter a plea.',
    legalSignificance: 'Collapsed once Governor William Phips banned "spectral evidence" (testimony about dreams or spirits), marking a decisive shift toward stricter evidentiary standards.',
    punishmentContext: 'Employed English common law’s peine forte et dure (two days of heavy stone pressing on Giles Corey) alongside hanging; no suspects were burned at Salem.',
  },
  {
    id: 'execution-of-damiens',
    yearLabel: '1757 CE',
    sortYear: 1757,
    title: 'Public Execution of Robert-François Damiens in Paris',
    region: 'Paris (Kingdom of France)',
    eraLabel: 'Medieval & Early Modern',
    relatedRulerId: 'louis-xiv',
    tags: ['damiens', 'louis xv', 'regicide', 'quartering', 'question préalable', 'foucault'],
    summary: 'After attempting to stab King Louis XV with a penknife, Damiens was subjected to the judicial boot torture (brodequins) and publicly dismembered at the Place de Grève—the last person quartered in France.',
    legalSignificance: 'Became the infamous symbol of Bourbon penal cruelty, turning European intellectual opinion sharply against theatrical state torture.',
    punishmentContext: 'Combined pre-execution question préalable to name non-existent accomplices with red-hot pincers, molten wax/lead, and tearing by four horses.',
  },
  {
    id: 'calas-affair',
    yearLabel: '1762–1765 CE',
    sortYear: 1762,
    title: 'The Calas Affair & Voltaire’s Campaign Against Torture',
    region: 'Toulouse (France)',
    eraLabel: 'Enlightenment & Reform',
    relatedRulerId: 'louis-xiv',
    tags: ['voltaire', 'jean calas', 'breaking on the wheel', 'ordonnance criminelle', 'reform'],
    summary: 'Protestant merchant Jean Calas was falsely accused of murdering his son to prevent conversion to Catholicism, tortured under Louis XIV’s 1670 Ordinance, and broken on the wheel without confessing.',
    legalSignificance: 'Voltaire’s Treatise on Tolerance (1763) mobilized Europe to overturn Calas’s conviction posthumously in 1765, discrediting secret inquisitorial trials.',
    punishmentContext: 'Calas endured water torture and the iron boot before being broken limb-by-limb on the wheel and strangled, inspiring Beccaria and French abolitionists.',
  },
  {
    id: 'reign-of-terror',
    yearLabel: '1793–1794 CE',
    sortYear: 1793,
    title: 'Law of Suspects & Revolutionary Tribunal (Reign of Terror)',
    region: 'First French Republic',
    eraLabel: 'Enlightenment & Reform',
    relatedRulerId: 'leopold-beccaria',
    tags: ['french revolution', 'robespierre', 'guillotine', 'law of 22 prairial', 'terror'],
    summary: 'Although the French Revolution abolished royal judicial torture in 1789 and adopted the guillotine as an egalitarian execution tool, the 1793–1794 Terror stripped defendants of defense lawyers and witnesses.',
    legalSignificance: 'Under the Law of 22 Prairial (June 1794), the Revolutionary Tribunal could issue only two verdicts—acquittal or death—showing how emergency security laws erode fair-trial reforms.',
    punishmentContext: 'Eliminated bodily mutilation and torture prior to death, replacing ranked royal executions with uniform rapid decapitation by guillotine.',
  },
  {
    id: 'meiji-torture-abolition',
    yearLabel: '1879 CE',
    sortYear: 1879,
    title: 'Meiji Japan Abolishes Judicial Torture',
    region: 'Tokyo (Empire of Japan)',
    eraLabel: 'Imperial Asia',
    relatedRulerId: 'tokugawa-yoshimune',
    tags: ['meiji', 'japan', 'gomon', 'boissonade', 'abolition', 'reform'],
    summary: 'As part of sweeping Meiji legal modernization advised by French jurist Gustave Boissonade, Japan formally repealed centuries of Tokugawa gōmon interrogation rules in 1879.',
    legalSignificance: 'Moved Japanese criminal procedure away from confession-dependent trials toward modern evidentiary evaluation and codified penal statutes.',
    punishmentContext: 'Ended stone-weighting (ishidaki), suspension torture, and status-based punishments like traditional tattooing and crucifixion.',
  },
];

export const CENTURY_LEGAL_DENSITY: CenturyLegalDatum[] = [
  {
    year: -2100,
    yearLabel: '2100 BCE',
    centuryLabel: '21st Century BCE',
    eraLabel: 'Ancient Near East',
    lawCodeDensity: 2,
    tortureFrequency: 1,
    tortureClassification: 'Ordeal Only · Minimal Torture',
    keyCodices: ['Code of Ur-Nammu (Sumer)'],
    relatedRulerId: 'hammurabi',
    summary: 'Early Sumerian city-states recorded the oldest surviving written statutes, prioritizing silver restitution fines and using river ordeals rather than systematic interrogation torture.',
  },
  {
    year: -1750,
    yearLabel: '1750 BCE',
    centuryLabel: '18th Century BCE',
    eraLabel: 'Ancient Near East',
    lawCodeDensity: 4,
    tortureFrequency: 2,
    tortureClassification: 'Ordeal & Retaliatory Mutilation',
    keyCodices: ['Code of Hammurabi', 'Laws of Eshnunna'],
    relatedRulerId: 'hammurabi',
    summary: 'Babylonian royal steles standardized 282 statutes across Mesopotamia, codifying class-scaled bodily retaliation (lex talionis) and the Euphrates River Ordeal.',
  },
  {
    year: -1100,
    yearLabel: '1100 BCE',
    centuryLabel: '11th Century BCE',
    eraLabel: 'Ancient Near East',
    lawCodeDensity: 3,
    tortureFrequency: 3,
    tortureClassification: 'Corporal Mutilation',
    keyCodices: ['Middle Assyrian Laws'],
    summary: 'Assyrian clay tablets prescribed severe corporal mutilations—ear cropping, flogging, and forced labor—while expanding state enforcement of family and property law.',
  },
  {
    year: -620,
    yearLabel: '620 BCE',
    centuryLabel: '7th Century BCE',
    eraLabel: 'Classical Antiquity',
    lawCodeDensity: 5,
    tortureFrequency: 4,
    tortureClassification: 'Enslaved Witness Basanos',
    keyCodices: ['Draconian Constitution (Athens)', 'Gortyn Code'],
    relatedRulerId: 'draco-solon',
    summary: 'Greek city-states inscribed laws publicly on stone and wooden axones; Athens exempted free citizens from judicial torture while compelling enslaved testimony through basanos.',
  },
  {
    year: -450,
    yearLabel: '450 BCE',
    centuryLabel: '5th Century BCE',
    eraLabel: 'Classical Antiquity',
    lawCodeDensity: 6,
    tortureFrequency: 4,
    tortureClassification: 'Citizen Exemption · Slave Basanos',
    keyCodices: ['Twelve Tables (Rome)', 'Solonian Civic Courts'],
    relatedRulerId: 'draco-solon',
    summary: 'Rome’s Twelve Tables and Athenian dikasteria expanded written civil protections for citizens, though enslaved populations remained subject to physical interrogation.',
  },
  {
    year: -220,
    yearLabel: '220 BCE',
    centuryLabel: '3rd Century BCE',
    eraLabel: 'Imperial Asia',
    lawCodeDensity: 8,
    tortureFrequency: 7,
    tortureClassification: 'Regulated Interrogation & Five Punishments',
    keyCodices: ['Qin Legalist Code (Qinlü)', 'Shuihudi Statutes'],
    relatedRulerId: 'qin-shi-huang',
    summary: 'Qin unification produced dense bamboo-slip administrative and criminal codes enforcing collective household liability (baojia), rod interrogation, and bodily mutilations.',
  },
  {
    year: -150,
    yearLabel: '150 BCE',
    centuryLabel: '2nd Century BCE',
    eraLabel: 'Imperial Asia & Rome',
    lawCodeDensity: 7,
    tortureFrequency: 5,
    tortureClassification: 'Han Mutilation Reform',
    keyCodices: ['Han Emperor Wen Reforms (167 BCE)', 'Roman Lex Cornelia'],
    relatedRulerId: 'qin-shi-huang',
    summary: 'Han Emperor Wen abolished permanent facial tattooing and limb amputation, replacing them with regulated bastinado and fixed labor terms.',
  },
  {
    year: 200,
    yearLabel: '200 CE',
    centuryLabel: '2nd–3rd Century CE',
    eraLabel: 'Classical Antiquity',
    lawCodeDensity: 8,
    tortureFrequency: 6,
    tortureClassification: 'Expanding Quaestio (Treason)',
    keyCodices: ['Writings of Ulpian & Papinian', 'Imperial Rescripts'],
    relatedRulerId: 'justinian',
    summary: 'Roman imperial jurists debated the reliability of quaestio; while Ulpian warned torture deceived the truth, emperors extended it to free citizens accused of treason.',
  },
  {
    year: 530,
    yearLabel: '530 CE',
    centuryLabel: '6th Century CE',
    eraLabel: 'Classical Antiquity',
    lawCodeDensity: 9,
    tortureFrequency: 6,
    tortureClassification: 'Codified Quaestio on Indicia',
    keyCodices: ['Corpus Juris Civilis (Justinian I)'],
    relatedRulerId: 'justinian',
    summary: 'Justinian’s jurists synthesized centuries of Roman law into the Digest and Codex, formalizing circumstantial indicia requirements before torture could be ordered.',
  },
  {
    year: 800,
    yearLabel: '800 CE',
    centuryLabel: '9th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 4,
    tortureFrequency: 3,
    tortureClassification: 'Wergild Fines & Divine Ordeals',
    keyCodices: ['Carolingian Capitularies', 'Lex Salica'],
    summary: 'Early medieval kingdoms relied on kinship wergild compensation, oath-helpers, and hot-iron or cold-water ordeals rather than Roman-style judicial torture.',
  },
  {
    year: 1150,
    yearLabel: '1150 CE',
    centuryLabel: '12th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 6,
    tortureFrequency: 4,
    tortureClassification: 'Roman Law Revival (Bologna)',
    keyCodices: ['Gratian’s Decretum', 'Assizes of Clarendon'],
    summary: 'Rediscovery of Justinian’s Digest in Italian universities revived written Romano-canonical evidentiary standards across European secular and church courts.',
  },
  {
    year: 1250,
    yearLabel: '1250 CE',
    centuryLabel: '13th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 8,
    tortureFrequency: 7,
    tortureClassification: 'Inquisitorial Torture Authorized',
    keyCodices: ['Magna Carta (1215)', 'Lateran IV (1215)', 'Ad Extirpanda (1252)'],
    relatedRulerId: 'innocent-iv',
    summary: 'After Lateran IV abolished divine ordeals in 1215, England built jury trials while Continental courts adopted Roman-canon torture under Ad Extirpanda (1252) to secure confessions.',
  },
  {
    year: 1350,
    yearLabel: '1350 CE',
    centuryLabel: '14th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 7,
    tortureFrequency: 8,
    tortureClassification: 'Widespread Municipal Quaestio',
    keyCodices: ['Statutes of Italian Communes', 'Knights Templar Trials'],
    relatedRulerId: 'innocent-iv',
    summary: 'City-states and royal courts routinely used the strappado and rack in felony and heresy inquiries, driven by the high two-eyewitness threshold for conviction.',
  },
  {
    year: 1480,
    yearLabel: '1480 CE',
    centuryLabel: '15th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 9,
    tortureFrequency: 8,
    tortureClassification: 'Inquisitorial Tribunals',
    keyCodices: ['Spanish Inquisition Charter (1478)', 'Ordonnances of Blois'],
    relatedRulerId: 'innocent-iv',
    summary: 'Centralized crown tribunals institutionalized secret written proceedings, garrucha suspension, and water torture (toca) across Spain and parts of Western Europe.',
  },
  {
    year: 1532,
    yearLabel: '1532 CE',
    centuryLabel: '16th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 11,
    tortureFrequency: 9,
    tortureClassification: 'Peak Institutionalization (CCC)',
    keyCodices: ['Constitutio Criminalis Carolina (1532)', 'Tudor Treason Warrants'],
    relatedRulerId: 'charles-v',
    summary: 'Charles V’s imperial code standardized strict indicia rules for painful interrogation (peinliche Frage) while codifying aggravated public executions across Central Europe.',
  },
  {
    year: 1650,
    yearLabel: '1650 CE',
    centuryLabel: '17th Century CE',
    eraLabel: 'Medieval & Early Modern',
    lawCodeDensity: 12,
    tortureFrequency: 9,
    tortureClassification: 'Peak Institutionalization (Question)',
    keyCodices: ['Ordonnance Criminelle (1670)', 'Witchcraft & Treason Trials'],
    relatedRulerId: 'louis-xiv',
    summary: 'Louis XIV’s 1670 Ordinance centralized secret royal inquisitorial trials in France, codifying both pre-verdict (question préparatoire) and pre-execution torture.',
  },
  {
    year: 1742,
    yearLabel: '1742 CE',
    centuryLabel: 'Mid-18th Century CE',
    eraLabel: 'Imperial Asia & Enlightenment',
    lawCodeDensity: 13,
    tortureFrequency: 6,
    tortureClassification: 'Prussian Ban · Edo Restriction',
    keyCodices: ['Kujikata Osadamegaki (1742)', 'Prussian Abolition (1740–1754)'],
    relatedRulerId: 'tokugawa-yoshimune',
    summary: 'Tokugawa Yoshimune restricted gōmon strictly to four capital crimes, while Frederick the Great began dismantling judicial torture in Prussia.',
  },
  {
    year: 1786,
    yearLabel: '1786 CE',
    centuryLabel: 'Late 18th Century CE',
    eraLabel: 'Enlightenment & Reform',
    lawCodeDensity: 15,
    tortureFrequency: 2,
    tortureClassification: 'Rapid Abolition (Leopoldina)',
    keyCodices: ['Beccaria (1764)', 'The Leopoldina (1786)', 'French 1789 Reforms'],
    relatedRulerId: 'leopold-beccaria',
    summary: 'Inspired by Beccaria’s On Crimes and Punishments, Tuscany enacted the 1786 Leopoldina—permanently abolishing torture and execution—followed by France in 1788–1789.',
  },
  {
    year: 1850,
    yearLabel: '1850 CE',
    centuryLabel: '19th Century CE',
    eraLabel: 'Enlightenment & Reform',
    lawCodeDensity: 16,
    tortureFrequency: 1,
    tortureClassification: 'Statutory Prohibition',
    keyCodices: ['Napoleonic Penal Codes', 'Meiji Abolition (1879)'],
    relatedRulerId: 'leopold-beccaria',
    summary: 'Modern codified penal systems spread globally, ending legal judicial torture in Europe and Japan (1879) in favor of open evidentiary trials and proportionate imprisonment.',
  },
];


