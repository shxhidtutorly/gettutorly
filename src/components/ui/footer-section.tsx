"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"
import { SiTiktok } from "react-icons/si"

function FooterSection() {
  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <p className="text-sm">support@gettutorly.com</p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="transition-colors hover:text-primary"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="https://gettutorly.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          {/* Follow Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                asChild
              >
                <a
                  href="https://www.tiktok.com/@_mary_manuel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <SiTiktok className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                asChild
              >
                <a
                  href="https://www.instagram.com/gettutorly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-muted-foreground">
          © 2025 GetTutorly. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }
