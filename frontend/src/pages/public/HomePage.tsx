import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "./home/Hero";
import { PatientMotivation } from "./home/PatientMotivation";
import { PatientExperience } from "./home/PatientExperience";
import { VoiceTouch } from "./home/VoiceTouch";
import { AiAssistantShowcase } from "./home/AiAssistantShowcase";
import { Multilingual } from "./home/Multilingual";
import { ProductJourney } from "./home/ProductJourney";
import { StoryThread } from "./home/StoryThread";
import { Problem } from "./home/Problem";
import { UnifiedRecord } from "./home/UnifiedRecord";
import { HowItWorks } from "./home/HowItWorks";
import { About } from "./home/About";
import { Understanding } from "./home/Understanding";
import { DocumentIntelligence } from "./home/DocumentIntelligence";
import { DoctorReview } from "./home/DoctorReview";
import { ForWho } from "./home/ForWho";
import { UseCases } from "./home/UseCases";
import { Security } from "./home/Security";
import { Faq } from "./home/Faq";
import { FinalMessage } from "./home/FinalMessage";
import { OrgCta } from "./home/OrgCta";

/**
 * MEDIKIOSK HOMEPAGE — PART B, PHASE 1 + PHASE 2 + PHASE 3
 * Phase 1 (Hero → ProductJourney) is the opening experience. Phase 2
 * continues directly after it: the product story, the cinematic 8-step
 * workflow, AI-understanding and document-intelligence proof, and the
 * doctor trust model. (The former patient-timeline and Health ID closing
 * sections have been removed from the homepage; Health ID now lives only
 * on the Features page.) Phase 3 completes the homepage: who MediKiosk is
 * for, the cinematic organization story, use cases, the "why MediKiosk"
 * grid, conceptual impact statements, security & privacy, the FAQ
 * accordion, the emotional final patient message, and the organization
 * CTA. The shared site Footer is rendered by PublicLayout on every public
 * page, including this one.
 *
 * NAVBAR ANCHOR ORDER: PatientMotivation ("for-patients"), DoctorReview
 * ("for-doctors"), HowItWorks ("how-it-works"), and About ("about") are
 * intentionally positioned in that top-to-bottom order (DoctorReview was
 * moved up from later in the page, and About was split out of
 * ProductJourney into its own component below HowItWorks) so that each
 * Navbar link scrolls straight down to its target in the same order the
 * links appear in the Navbar, with no backward jumps.
 */
export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Arriving at the homepage with no hash (e.g. via the Navbar's "Home"
      // link from another page) should always start at the very top.
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    const id = hash.replace("#", "");
    // Wait a tick for the section to be laid out before scrolling to it.
    const timeout = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(timeout);
  }, [hash]);

  return (
    <div ref={pageRef} className="relative">
      <StoryThread targetRef={pageRef} />
      <Hero />
      <PatientMotivation />
      <DoctorReview />
      <PatientExperience />
      <VoiceTouch />
      <AiAssistantShowcase />
      <Multilingual />
      <ProductJourney />
      <Problem />
      <UnifiedRecord />
      <HowItWorks />
      <About />
      <Understanding />
      <DocumentIntelligence />
      <ForWho />
      <UseCases />
      <Security />
      <Faq />
      <FinalMessage />
      <OrgCta />
    </div>
  );
}
