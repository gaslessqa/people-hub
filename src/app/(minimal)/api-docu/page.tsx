import { RedocViewer } from './redoc-viewer';
import { ApiDocSelector } from './api-doc-selector';
import { AuthInfoPanel } from './auth-info-panel';

interface PageProps {
  searchParams: Promise<{ api?: string }>;
}

export default async function ApiDocuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const apiType = params.api ?? 'nextjs';

  const specUrl =
    apiType === 'supabase'
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      : '/api/openapi';

  return (
    <div className="min-h-screen bg-background">
      <ApiDocSelector currentApi={apiType} />
      <AuthInfoPanel apiType={apiType} />
      <RedocViewer specUrl={specUrl} />
    </div>
  );
}
