import EmojiPicker from "emoji-picker-react";
import { ClientOnly } from "remix-utils/client-only";
import { useLoaderData } from "@remix-run/react";
import {
	ActionIcon,
	Box,
	Button,
	Container,
	Group,
	HoverCard,
	rem,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import {
	type ActionFunction,
	type LoaderFunction,
	type MetaFunction,
	json,
} from "@remix-run/node";

import { get } from "~/.server/services/papers";
import { useState } from "react";
import { IconSparkles } from "@tabler/icons-react";

export const meta: MetaFunction = () => {
	return [{ title: "View paper - KawanPaper" }];
};

export const loader: LoaderFunction = async ({ params }) => {
	if (!params.id) {
		return null;
	}

	const data = await get(params.id);
	return json(data);
};

export const action: ActionFunction = async ({ params }) => {};

export default function Index() {
	const data = useLoaderData() as Awaited<ReturnType<typeof get>> | undefined;
	const [icon, setIcon] = useState("");

	if (!data) {
		return <Text>Paper not found!</Text>;
	}

	return (
		<ClientOnly>
			{() => (
				<Container>
					<Title order={3} mt="xl">
						Start new session
					</Title>
					<Stack gap={0} my="lg">
						<Title order={4}>{data.title}</Title>
						<Text>
							{data.releaseYear}. {data.authors}
						</Text>
					</Stack>
					<Group>
						<HoverCard>
							<HoverCard.Target>
								<TextInput
									label="Icon"
									w={rem(50)}
									value={icon}
									onChange={(e) => setIcon(e.currentTarget.value)}
								/>
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<EmojiPicker onEmojiClick={(e) => setIcon(e.emoji)} />
							</HoverCard.Dropdown>
						</HoverCard>
						<TextInput label="Session title" w={rem(500)} />
					</Group>
					<Button mt="xl" leftSection={<IconSparkles />}>
						Start chatting
					</Button>
				</Container>
			)}
		</ClientOnly>
	);
}
