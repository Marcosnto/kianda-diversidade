export default function AuthorsLoading() {
	return (
		<main className="mx-auto w-full animate-pulse px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 xl:px-12 2xl:px-32">
			<div className="h-10 w-52 rounded bg-k-olive-light/20" />
			<div className="mt-4 h-5 w-full max-w-xl rounded bg-k-olive-light/15" />
			<div className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-1 lg:grid-cols-2 lg:gap-8 xl:grid-cols-2 xl:gap-8 2xl:grid-cols-4 2xl:gap-8">
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						className="overflow-hidden rounded-lg bg-k-olive-light/20"
						key={index}
					>
						<div className="h-[100px] bg-k-olive-light/25 sm:h-[120px] md:h-[140px] lg:h-[362px] xl:h-[380px] 2xl:h-[300px]" />
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
