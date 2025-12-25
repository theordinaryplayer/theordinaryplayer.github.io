"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/members", label: "Members" },
    { href: "/writeups", label: "Writeups" },
    { href: "/posts", label: "Posts" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://ctf-top.byethost7.com/img/Christmas.png"
              alt="TOP"
              width="110"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/80 backdrop-blur-xl shadow-2xl py-6 space-y-2 z-50 border border-white/10 rounded-2xl mx-4 transform perspective-1000 rotateX-10 transition-all duration-300">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 py-4 px-6 text-lg rounded-xl transform hover:scale-[1.02] hover:shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
