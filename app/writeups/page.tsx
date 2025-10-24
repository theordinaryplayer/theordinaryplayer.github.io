import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";

// Mock data for posts
const allPosts = [
  {
    id: 1,
    title: "JCC 2025",
    excerpt:
      "Deep dive into advanced SQL injection methods and how to exploit them in CTF challenges.",
    content:
      "SQL injection remains one of the most critical vulnerabilities in web applications. In this comprehensive guide, we explore advanced techniques used in modern CTF competitions...",
    date: "2025-01-15",
    author: "3xplo1t3r // TOP",
    category: "CTF Event",
    readTime: 8,
  },
  {
    id: 2,
    title: "WRECK-IT 6.0",
    excerpt:
      "A comprehensive guide to analyzing and reverse engineering ARM architecture binaries.",
    content:
      "ARM architecture is increasingly common in embedded systems and IoT devices. This guide covers the fundamentals of ARM assembly and advanced reverse engineering techniques...",
    date: "2025-01-12",
    author: "3xplo1t3r // TOP",
    category: "CTF Event",
    readTime: 12,
  },
  {
    id: 3,
    title: "QnQSec CTF 2025",
    excerpt:
      "Exploring common RSA vulnerabilities and exploitation techniques used in CTF competitions.",
    content:
      "RSA cryptography is fundamental to modern security, but implementation flaws can lead to critical vulnerabilities. We explore common attack vectors and exploitation methods...",
    date: "2025-01-10",
    author: "3xplo1t3r // TOP",
    category: "CTF Event",
    readTime: 10,
  },
];

const categories = [
  "CTF Event"
];

// Posts per page
const POSTS_PER_PAGE = 4;

export default function PostsPage() {
  // Show only the first 4 posts on the main posts page
  const postsToShow = allPosts.slice(0, POSTS_PER_PAGE);

  return (
    <div className="pt-12">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 gradient-text">
            Writeups
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Detailed walkthroughs and solutions from our CTF competitions
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div>
          {postsToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {postsToShow.map((post) => (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted-foreground text-lg mb-6">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href="https://github.com/theordinaryplayer/writeups"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors font-semibold inline-flex items-center gap-2 group/link"
                  >
                    Read Full Writeup
                    <ArrowRight
                      size={18}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No posts found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
