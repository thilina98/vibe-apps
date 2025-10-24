export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto max-w-[1760px] px-[15px] py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Links Row */}
          <div className="flex items-center gap-6">
            <a
              href="/terms"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <span className="text-muted-foreground/30">•</span>
            <a
              href="/privacy"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground/30">•</span>
            <a
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
          </div>

          {/* Copyright Row */}
          <p className="text-sm text-muted-foreground/70">
            © 2025 Sansa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
