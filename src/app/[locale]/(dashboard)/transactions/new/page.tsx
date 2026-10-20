import { NewTransactionPage } from "@/components/pages/NewTransactionPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <NewTransactionPage locale={locale} />;
}
