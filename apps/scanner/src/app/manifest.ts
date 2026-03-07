import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Galileo Scanner",
    short_name: "Scanner",
    description: "Mobile-first Galileo product verification scanner.",
    start_url: "/",
    display: "standalone",
    background_color: "#020204",
    theme_color: "#020204",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
