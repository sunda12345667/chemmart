import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LockKeyhole, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function AdminLogin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError('Invalid email or password.'); setLoading(false); return; }
    const { data: profile } = await supabase.from('profiles').select('role,is_disabled').eq('id', data.user.id).single();
    if (!profile || profile.is_disabled || !['staff', 'admin', 'super_admin'].includes(profile.role)) {
      await supabase.auth.signOut(); setError('This account is not authorized for the admin panel.'); setLoading(false); return;
    }
    navigate('/admin/dashboard', { replace: true });
  };
  return <AuthLayout icon={LockKeyhole} title="Admin sign in" subtitle="AMTECH GLOBAL SOLUTION SERVICES">
    {error && <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <form onSubmit={submit} className="space-y-4"><div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
      <div><div className="mb-1 flex justify-between"><Label>Password</Label><Link className="text-xs text-primary" to="/forgot-password">Forgot Password?</Link></div><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <Button className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Login</Button></form>
  </AuthLayout>;
}
