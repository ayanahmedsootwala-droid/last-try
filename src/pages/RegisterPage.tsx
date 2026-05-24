import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const { getSetting } = useSiteSettings();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const siteName = getSetting('site_name', 'XYZ Automobiles');
  const logoUrl = getSetting('site_logo_url', '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please agree to the User Agreement and Privacy Policy'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) { toast.error(error.message || 'Registration failed'); return; }
    toast.success('Account created! Welcome!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain max-w-[120px]" />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <span className="font-bold text-base text-foreground">{siteName}</span>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join {siteName}'s premier auto marketplace</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-normal text-muted-foreground mb-1.5 block">Full Name</Label>
              <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="John Doe" className="h-10 text-sm" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-normal text-muted-foreground mb-1.5 block">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="h-10 text-sm" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-normal text-muted-foreground mb-1.5 block">Password</Label>
              <div className="relative">
                <Input id="password" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="h-10 text-sm pr-10" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <span className="underline cursor-pointer text-foreground">User Agreement</span>
                {' '}and{' '}
                <span className="underline cursor-pointer text-foreground">Privacy Policy</span>
              </label>
            </div>
            <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
