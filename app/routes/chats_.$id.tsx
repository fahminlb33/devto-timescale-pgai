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
import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { IconSend, IconTrash } from "@tabler/icons-react";
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
	viewportRef,
}: {
	data: ChatResponse | undefined;
	isLoading: boolean;
	viewportRef: RefObject<HTMLDivElement>;
}) {
	if (isLoading) {
		return <Loader />;
	}

	if (!data) {
		return <Text>No data.</Text>;
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
		<ScrollArea h="65dvh" my="xl" viewportRef={viewportRef}>
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

	const viewportRef = useRef<HTMLDivElement>(null);
	const [message, setMessage] = useState("");
	const [inputDisabled, setInputDisabled] = useState(false);

	if (!chatDetail) {
		return <Text>The chat session is invalid.</Text>;
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: to update after every message
	useEffect(() => {
		if (viewportRef.current) {
			viewportRef.current.scrollTo({
				top: viewportRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [data]);

	function send() {
		setInputDisabled(true);
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
					setMessage("");
					setInputDisabled(false);
				},
			)
			.catch((e) => {
				console.error(e);
				setInputDisabled(false);
			});
	}

	return (
		<Container>
			<Group justify="space-between" mt="md">
				<Stack gap="xs">
					<Title order={4}>{chatDetail.chat_sessions.title}</Title>
					<Text>
						Context:{" "}
						<Link to={`/papers/${chatDetail.research_articles.id}`}>
							{chatDetail.research_articles.title}
						</Link>
					</Text>
				</Stack>
				<Group>
					<Button color="red" leftSection={<IconTrash />}>
						Delete session
					</Button>
				</Group>
			</Group>

			<ChatContainer
				data={data}
				isLoading={isLoading}
				viewportRef={viewportRef}
			/>

			<TextInput
				w={"100%"}
				disabled={isLoading || inputDisabled}
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
