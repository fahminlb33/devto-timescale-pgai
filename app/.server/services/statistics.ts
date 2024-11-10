import { sum } from "drizzle-orm";
import db from "../db";
import {
	researchArticleTable,
	chatSessionTable,
	chatSessionsSummaryView,
} from "../db/schema";

export async function getSummaryStats() {
	const stats = await db
		.select({
			chatsTotal: sum(chatSessionsSummaryView.totalChats),
			tokensTotal: sum(chatSessionsSummaryView.totalTokens),
		})
		.from(chatSessionsSummaryView);

	return {
		paperCount: await db.$count(researchArticleTable),
		chatSessionsCount: await db.$count(chatSessionTable),
		totalChatsCount: stats[0].chatsTotal,
		totalTokensCount: stats[0].tokensTotal,
	};
}
