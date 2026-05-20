import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function BlogPostDetail() {
  const { slug } = useParams();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-created_date', 100),
    initialData: [],
  });

  const post = posts.find(p => p.slug === slug || p.id === slug);

  // Increment view count once
  useEffect(() => {
    if (post?.id) {
      base44.entities.BlogPost.update(post.id, { view_count: (post.view_count || 0) + 1 });
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading text-2xl font-bold mb-2">Article Not Found</h2>
        <p className="text-muted-foreground mb-6">This article may have been removed or the link is incorrect.</p>
        <Link to="/blog"><Button>Back to Blog</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Resources
      </Link>

      <article>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="capitalize">{post.category?.replace(/_/g, ' ')}</Badge>
          {post.created_date && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(post.created_date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="font-heading text-2xl md:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed border-l-4 border-primary pl-4">{post.excerpt}</p>
        )}

        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8 aspect-video">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-slate max-w-none text-foreground">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="font-heading text-2xl font-bold mt-8 mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="font-heading text-xl font-bold mt-6 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="font-heading text-lg font-semibold mt-5 mb-2">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 my-4 text-muted-foreground italic">{children}</blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
              ),
            }}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>
      </article>

      <div className="mt-12 pt-8 border-t">
        <h3 className="font-heading font-semibold mb-4">Need to source these materials?</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/products"><Button>Browse Products</Button></Link>
          <Link to="/quote"><Button variant="outline">Request Bulk Quote</Button></Link>
        </div>
      </div>
    </div>
  );
}