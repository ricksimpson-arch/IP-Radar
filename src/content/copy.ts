/**
 * Authoritative user-facing strings — SPEC.md §24.
 * Single import point per §7.6; a future i18n layer attaches here.
 */
export const copy = {
  site: {
    name: "Market Analytica",
    tagline: "Custom market-research, forecasting, and decision-intelligence platforms.",
  },
  nav: {
    capabilities: "Capabilities",
    work: "Work",
    method: "Method",
    engagements: "Engagements",
    planner: "Planner",
    about: "About",
    security: "Security",
    contact: "Contact",
    apply: "Apply for a Custom Build",
  },
  home: {
    hero: {
      headline: "Turn market data into a decision system.",
      sub: "Market Analytica designs custom platforms that help companies rank opportunities, forecast demand, evaluate risk, and turn scattered research into clear business decisions.",
      primaryCta: "Apply for a Custom Build",
      secondaryCta: "Explore Our Work",
      caseStudyLink: "View LootSignal",
    },
    plannerEntry: {
      question: "What decision are you trying to make?",
      cta: "Draft my system outline",
      placeholder: "e.g. Which of our 40 product lines deserve investment next year",
    },
    finalCta: {
      headline: "Your company has data. We turn it into decisions.",
      sub: "Apply to build a custom market-intelligence system.",
    },
    caseStudyCta: "Build a System Like This",
  },
  apply: {
    stepNames: [
      "You",
      "Company",
      "The problem",
      "Current state",
      "What you want",
      "Scope",
      "Review",
    ],
    successHeadline: "Application received. Here's what happens next.",
    freeEmailError:
      "Use your company email address so we can route your application to the right team.",
    uploadError:
      "That file type isn't accepted. Upload a PDF, spreadsheet, document, or image under 25MB.",
    problemMinError:
      "Give us at least 100 characters — the more specific the problem, the more specific our answer.",
    consentLabel:
      "I agree to the privacy policy and consent to Market Analytica processing this application.",
  },
  admin: {
    emptyState:
      "No applications match these filters. Clear filters or widen the score range.",
  },
  legal: {
    ipDisclaimer:
      "LootSignal is an independent research and analysis system. Franchise and brand names appear as subjects of market analysis. Their inclusion does not imply affiliation with, endorsement by, or licensing rights from any rights holder.",
    ipDisclaimerSnowFlurry:
      "SnowFlurry is an independent research and analysis system. Television series and brand names appear as subjects of market analysis. Their inclusion does not imply affiliation with, endorsement by, or licensing rights from any rights holder.",
  },
  errors: {
    notFoundTitle: "That page doesn't exist.",
    notFoundBody:
      "The address may be mistyped, or the page may have moved. Start from the homepage or open the planner.",
    errorTitle: "Something went wrong on our side.",
    errorBody:
      "The error has been recorded. Reload the page to try again, or contact us if it keeps happening.",
  },
} as const;

export type Copy = typeof copy;
