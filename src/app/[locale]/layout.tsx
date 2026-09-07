import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import CookieBanner from "@/components/CookieBanner";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://welab.com";
  const normalizedUrl = configuredUrl.includes("localhost") ? "https://welab.com" : configuredUrl;

  return new URL(normalizedUrl);
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Premium Lab & Industrial Analytics",
  description: "Endüstriyel laboratuvar makinesi ve analiz cihazları uzmanı.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            <CookieBanner />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
