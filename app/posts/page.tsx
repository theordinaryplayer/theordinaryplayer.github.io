import { promises as fs } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
}

async function getAllPosts(): Promise<Post[]> {
  try {
    const postsDir = join(process.cwd(), 'posts');
    const files = await fs.readdir(postsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const posts: Post[] = [];
    
    for (const file of mdFiles) {
      const match = file.match(/page_(\d+)\.md/);
      if (match) {
        const id = match[1];
        const filePath = join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const lines = content.split('\n');
        
        // Extract title
        const titleLine = lines.find(line => line.startsWith('# '));
        const title = titleLine ? titleLine.substring(2).trim() : `Post ${id}`;
        
        // Extract author
        let author = 'The Ordinary Player';
        const authorLine = lines.find(line => line.trim().toLowerCase().startsWith('author:'));
        if (authorLine) {
          author = authorLine.replace(/author:\s*/i, '').trim();
        }
        
        // Extract excerpt
        const contentLines = lines.filter(line => !line.startsWith('# ') && !line.trim().toLowerCase().startsWith('author:'));
        const excerpt = contentLines.slice(0, 3).join(' ').substring(0, 150) + '...';
        
        posts.push({
          id,
          title,
          excerpt,
          date: new Date().toISOString().split('T')[0],
          author,
        });
      }
    }
    
    // Sort by ID (numerically)
    return posts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="pt-12">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 gradient-text">
            Posts
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Insights and writeups from our cybersecurity team
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
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
                    href={`/posts/${post.id}`}
                    className="text-primary hover:text-primary/80 transition-colors font-semibold inline-flex items-center gap-2 group/link"
                  >
                    Read Full Post
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
              <p className="text-muted-foreground text-lg">
                No posts available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}