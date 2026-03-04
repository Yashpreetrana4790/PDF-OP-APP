import { notFound } from 'next/navigation';
import { TOOLS } from '@/lib/tools';
import ToolClient from './ToolClient';

export const dynamic = 'force-dynamic';

type Params = { slug: string } | Promise<{ slug: string }>;

export default async function ToolPage({ params }: { params: Params }) {
  const resolved = await params;
  const slug = resolved.slug;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();
  return <ToolClient tool={tool} />;
}
