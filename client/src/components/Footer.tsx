import { Link } from "wouter";

export default function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container mx-auto px-4 py-8 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
					<div>
						<h3 className="font-semibold mb-3">AI Tools Directory</h3>
						<p className="text-sm text-muted-foreground">
							Discover the best AI tools for your business needs.
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-3">Explore</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="/" className="text-muted-foreground hover:text-foreground">
									Home
								</Link>
							</li>
							<li>
								<Link href="/categories" className="text-muted-foreground hover:text-foreground">
									Categories
								</Link>
							</li>
							<li>
								<Link href="/about" className="text-muted-foreground hover:text-foreground">
									About
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-3">Legal</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="/privacy" className="text-muted-foreground hover:text-foreground">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="/terms" className="text-muted-foreground hover:text-foreground">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-3">Resources</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="/api/health"
									target="_blank"
									rel="noreferrer"
									className="text-muted-foreground hover:text-foreground"
								>
									API Health
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="border-t pt-6 text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<span>© {new Date().getFullYear()} AI Tools Directory. All rights reserved.</span>
				</div>
			</div>
		</footer>
	);
}


