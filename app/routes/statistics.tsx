import { useLoaderData } from "@remix-run/react";
import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import {
	type Icon,
	IconBooks,
	IconBrandOpenai,
	IconBubble,
	IconMessage,
} from "@tabler/icons-react";
import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";

import { getSummaryStats } from "~/.server/services/statistics";

export const meta: MetaFunction = () => {
	return [
		{ title: "KawanPaper Console" },
		{ name: "description", content: "Welcome to KawanPaper!" },
	];
};

export const loader: LoaderFunction = async () => {
	const stats = await getSummaryStats();
	return json({ ...stats });
};

function StatisticsCard({
	StatIcon,
	title,
	value,
}: { StatIcon: Icon; title: string; value: string }) {
	return (
		<Paper withBorder p="md" radius="md">
			<Group>
				<StatIcon size={48} />
				<div>
					<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
						{title}
					</Text>
					<Text fw={700} size="xl">
						{value}
					</Text>
				</div>
			</Group>
		</Paper>
	);
}

export default function Index() {
	const data = useLoaderData() as
		| Awaited<ReturnType<typeof getSummaryStats>>
		| undefined;

	if (!data) {
		return <Text>Loading..</Text>;
	}

	return (
		<Stack align="center" pt="6rem">
			<Stack mb="xl" align="center" gap="xs">
				<Title>Great work!</Title>
				<Text>Ready to learn something new?</Text>
			</Stack>
			<Group mb="xl">
				<StatisticsCard
					StatIcon={IconBooks}
					title="Papers Collection"
					value={`${data.paperCount}`}
				/>
				<StatisticsCard
					StatIcon={IconMessage}
					title="Chat Sessions"
					value={`${data.chatSessionsCount}`}
				/>
				<StatisticsCard
					StatIcon={IconBubble}
					title="Total Chats"
					value={`${data.totalChatsCount}`}
				/>
				<StatisticsCard
					StatIcon={IconBrandOpenai}
					title="Total Tokens"
					value={`${data.totalTokensCount}`}
				/>
			</Group>
		</Stack>
	);
}
