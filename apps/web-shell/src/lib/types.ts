export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoMetadata {
  title: string;
  metaDescription: string;
  whatIsThis: string;
  howItWorks: string;
  whyUseIt: string;
  faqs: FaqItem[];
}

export interface UtilityItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: string;
  technology: string;
  keywords: string[];
  primaryKeywords?: string[];
  secondaryKeywords?: string[];
  targetUsers: string[];
  userProblem?: string;
  searchIntent?: string;
  resultInterpretation?: string;
  practicalGuidance?: string;
  limitations?: string;
  formula?: string;
  trustNotes?: string;
  badge?: "Popular" | "Essential" | "Productivity" | "Daily" | "Academic" | "Design" | "Modern" | "New";
  related: string[];
  seo: SeoMetadata;
  futureImprovements?: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
}

export interface RoleItem {
  id: string;
  title: string;
  description: string;
  recommendedTools: string[];
}

export type PlatformType =
  | "WINDOWS_WIDGET"
  | "EDGE_SIDEBAR"
  | "PWA"
  | "DESKTOP_WIDGET"
  | "TRAY_UTILITY"
  | "DESKTOP_APPLICATION"
  | "WEB_UTILITY"
  | "OTHER";

export type VerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "UNVERIFIED"
  | "OUTDATED"
  | "REMOVED";

export type InstallationDifficulty = "Easy" | "Medium" | "Difficult";
export type ResourceUsage = "Low" | "Medium" | "High" | "Unknown";
export type PrivacyRating = "Good" | "Review" | "Concern" | "Unknown";
export type ReliabilityRating = "High" | "Medium" | "Low" | "Unknown";

export interface WidgetItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subcategory?: string;
  platformType: PlatformType;
  provider: string;
  officialUrl: string;
  installationUrl: string;
  installationMethod: string;
  operatingSystems: string[];
  windowsVersions: string[];
  isFree: boolean;
  pricing: string;
  usefulnessScore: number;
  popularityStatus: "Popular" | "Essential" | "Emerging" | "Hidden Gem" | "Standard";
  editorialStatus: "Approved" | "Reviewed" | "Unverified";
  privacyRating: PrivacyRating;
  resourceUsage: ResourceUsage;
  installationDifficulty: InstallationDifficulty;
  reliability: ReliabilityRating;
  bestFor: string;
  userIntents: string[];
  capabilities: string[];
  limitations: string[];
  review: string;
  verdict: string;
  relatedUtilities: string[];
  relatedWidgets: string[];
  relatedCategories: string[];
  source: string;
  sourceType: string;
  lastVerified: string;
  verificationStatus: VerificationStatus;
  keywords: string[];
  faqs?: FaqItem[];
  notes?: string;
}

export interface WidgetCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  userIntents: string[];
  seoTitle: string;
  seoDescription: string;
  whatAreThey: string;
  whyUse: string;
  faqs: FaqItem[];
}
