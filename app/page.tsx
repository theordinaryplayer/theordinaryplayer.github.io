import Link from "next/link"
import { ArrowRight } from "lucide-react"
import fs from 'fs'
import path from 'path'

// Function to get posts from text files
function getPostsFromFiles() {
  const postsDir = path.join(process.cwd(), 'posts');
  const posts = [];
  
  // Read post files from page_1.txt to page_10.txt
  for (let i = 1; i <= 10; i++) {
    const filePath = path.join(postsDir, `page_${i}.md`);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // Extract title (first line starting with #)
      const titleLine = lines.find(line => line.startsWith('# '));
      const title = titleLine ? titleLine.replace('# ', '').trim() : `Post ${i}`;
      
      // Extract author from the content (first line after title that starts with "Author:")
      let author = "The Ordinary Player"; // Default author
      const authorLine = lines.find(line => line.trim().toLowerCase().startsWith('author:'));
      if (authorLine) {
        author = authorLine.replace(/author:\s*/i, '').trim();
      }
      
      // Extract excerpt (first few lines after title and author-related lines)
      const contentLines = lines.filter(line => !line.startsWith('# ') && !line.trim().toLowerCase().startsWith('author:'));
      const excerpt = contentLines.slice(0, 3).join(' ').substring(0, 150) + '...';
      
      const post = {
        id: i,
        title,
        excerpt,
        date: new Date().toISOString().split('T')[0], // Using current date
        category: "Security",
        author,
      };
      
      posts.push(post);
    }
  }
  
  return posts;
}

// Get first 4 posts
const allPosts = getPostsFromFiles();
const featuredPosts = allPosts.slice(0, 4)

export default function Home() {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-semibold mb-6 mt-30 ">
            From Nusantara to the World, We Capture Every Flag.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Rookie hackers on a mission to learn, fail, and hack smarter. We
            explore the art of cybersecurity with curiosity and teamwork,
            turning mistakes into lessons and lessons into victories, one flag
            at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/posts"
              className="px-8 py-4 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 min-w-[200px]"
            >
              Explore Posts <ArrowRight size={20} />
            </Link>
            <Link
              href="/writeups"
              className="px-8 py-4 border border-primary text-primary rounded-full hover:bg-primary/10 transition-colors font-semibold flex items-center justify-center gap-2 min-w-[200px]"
            >
              View Writeups
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">Latest Posts</h2>
          <p className="text-muted-foreground">
            Insights and writeups from our team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className="text-primary hover:text-primary/80 transition-colors font-semibold flex items-center gap-2"
              >
                Read More <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/posts"
            className="text-primary hover:text-primary/80 transition-colors font-semibold flex items-center gap-2 justify-center"
          >
            View All Posts <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
