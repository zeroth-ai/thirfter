"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-canvas-subtle/50 mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-border bg-canvas-subtle">
                <img
                  src="https://res.cloudinary.com/dqwbkjfuh/image/upload/v1764588498/Screenshot_2025-11-26_at_6.58.01_PM_m1stjx.png"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-fg-on-canvas">blr-thrifter</span>
            </Link>
            <p className="text-sm text-fg-muted leading-relaxed">
              AI-powered discovery of Bangalore's best thrift stores, surplus warehouses & vintage gems.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-fg-on-canvas mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  All Stores
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  For You
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  Smart Search
                </Link>
              </li>
              <li>
                <Link href="/search?mode=image" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  Image Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold text-fg-on-canvas mb-4">Locations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?location=koramangala" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  Koramangala
                </Link>
              </li>
              <li>
                <Link href="/?location=hsr-layout" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  HSR Layout
                </Link>
              </li>
              <li>
                <Link href="/?location=jayanagar" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  Jayanagar
                </Link>
              </li>
              <li>
                <Link href="/?location=commercial" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  Commercial Street
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-fg-on-canvas mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/uttakarsh/blr-thrifter"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-canvas-subtle hover:bg-btn-hover transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-canvas-subtle hover:bg-btn-hover transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-canvas-subtle hover:bg-btn-hover transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-fg-muted">
            © {new Date().getFullYear()} BLR Thrifter. Made with{" "}
            <Heart className="inline h-3 w-3 text-red-400" /> in Bangalore.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-fg-muted hover:text-fg transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-fg-muted hover:text-fg transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

