import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SnowfallWrapper from "@/components/snowfall-wrapper"

export const metadata: Metadata = {
  title: "TOP - The Ordinary Player",
  icons: {
    icon: "/favicon.ico",
  },
  style: [
    {
      href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Plus+Jakarta+Sans:ital,wght@400;500;600;700;800&display=swap",
      rel: "stylesheet",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground font-sans">
        <SnowfallWrapper>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Analytics />
        </SnowfallWrapper>
      </body>
    </html>
  )
}
