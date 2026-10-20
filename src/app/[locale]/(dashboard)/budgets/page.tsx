import { BudgetsPage } from "@/components/pages/BudgetsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BudgetsPage locale={locale} />;
}
