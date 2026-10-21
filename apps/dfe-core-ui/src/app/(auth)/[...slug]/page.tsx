import { notFound } from 'next/navigation';

// Unmatched URLs otherwise render the root 404, which sits outside this
// layout and drops the sidebar. Matching them here keeps the shell and
// shows the 404 in the content column.
export default function UnknownPage() {
  notFound();
}
