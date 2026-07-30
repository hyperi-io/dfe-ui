import { redirect } from 'next/navigation';

export default async function ServicesPage() {
  return redirect('/services/configurations');
}
