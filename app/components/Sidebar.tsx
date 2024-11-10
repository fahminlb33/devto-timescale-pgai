import useSWR from "swr";
import { Link } from "@remix-run/react";
import { useDebouncedState } from "@mantine/hooks";
import {
	TextInput,
	UnstyledButton,
	Text,
	Group,
	rem,
	Flex,
} from "@mantine/core";
import {
	IconBooks,
	IconSparkles,
	IconSearch,
	IconChartBar,
	IconHome,
} from "@tabler/icons-react";

import { elipsisText } from "~/services/utils";
import type { ListChatSessionsResponse } from "~/.server/services/chats";

import classes from "./Sidebar.module.css";

interface ChatHistoryProps {
	query: string;
}

function ChatHistory({ query }: ChatHistoryProps) {
	const { data, isLoading } = useSWR<ListChatSessionsResponse>(
		`/api/chats?q=${query}&page=1&size=10`,
	);

	if (isLoading) {
		return (
			<Flex justify="center" align="center">
				<Text ta="center">Loading...</Text>
			</Flex>
		);
	}

	if (!data || data.count === 0) {
		return (
			<Flex justify="center" align="center">
				<Text ta="center">No data!</Text>
			</Flex>
		);
	}

	const collectionLinks = data.data.map((collection) => (
		<UnstyledButton
			component={Link}
			to={`/chat/${collection.id}`}
			key={collection.id}
			className={classes.collectionLink}
		>
			<span style={{ marginRight: rem(9), fontSize: rem(16) }}>
				{collection.icon}
			</span>{" "}
			{elipsisText(collection.title)}
		</UnstyledButton>
	));

	return <div className={classes.collections}>{collectionLinks}</div>;
}

const links = [
	{ icon: IconHome, label: "Home", to: "/" },
	{ icon: IconBooks, label: "Papers", to: "/papers" },
	{ icon: IconSparkles, label: "Highlights", to: "/highlights" },
	{ icon: IconChartBar, label: "Statistics", to: "/statistics" },
];

export function Sidebar() {
	const [searchQuery, setSearchQuery] = useDebouncedState("", 200);
	const mainLinks = links.map((link) => (
		<UnstyledButton
			key={link.label}
			className={classes.mainLink}
			component={Link}
			to={link.to}
		>
			<div className={classes.mainLinkInner}>
				<link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
				<span>{link.label}</span>
			</div>
		</UnstyledButton>
	));

	return (
		<nav className={classes.navbar}>
			<div className={classes.section} style={{ marginTop: "0.4rem" }}>
				<div className={classes.mainLinks}>{mainLinks}</div>
			</div>

			<div className={classes.section}>
				<Group className={classes.collectionsHeader} justify="space-between">
					<Text size="xs" fw={500} c="dimmed">
						Your chat sessions
					</Text>
				</Group>
				<TextInput
					m="md"
					size="xs"
					placeholder="Search"
					onChange={(e) => setSearchQuery(e.target.value)}
					leftSection={
						<IconSearch
							style={{ width: rem(12), height: rem(12) }}
							stroke={1.5}
						/>
					}
					styles={{ section: { pointerEvents: "none" } }}
				/>

				<ChatHistory query={searchQuery} />
			</div>
		</nav>
	);
}
