import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Infinite Tic Tac Toe',
  description: 'We need to go deeper',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
