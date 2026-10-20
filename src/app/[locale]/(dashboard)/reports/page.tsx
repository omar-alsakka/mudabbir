import { ReportsPage } from "@/components/pages/ReportsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ReportsPage locale={locale} />;
}
