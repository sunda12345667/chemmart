import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@/lib/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => BlogPost.filter({ is_published: true }, '-created_date', 50),
    initialData: [],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Resources & Guides</h1>
        <p className="text-muted-foreground mt-1">Industry insights, buying guides, and product knowledge</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <div key={i} className="bg-muted animate-pulse rounded-xl h-64" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug || post.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                {post.cover_image && (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs capitalize">{post.category?.replace(/_/g, ' ')}</Badge>
                    {post.created_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {new Date(post.created_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}