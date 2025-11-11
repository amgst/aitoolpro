export default function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container mx-auto px-4 py-8 lg:px-8 text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<span>© {new Date().getFullYear()} AI Tools Directory</span>
				<a
					href="/api/health"
					target="_blank"
					rel="noreferrer"
					className="underline hover:text-foreground"
				>
					API health
				</a>
			</div>
		</footer>
	);
}


