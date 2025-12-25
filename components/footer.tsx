import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-primary/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">
              The Ordinary Player
            </h3>
            <p className="text-muted-foreground">
              Merry Christmas! Dont Forget to Hack.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/members"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Members
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/posts"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  href="/writeups"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Writeups
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ctftime.org/team/409247"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  CTFtime
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/theordinaryplayer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary/20 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 The Ordinary Player CTF Team. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
