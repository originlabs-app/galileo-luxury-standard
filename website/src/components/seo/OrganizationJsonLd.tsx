import { JsonLd } from "./JsonLd";

const organizationData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://galileoprotocol.io/#organization",
      name: "Galileo Network",
      alternateName: "Galileo Protocol",
      url: "https://galileoprotocol.io",
      logo: "https://galileoprotocol.io/favicon.svg",
      sameAs: ["https://github.com/originlabs-app/galileo-luxury-standard"],
    },
    {
      "@type": "WebSite",
      "@id": "https://galileoprotocol.io/#website",
      name: "Galileo Protocol",
      url: "https://galileoprotocol.io",
      publisher: {
        "@id": "https://galileoprotocol.io/#organization",
      },
    },
  ],
};

export function OrganizationJsonLd() {
  return <JsonLd data={organizationData} />;
}
