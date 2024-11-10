import {
	ActionIcon,
	Button,
	Container,
	Flex,
	Group,
	Paper,
	Pill,
	rem,
	Stack,
	Text,
	TextInput,
	Title,
	TypographyStylesProvider,
} from "@mantine/core";
import {
	IconAffiliate,
	IconMessage,
	IconSearch,
	IconSend,
	IconSparkles,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";

import { findHighlights } from "~/.server/services/papers";

export const meta: MetaFunction = () => {
	return [{ title: "Paper highlights - KawanPaper" }];
};

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q");
	if (!q) {
		return null;
	}

	const result = await findHighlights(q);
	return json(result);
};

function ResultSet() {
	const data = useLoaderData() as
		| Awaited<ReturnType<typeof findHighlights>>
		| undefined;

	if (!data || data.length === 0) {
		return (
			<Flex align="center" justify="center">
				<Text fs="italic" size="xl">
					Ask me!
				</Text>
			</Flex>
		);
	}

	const items = data.map((x) => (
		<Paper key={x.paper_id} withBorder p="md">
			<Group justify="space-between">
				<Title order={4}>{x.paper_title}</Title>
				<Group>
					<ActionIcon
						variant="subtle"
						component={Link}
						to={`/papers/${x.paper_id}/chat`}
					>
						<IconMessage />
					</ActionIcon>
					<ActionIcon
						variant="subtle"
						component={Link}
						to={`/papers/${x.paper_id}/graph`}
					>
						<IconAffiliate />
					</ActionIcon>
				</Group>
			</Group>

			<Pill>Distance: {x.distance.toFixed(2)}</Pill>
			<Text mt="xs" style={{ whiteSpace: "pre-line" }}>
				{x.highlights}
			</Text>
		</Paper>
	));

	return <Stack>{items}</Stack>;
}

export default function Index() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");

	function handleSubmit() {
		setSearchParams((p) => {
			p.set("q", query);
			return p;
		});
	}

	return (
		<Container>
			<TextInput
				w={"100%"}
				mt="lg"
				mb="xl"
				size="xl"
				radius="xl"
				placeholder="Ask your papers"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyUp={(e) => {
					e.preventDefault();
					if (e.key === "Enter") {
						handleSubmit();
					}
				}}
				leftSection={
					<IconSparkles
						style={{ width: rem(24), height: rem(24) }}
						stroke={1.5}
					/>
				}
				rightSection={
					<ActionIcon
						variant="gradient"
						size="xl"
						radius="xl"
						onClick={handleSubmit}
					>
						<IconSend
							style={{ width: rem(24), height: rem(24) }}
							stroke={1.5}
						/>
					</ActionIcon>
				}
			/>

			<ResultSet />
		</Container>
	);
}
