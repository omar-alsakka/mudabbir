import { SavingsPage } from "@/components/pages/SavingsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SavingsPage locale={locale} />;
}
