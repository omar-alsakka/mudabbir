import { SubscriptionsPage } from "@/components/pages/SubscriptionsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SubscriptionsPage locale={locale} />;
}
