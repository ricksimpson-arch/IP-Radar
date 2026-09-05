import type { MetadataRoute } from "next";
import { capabilities } from "@/lib/data/capabilities";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketanalytica.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/capabilities",
    "/work",
    "/work/lootsignal",
    "/work/snowflurry",
    "/method",
    "/method/standards",
    "/engagements",
    "/planner",
    "/apply",
    "/about",
    "/security",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...capabilities.map((c) => ({
      url: `${siteUrl}/capabilities/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
