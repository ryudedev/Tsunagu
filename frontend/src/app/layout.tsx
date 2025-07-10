import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/components/ConfigureAmplify";
import ConditionalAuthWrapper from "@/components/ConditionalAuthWrapper"
import { AlertProvider } from "@/contexts/AlertContext";
import { ModalProvider } from "@/contexts/ModalContext";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets:["latin"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* 【クライアント用】Amplify configureを読み込む */}
        <ConfigureAmplify />

        {/* ConditionalAuthWrapperを読み込む */}
        <ConditionalAuthWrapper>
          {/* AlertProviderを読み込む */}
          <AlertProvider>
            <ModalProvider>
              <main>{children}</main>
            </ModalProvider>
          </AlertProvider>
        </ConditionalAuthWrapper>
      </body>
    </html>
  );
}