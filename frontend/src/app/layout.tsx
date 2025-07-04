import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/components/ConfigureAmplify";
import ConditionalAuthWrapper from "@/components/ConditionalAuthWrapper"

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
        <ConfigureAmplify />
        <ConditionalAuthWrapper>
          <main>{children}</main>
        </ConditionalAuthWrapper>
      </body>
    </html>
  );
}