import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<div className="min-h-screen bg-background text-foreground">{children}</div>
			</body>
		</html>
	);
}
