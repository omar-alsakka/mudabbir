import { SettingsPage } from "@/components/pages/SettingsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SettingsPage locale={locale} />;
}
