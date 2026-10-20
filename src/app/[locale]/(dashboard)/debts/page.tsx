import { DebtsPage } from "@/components/pages/DebtsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DebtsPage locale={locale} />;
}
