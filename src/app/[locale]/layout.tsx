import { ThemeInitializer } from "@/components/layout/ThemeInitializer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir} className="flex min-h-screen flex-col">
      <ThemeInitializer />
      {children}
    </div>
  );
}
