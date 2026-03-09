import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import CookieBanner from "@/components/CookieBanner";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
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
      <body>
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
