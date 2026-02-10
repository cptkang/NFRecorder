import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-digital',
})

export const metadata: Metadata = {
  title: 'Uptime Dashboard',
  description: 'Zero Downtime Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jetbrainsMono.variable} ${orbitron.variable}`}>
        {children}
      </body>
    </html>
  )
}
