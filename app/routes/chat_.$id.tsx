import {
	ActionIcon,
	Button,
	Container,
	Group,
	Loader,
	rem,
	RingProgress,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { IconSend, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import useSWR from "swr";
import { getSession } from "~/.server/services/chats";
import ChatItem from "~/components/ChatItem";

export const meta: MetaFunction = () => {
	return [{ title: "Chat with paper - KawanPaper" }];
};

export const loader: LoaderFunction = async ({ params }) => {
	const sessionId = params.id;
	if (!sessionId) {
		return null;
	}

	const chatDetail = await getSession(sessionId);
	if (!chatDetail) {
		return null;
	}

	return json(chatDetail);
};

type ChatResponse = {
	success: boolean;
	data: Array<{
		id: string;
		role: string;
		content: string;
		createdAt: Date;
	}>;
};

function ChatContainer({
	data,
	isLoading,
}: { data: ChatResponse | undefined; isLoading: boolean }) {
	if (isLoading) {
		return <Loader />;
	}

	if (!data) {
		return <Text>No data.</Text>;
	}

	for (const x of data.data) {
		console.log({ id: x.id, role: x.role, ts: x.createdAt });
	}

	const chats = data.data.map((x) => (
		<ChatItem
			key={x.id}
			id={x.id}
			role={x.role === "user" ? "user" : "assistant"}
			content={x.content}
			createdAt={x.createdAt}
		/>
	));

	return (
		<ScrollArea h="65dvh" my="xl">
			<Stack my="xl">{chats}</Stack>
		</ScrollArea>
	);
}

export default function Index() {
	const params = useParams();
	const chatDetail = useLoaderData() as
		| Awaited<ReturnType<typeof getSession>>
		| undefined;
	const { data, isLoading, mutate } = useSWR<ChatResponse>(
		`/api/chats/${params.id}`,
	);
	const [message, setMessage] = useState("");

	if (!chatDetail) {
		return <Text>The chat session is invalid.</Text>;
	}

	function send() {
		fetch(`/api/chats/${params.id}`, {
			method: "post",
			body: JSON.stringify({
				sessionId: "",
				paperId: "",
				prompt: message,
			}),
		})
			.then((res) => res.json())
			.then(
				(
					body: Array<{
						id: string;
						role: string;
						content: string;
						createdAt: string;
					}>,
				) => {
					if (!data) return;
					const copyData = { ...data };
					copyData.data.push(
						...body.map((x) => ({
							id: x.id,
							role: x.role,
							content: x.content,
							createdAt: new Date(x.createdAt),
						})),
					);

					mutate(copyData);
				},
			);
	}

	return (
		<Container>
			<Group justify="space-between" mt="md">
				<Stack gap="xs">
					<Title order={4}>{chatDetail.chat_sessions.title}</Title>
					<Text>Context: {chatDetail.research_articles.title}</Text>
				</Stack>
				<Group>
					<Button color="red" leftSection={<IconTrash />}>
						Delete session
					</Button>
				</Group>
			</Group>

			<ChatContainer data={data} isLoading={isLoading} />

			<TextInput
				w={"100%"}
				disabled={isLoading}
				size="xl"
				radius="xl"
				placeholder="Ask me"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyUp={(e) => {
					e.preventDefault();
					if (e.key === "Enter") {
						send();
					}
				}}
				rightSection={
					<ActionIcon variant="gradient" size="xl" radius="xl" onClick={send}>
						<IconSend
							style={{ width: rem(24), height: rem(24) }}
							stroke={1.5}
						/>
					</ActionIcon>
				}
			/>
		</Container>
	);
}
