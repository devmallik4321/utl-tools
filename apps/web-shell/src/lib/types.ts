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
