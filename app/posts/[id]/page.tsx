import { promises as fs } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import DOMPurify from 'isomorphic-dompurify';
// Import HAST types for the tree transformation
import { Element } from 'hast';
import { cache } from 'react';

interface Post {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
}

const getPost = cache(async (id: string): Promise<Post | null> => {
  try {
    const filePath = join(process.cwd(), 'posts', `page_${id}.md`);
    const content = await fs.readFile(filePath, 'utf8');

    // Extract title and author
    const lines = content.split('\n');
    let title = 'Untitled Post';
    let author = 'The Ordinary Player';
    let contentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        title = lines[i].substring(2).trim();
        if (i + 1 < lines.length && lines[i + 1].startsWith('Author: ')) {
          author = lines[i + 1].substring(8).trim();
          contentStartIndex = i + 2;
        } else {
          contentStartIndex = i + 1;
        }
        break;
      } else if (lines[i].startsWith('Author: ')) {
        author = lines[i].substring(8).trim();
      }
    }

    // Process content to format as HTML using remark/rehype
    const rawContent = lines.slice(contentStartIndex).join('\n');
    const processedContent = await remark()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeHighlight, { 
        detect: true,
        ignoreMissing: true 
      }) // Add syntax highlighting
      .use(() => (tree) => {
        // Add GitHub-like classes to elements
        function addClasses(node: any) {
          if (node.type === 'element') {
            // Add classes based on tag name to match GitHub styling
            switch (node.tagName) {
              case 'pre':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-pre', 'rounded-md', 'bg-muted', 'p-4', 'overflow-x-auto');
                break;
              case 'code':
                if (!node.properties.className) node.properties.className = [];
                if (node.properties.className.includes('hljs')) {
                  // Already highlighted by rehype-highlight, keep those classes
                  node.properties.className.push('markdown-code', 'font-mono', 'text-sm');
                } else {
                  // Inline code
                  node.properties.className.push('markdown-code', 'font-mono', 'text-sm', 'bg-muted', 'px-1.5', 'py-0.5', 'rounded');
                }
                break;
              case 'h1':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-h1', 'text-3xl', 'font-bold', 'mt-6', 'mb-4');
                break;
              case 'h2':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-h2', 'text-2xl', 'font-bold', 'mt-6', 'mb-4');
                break;
              case 'h3':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-h3', 'text-xl', 'font-bold', 'mt-6', 'mb-4');
                break;
              case 'p':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-p', 'my-4', 'leading-relaxed');
                break;
              case 'ul':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-ul', 'my-4', 'ml-6', 'list-disc');
                break;
              case 'ol':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-ol', 'my-4', 'ml-6', 'list-decimal');
                break;
              case 'li':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-li', 'my2');
                break;
              case 'blockquote':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-blockquote', 'my-4', 'border-l-4', 'border-primary', 'pl-4', 'italic', 'text-muted-foreground');
                break;
              case 'a':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-link', 'text-primary', 'hover:underline');
                break;
              case 'strong':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-strong', 'font-bold');
                break;
              case 'em':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-em', 'italic');
                break;
              case 'hr':
                if (!node.properties.className) node.properties.className = [];
                node.properties.className.push('markdown-hr', 'my-6', 'h-px', 'border-0', 'bg-border');
                break;
            }
          }
          
          if (node.children) {
            node.children.forEach(addClasses);
          }
        }
        
        addClasses(tree);
      })
      .use(rehypeStringify)
      .process(rawContent);
    
    // Sanitize the HTML to prevent XSS with specific configuration
    const sanitizedContent = DOMPurify.sanitize(processedContent.toString(), {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame', 'frameset', 'meta', 'style', 'head', 'base', 'link', 'applet', 'xml', 'blink', 'body', 'html', 'form', 'input', 'button'],
    });

    return {
      id,
      title,
      author,
      content: sanitizedContent,
      date: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error(`Error reading post ${id}:`, error);
    return null;
  }
});



export async function generateStaticParams() {
  // Based on the actual available posts
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
  ];
}

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  try {
    const post = await getPost(params.id);
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found',
      };
    }

    return {
      title: post.title,
      description: `A blog post by ${post.author} about cybersecurity`,
    };
  } catch (error) {
    console.error(`Error generating metadata for post ${params.id}:`, error);
    return {
      title: 'Error Loading Post',
      description: 'There was an error loading this post',
    };
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    const post = await getPost(params.id);

    if (!post) {
      notFound();
    }

    return (
      <div className="pt-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12 border-b pb-8">
            <div className="mb-10">
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>By {post.author}</span>
              </div>
              <div>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
            </div>
          </header>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          <div className="mt-12 pt-8 border-t">
            <Link 
              href="/posts" 
              className="text-primary hover:text-primary/80 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <ArrowRight className="rotate-180" size={18} />
              Back to Posts
            </Link>
          </div>
        </article>
      </div>
    );
  } catch (error) {
    console.error(`Error rendering post ${params.id}:`, error);
    notFound();
  }
}