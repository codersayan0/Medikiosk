import { FeaturesHero } from "./features/FeaturesHero";
import { FeaturesIntro } from "./features/FeaturesIntro";
import { FeaturesAiAssistant } from "./features/FeaturesAiAssistant";
import { FeaturesMedicalHistory } from "./features/FeaturesMedicalHistory";
import { FeaturesTimeline } from "./features/FeaturesTimeline";
import { FeaturesDocumentIntel } from "./features/FeaturesDocumentIntel";
import { FeaturesRedFlag } from "./features/FeaturesRedFlag";
import { FeaturesAyush } from "./features/FeaturesAyush";
import { FeaturesDoctorVerification } from "./features/FeaturesDoctorVerification";
import { FeaturesHealthId } from "./features/FeaturesHealthId";
import { FeaturesOverview } from "./features/FeaturesOverview";
import { FeaturesFinalCta } from "./features/FeaturesFinalCta";

/**
 * MEDIKIOSK FEATURES PAGE — PHASE 1B
 * Sections 1-6 (Hero, Intro, AI Health Assistant, Medical History, Medical
 * Timeline, Document Intelligence) are Phase 1A and untouched here.
 * Sections 7-13 (Red Flag Detection, AYUSH Mode, Doctor Verification, Secure
 * Health ID, Feature Overview, Final CTA) complete Phase 1. The Multilingual
 * section has been intentionally removed from this page; the Navbar language
 * selector and i18n system are unaffected. Phase 2 is intentionally not
 * implemented.
 */
export default function FeaturesPage() {
  return (
    <div className="relative overflow-x-clip">
      <FeaturesHero />
      <FeaturesIntro />
      <FeaturesAiAssistant />
      <FeaturesMedicalHistory />
      <FeaturesTimeline />
      <FeaturesDocumentIntel />
      <FeaturesRedFlag />
      <FeaturesAyush />
      <FeaturesDoctorVerification />
      <FeaturesHealthId />
      <FeaturesOverview />
      <FeaturesFinalCta />
    </div>
  );
}