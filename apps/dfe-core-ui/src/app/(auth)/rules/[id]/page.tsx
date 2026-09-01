import { redirect } from 'next/navigation';

export default async function ViewRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return redirect(`/rules?name=${id}`);
}
