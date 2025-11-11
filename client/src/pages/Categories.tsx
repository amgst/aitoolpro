import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type CategoryRow = {
	category: string;
	count: number;
};

export default function Categories() {
	const { data = [], isLoading, isError, error } = useQuery<CategoryRow[]>({
		queryKey: ["/api/categories"],
	});

	if (isLoading) {
		return <div className="container mx-auto px-4 py-12 lg:px-8">Loading...</div>;
	}

	if (isError) {
		return (
			<div className="container mx-auto px-4 py-12 lg:px-8 text-red-600">
				Failed to load categories.{" "}
				{error instanceof Error ? error.message : String(error)}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-12 lg:px-8">
				<h1 className="text-2xl font-bold mb-6">All Categories</h1>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{data.map((row) => (
						<Link
							key={row.category}
							href={`/?category=${encodeURIComponent(row.category)}`}
							className="border rounded-md p-4 hover:bg-muted transition-colors flex items-center justify-between"
						>
							<span className="font-medium">{row.category}</span>
							<span className="text-muted-foreground">{row.count}</span>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}


