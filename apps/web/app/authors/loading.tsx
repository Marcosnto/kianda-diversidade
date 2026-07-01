export default function AuthorsLoading() {
	return (
		<main className="mx-auto w-full max-w-7xl animate-pulse px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
			<div className="h-10 w-52 rounded bg-k-olive-light/20" />
			<div className="mt-4 h-5 w-full max-w-xl rounded bg-k-olive-light/15" />
			<div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						className="overflow-hidden rounded-lg bg-k-olive-light/20"
						key={index}
					>
						<div className="aspect-[4/3] bg-k-olive-light/25" />
						<div className="space-y-3 p-5">
							<div className="h-6 w-2/3 rounded bg-k-olive-light/30" />
							<div className="h-4 w-full rounded bg-k-olive-light/20" />
							<div className="h-4 w-3/4 rounded bg-k-olive-light/20" />
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
