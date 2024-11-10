import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";

import { Links, Meta, Scripts, ScrollRestoration } from "@remix-run/react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { SWRConfig } from "swr";

import { MainLayout } from "./layouts/MainLayout";

// @ts-expect-error
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
				<Meta />
				<Links />
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider>
					<ModalsProvider>
						<SWRConfig value={{ fetcher: fetcher }}>{children}</SWRConfig>
					</ModalsProvider>
				</MantineProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <MainLayout />;
}
