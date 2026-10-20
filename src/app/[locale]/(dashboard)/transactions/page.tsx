import { TransactionsPage } from "@/components/pages/TransactionsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TransactionsPage locale={locale} />;
}
