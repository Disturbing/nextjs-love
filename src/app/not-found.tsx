import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
				<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					The route you asked for does not exist in this app.
				</p>
				<Link
					href="/"
					className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				>
					Go home
				</Link>
			</div>
		</div>
	);
}
