import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type CategoryRow = {
	category: string;
	count: number;
};

export default function Categories() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data = [], isLoading, isError, error } = useQuery<CategoryRow[]>({
		queryKey: ["/api/categories"],
	});

	let content = null;

	if (isLoading) {
		content = (
			<div className="container mx-auto px-4 py-12 lg:px-8">Loading...</div>
		);
	} else if (isError) {
		content = (
			<div className="container mx-auto px-4 py-12 lg:px-8 text-red-600">
				Failed to load categories.{" "}
				{error instanceof Error ? error.message : String(error)}
			</div>
		);
	} else {
		content = (
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
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
			<main className="flex-1">{content}</main>
			<Footer />
		</div>
	);
}


