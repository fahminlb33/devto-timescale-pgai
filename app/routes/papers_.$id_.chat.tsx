import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { IconSparkles } from "@tabler/icons-react";
import { ClientOnly } from "remix-utils/client-only";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import {
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
import { createSession } from "~/.server/services/chats";

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

export const action: ActionFunction = async ({ params, request }) => {
	if (!params.id) {
		return redirect("/papers?error=Invalid paper ID");
	}

	const form = await request.formData();
	const result = await createSession({
		icon: form.get("icon")?.toString() || "🗒️",
		title: form.get("title")?.toString() || "New chat session",
		paperId: params.id,
	});

	return redirect(`/chats/${result.id}`);
};

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
					<Form method="post">
						<Group>
							<HoverCard>
								<HoverCard.Target>
									<TextInput
										name="icon"
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
							<TextInput name="title" label="Session title" w={rem(500)} />
						</Group>
						<Button mt="xl" leftSection={<IconSparkles />} type="submit">
							Start chatting
						</Button>
					</Form>
				</Container>
			)}
		</ClientOnly>
	);
}
