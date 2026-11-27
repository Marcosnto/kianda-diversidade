"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, Suspense } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

function GoogleAnalyticsPageViews() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isFirstRender = useRef(true);

	useEffect(() => {
		// O `page_view` inicial já é enviado pelo próprio gtag no carregamento.
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

		const query = searchParams.toString();
		const pagePath = query ? `${pathname}?${query}` : pathname;

		window.gtag("event", "page_view", {
			page_path: pagePath,
			page_location: window.location.href,
			page_title: document.title,
			send_to: GA_MEASUREMENT_ID,
		});
	}, [pathname, searchParams]);

	return null;
}

export function GoogleAnalytics() {
	if (!GA_MEASUREMENT_ID) return null;

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				strategy="afterInteractive"
			/>
			<Script id="ga-init" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${GA_MEASUREMENT_ID}', {
						send_page_view: true
					});
				`}
			</Script>
			<Suspense fallback={null}>
				<GoogleAnalyticsPageViews />
			</Suspense>
		</>
	);
}
