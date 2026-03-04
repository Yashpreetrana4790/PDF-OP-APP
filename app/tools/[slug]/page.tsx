import { notFound } from 'next/navigation';
import { TOOLS } from '@/lib/tools';
import ToolClient from './ToolClient';

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS.find((t) => t.slug === params.slug);
  if (!tool) notFound();
  return <ToolClient tool={tool} />;
}
