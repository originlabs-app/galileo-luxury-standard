import { redirect } from "next/navigation";

export default async function DeepLinkPage({
  params,
}: {
  params: Promise<{ gtin: string; serial: string }>;
}) {
  const { gtin, serial } = await params;
  // Redirect to home with link param -- reuses all existing resolution + display logic
  redirect(`/?link=${encodeURIComponent(`/01/${gtin}/21/${serial}`)}`);
}
