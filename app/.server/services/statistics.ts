import db from "../db";
import {
	researchArticleTable,
	chatSessionTable,
	chatSessionsSummaryView,
} from "../db/schema";

export async function getSummaryStats() {
	return {
		paperCount: await db.$count(researchArticleTable),
		chatSessionsCount: await db.$count(chatSessionTable),
		totalChatsCount: await db.$count(chatSessionsSummaryView),
		totalTokensCount: await db.$count(chatSessionsSummaryView),
	};
}
