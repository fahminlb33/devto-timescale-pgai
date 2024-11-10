import {
	ActionIcon,
	Group,
	rem,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import { json } from "@remix-run/node";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";

import type { LoaderFunction, MetaFunction } from "@remix-run/node";

import { elipsisText } from "~/services/utils";
import { listSessions } from "~/.server/services/chats";

import type { ChatSession } from "~/.server/services/chats";

export const meta: MetaFunction = () => {
	return [
		{ title: "KawanPaper Console" },
		{ name: "description", content: "Welcome to KawanPaper!" },
	];
};

export const loader: LoaderFunction = async () => {
	const sessions = await listSessions({
		q: "",
		page: 1,
		size: 5,
	});

	return json(sessions.data);
};

export default function Index() {
	const navigate = useNavigate();
	const data = useLoaderData() as ChatSession[] | undefined;
	const [query, setQuery] = useState("");

	function handleSubmit() {
		navigate(`/highlights?q=${query}`);
	}

	function LastSession() {
		if (!data) {
			return <Text>Ask away!</Text>;
		}

		const items = data.map((x) => (
			<UnstyledButton key={x.id} component={Link} to={`/chats/${x.id}`}>
				<span style={{ marginRight: rem(9), fontSize: rem(16) }}>{x.icon}</span>{" "}
				{elipsisText(x.title, 50)}
			</UnstyledButton>
		));

		return (
			<>
				<Text mt="xl">or continue your last sesssion...</Text>
				<Stack gap="xs" align="center">
					{items}
				</Stack>
			</>
		);
	}

	return (
		<Stack align="center" pt="6rem">
			<Stack mb="xl" align="center" gap="xs">
				<Title>Howdy, pal!</Title>
				<Text>Ready to learn something new?</Text>
			</Stack>
			<Group mt="xl">
				<Group gap={0}>
					<TextInput
						w={rem(600)}
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
							<IconSearch
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
								<IconSparkles
									style={{ width: rem(24), height: rem(24) }}
									stroke={1.5}
								/>
							</ActionIcon>
						}
					/>
				</Group>
			</Group>

			<LastSession />
		</Stack>
	);
}
