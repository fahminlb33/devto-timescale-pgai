import dayjs from "dayjs";
import { IconRobot, IconUser } from "@tabler/icons-react";
import { type BoxProps, Box, Flex, Paper, Text } from "@mantine/core";

import classes from "./ChatItem.module.css";

type ChatItemProps = {
	id: string;
	role: "user" | "assistant";
	createdAt: Date;
	content: string;
} & BoxProps;

// source: https://github.com/design-sparx/mantine-analytics-dashboard/blob/master/components/ChatItem/ChatItem.tsx

const ChatItem = (props: ChatItemProps) => {
	const { id, role, createdAt, content, ...others } = props;

	return (
		<Box {...others}>
			<Flex gap="xs">
				{role === "user" ? <IconUser /> : <IconRobot />}
				<Box style={{ maxWidth: "90%" }}>
					<Paper
						p="sm"
						className={
							role === "user" ? classes.isMeChatItem : classes.chatItem
						}
					>
						<Text
							size="sm"
							fw={600}
							tt="capitalize"
							mb={4}
							c={role === "user" ? "white" : "initial"}
						>
							{role === "user" ? "User" : "KawanPaper"}
						</Text>
						<Text size="sm" c={role === "user" ? "white" : "initial"}>
							{content}
						</Text>
					</Paper>
					<Text ta="end" size="sm" mt={4}>
						{dayjs(createdAt).format("hh:mm:ss DD/MM/YYYY")}
					</Text>
				</Box>
			</Flex>
		</Box>
	);
};

export default ChatItem;
