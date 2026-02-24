import { db } from "./db";
import { sections } from "./schema";
import { generateId } from "./utils";

export const DEFAULT_SECTIONS = [
  {
    icon: "👤",
    name: "Personal Information",
    description:
      "Full legal name, SSN, birth certificate location, driver's license, passport details",
    emptyPrompt:
      "Include your full legal name, SSN, where your birth certificate is stored, passport number and location, driver's license details.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    name: "Family & Contacts",
    description:
      "Family member details, emergency contacts, doctors, attorneys, accountant, key people to notify",
    emptyPrompt:
      "List family members with contact info, emergency contacts, your attorney, accountant, doctor, and key people who should be notified.",
  },
  {
    icon: "🏥",
    name: "Medical Information",
    description:
      "Health conditions, medications, allergies, doctors, medical history, healthcare proxy, DNR wishes",
    emptyPrompt:
      "Document your health conditions, current medications, allergies, primary care doctor, specialists, and any DNR or healthcare proxy instructions.",
  },
  {
    icon: "🐕",
    name: "Pet Information",
    description:
      "Pet names, vet info, medications, care instructions, who should take them",
    emptyPrompt:
      "For each pet: name, breed, vet contact, medications, feeding schedule, care instructions, and who should care for them if you're gone.",
  },
  {
    icon: "🏠",
    name: "Property & Home",
    description:
      "Home address, mortgage info, property tax, HOA, security codes, where keys are, maintenance contacts",
    emptyPrompt:
      "Document your mortgage lender, monthly payment, property tax info, HOA details, security codes, where spare keys are, and maintenance contacts.",
  },
  {
    icon: "💰",
    name: "Financial Accounts",
    description:
      "Bank accounts, investment accounts, retirement accounts, debts, who to contact",
    emptyPrompt:
      "List each bank and investment account: institution name, account type, approximate balance, and who to contact. Don't forget retirement accounts!",
  },
  {
    icon: "💳",
    name: "Credit Cards",
    description:
      "Card details (last 4 digits), issuers, how to cancel, autopay subscriptions on each",
    emptyPrompt:
      "List each credit card: issuer, last 4 digits, how to cancel, and which subscriptions autopay to that card.",
  },
  {
    icon: "🛡️",
    name: "Insurance",
    description:
      "Health, life, auto, home, disability — policy numbers, agents, beneficiaries",
    emptyPrompt:
      "Document all insurance policies: health, life, auto, home, disability. Include policy numbers, agent contacts, and beneficiary designations.",
  },
  {
    icon: "🔐",
    name: "Passwords & Digital Accounts",
    description:
      "Password manager master password, email accounts, social media, important online accounts",
    emptyPrompt:
      "Start with your password manager master password (if you use one). Then list critical accounts: email, banking, social media, streaming services.",
  },
  {
    icon: "📄",
    name: "Legal Documents",
    description:
      "Will location, trust documents, power of attorney, birth/marriage/death certificates, titles, deeds",
    emptyPrompt:
      "Document where your will is stored, any trust documents, power of attorney, and where to find birth/marriage certificates, property titles, and deeds.",
  },
  {
    icon: "💼",
    name: "Employment & Income",
    description:
      "Employer info, HR contacts, benefits, pension, unvested stock, final paycheck instructions",
    emptyPrompt:
      "Include employer details, HR contact, benefits information, pension or 401k info, any unvested stock options, and final paycheck instructions.",
  },
  {
    icon: "🔧",
    name: "House How-To's",
    description:
      "How to work the thermostat, water shutoff, circuit breaker, lawn care schedule, maintenance tips",
    emptyPrompt:
      "Document: water shutoff valve location, circuit breaker location, thermostat instructions, HVAC filter schedule, lawn care, and seasonal maintenance tasks.",
  },
  {
    icon: "📝",
    name: "Final Wishes",
    description:
      "Funeral preferences, burial vs cremation, obituary notes, people to notify, religious preferences",
    emptyPrompt:
      "Share your preferences: burial or cremation? Any specific funeral wishes? Religious or cultural traditions to honor? Who should be notified?",
  },
  {
    icon: "💌",
    name: "Letters & Messages",
    description:
      "Personal letters to family members to be read after death",
    emptyPrompt:
      "Write personal letters to family members — things you want them to know, memories to share, or advice for the future.",
  },
  {
    icon: "📋",
    name: "Additional Notes",
    description: "Anything else that doesn't fit above",
    emptyPrompt:
      "Use this space for anything important that doesn't fit in the other sections.",
  },
];

export async function seedDefaultSections(familyId: string) {
  const sectionData = DEFAULT_SECTIONS.map((s, index) => ({
    id: generateId(),
    familyId,
    name: s.name,
    description: s.description,
    icon: s.icon,
    sortOrder: index + 1,
    isDefault: true as boolean,
  }));

  await db.insert(sections).values(sectionData);
  return sectionData;
}
