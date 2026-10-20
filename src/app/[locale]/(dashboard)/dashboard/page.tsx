import { DashboardPage } from "@/components/pages/DashboardPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DashboardPage locale={locale} />;
}
