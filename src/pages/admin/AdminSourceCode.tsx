import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode2, Github, ExternalLink, TerminalSquare, Cloud } from 'lucide-react';

const repoUrl = 'https://github.com/ayanahmedsootwala-droid/last-try';

export default function AdminSourceCode() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileCode2 className="w-5 h-5" />
            Source Code
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Project repo, local development, and deployment notes for this admin panel.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Github className="w-4 h-4" />
                Repository
              </CardTitle>
              <CardDescription>Connected GitHub destination for this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">last-try</Badge>
              <p className="text-sm break-all">{repoUrl}</p>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Repository
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TerminalSquare className="w-4 h-4" />
                Local Run
              </CardTitle>
              <CardDescription>Commands used for development and verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <code className="block rounded bg-muted px-3 py-2">npm install</code>
              <code className="block rounded bg-muted px-3 py-2">npm run dev</code>
              <code className="block rounded bg-muted px-3 py-2">npm run build</code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Cloudflare Pages
              </CardTitle>
              <CardDescription>Ready for static deployment with SPA routing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Build command: <span className="text-foreground font-medium">npm run build</span></p>
              <p>Output directory: <span className="text-foreground font-medium">dist</span></p>
              <p>Supabase public URL and anon key are read from Vite env variables.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
