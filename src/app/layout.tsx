import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp";
import { RevealObserver } from "@/components/reveal-observer";
import { JsonLd } from "@/components/json-ld";
import { SITE, SOCIAL } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  alternates: { canonical: "./" },
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    url: "./",
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  title: {
    default: "Admissions House | Find the right college, with a counsellor by your side",
    template: "%s | Admissions House",
  },
  description:
    "Search colleges after 12th and after graduation, compare fees and placements, track entrance exams and get free one-to-one admission counselling.",
};

export const viewport: Viewport = {
  themeColor: "#0B2B33",
};

const SAME_AS = Object.values(SOCIAL).filter(Boolean);

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EducationalOrganization", "ProfessionalService"],
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: ["Admission House", "AdmissionsHouse", "Admissions House India"],
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE.url}/#logo`,
        url: `${SITE.url}/brand/logo-square.png`,
        contentUrl: `${SITE.url}/brand/logo-square.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE.url}/brand/logo-square.png`,
      ...(SAME_AS.length > 0 && { sameAs: SAME_AS }),
      description:
        "College admission counselling and college search for students after 12th and after graduation in India.",
      telephone: SITE.phoneTel,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "B-1207, Tower 4, NX One",
        addressLocality: "Greater Noida West",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      areaServed: { "@type": "Country", name: "India" },
      knowsLanguage: ["en", "hi"],
      openingHours: "Mo-Su 10:00-20:00",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: SITE.phoneTel,
        email: SITE.email,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      alternateName: "Admission House",
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/colleges?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={ORGANIZATION} />
        <Providers>
          <a
            href="#main"
            className="sr-only z-[60] rounded-full bg-royal px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <RevealObserver />
        </Providers>
      </body>
    </html>
  );
}
