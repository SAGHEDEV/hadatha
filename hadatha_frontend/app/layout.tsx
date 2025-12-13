import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: "Hadatha",
  description: "Create, discover, and attend events on Sui.",
  openGraph: {
    title: "Event ticketing Platform on Sui",
    description: "Create, discover, and attend events on Sui.",
    url: "https://hadathaio.vercel.app/",
    siteName: "Hadatha",
    images: [
      {
        url: "https://hadathaio.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "YourApp Preview",
      },
    ],
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "My Web3 Event Platform",
  //   description: "Create, discover, and attend events on Sui.",
  //   images: ["https://yourdomain.com/og-image.png"],
  // },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} >
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
