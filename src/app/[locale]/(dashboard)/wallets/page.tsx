import { WalletsPage } from "@/components/pages/WalletsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <WalletsPage locale={locale} />;
}
