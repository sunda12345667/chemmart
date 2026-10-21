import { supabase } from '@/lib/supabaseClient';

function applySort(query, sort) {
  if (!sort) return query;
  const ascending = !sort.startsWith('-');
  const column = ascending ? sort : sort.slice(1);
  return query.order(column, { ascending });
}

function makeEntity(table) {
  const readTable = table === 'products' ? 'product_catalog' : table;
  return {
    async list(sort, limit) {
      let query = supabase.from(readTable).select('*');
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async filter(match = {}, sort, limit) {
      let query = supabase.from(readTable).select('*');
      for (const [key, value] of Object.entries(match)) {
        query = query.eq(key, value);
      }
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from(readTable).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(record) {
      if (table === 'products') {
        const { error } = await supabase.from(table).insert(record);
        if (error) throw error;
        return null;
      }
      const { data, error } = await supabase.from(table).insert(record).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, record) {
      if (table === 'products') {
        const { error } = await supabase.from(table).update(record).eq('id', id);
        if (error) throw error;
        return null;
      }
      const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const Product = makeEntity('products');
export const Category = makeEntity('categories');
export const Lead = makeEntity('leads');
export const BlogPost = makeEntity('blog_posts');
