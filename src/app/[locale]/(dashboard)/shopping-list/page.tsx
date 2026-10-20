import { ShoppingListPage } from "@/components/pages/ShoppingListPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ShoppingListPage locale={locale} />;
}
