import { v4 as uuid } from "uuid";
import { count, desc, eq, ilike, sql } from "drizzle-orm";

import db from "../db";
import {
	researchArticleTable,
	chatSessionTable,
	chatHistoryTable,
} from "../db/schema";

import type { PaginationResponse } from "../types";

export type ChatSession = {
	id: string;
	icon: string;
	title: string;
	createdAt: Date;
	modifiedAt: Date;
	paper: {
		id: string;
		title: string;
	};
};

export interface ListOpts {
	q: string;
	page: number;
	size: number;
}

export type ListChatSessionsResponse = PaginationResponse<ChatSession>;
export async function listSessions(
	props: ListOpts,
): Promise<ListChatSessionsResponse> {
	const countQuery = await db
		.select({ count: count() })
		.from(chatSessionTable)
		.where(ilike(chatSessionTable.title, `%${props.q}%`));

	const filterQuery = await db
		.select({
			id: chatSessionTable.id,
			icon: chatSessionTable.icon,
			title: chatSessionTable.title,
			createdAt: chatSessionTable.createdAt,
			modifiedAt: chatSessionTable.modifiedAt,
			paperId: researchArticleTable.id,
			paperTitle: researchArticleTable.title,
		})
		.from(chatSessionTable)
		.innerJoin(
			researchArticleTable,
			eq(researchArticleTable.id, chatSessionTable.paperId),
		)
		.where(ilike(chatSessionTable.title, `%${props.q}%`))
		.orderBy(desc(chatSessionTable.modifiedAt))
		.limit(props.size)
		.offset(props.size * (props.page - 1));

	return {
		currentPage: props.page,
		totalPage: Math.ceil(countQuery[0].count / props.size),
		count: filterQuery.length,
		totalData: countQuery[0].count,
		data: filterQuery.map((x) => ({
			id: x.id,
			icon: x.icon,
			title: x.title,
			createdAt: x.createdAt,
			modifiedAt: x.modifiedAt,
			paper: {
				id: x.paperId,
				title: x.paperTitle,
			},
		})),
	};
}

export async function getSession(sessionId: string) {
	const session = await db
		.select()
		.from(chatSessionTable)
		.innerJoin(
			researchArticleTable,
			eq(researchArticleTable.id, chatSessionTable.paperId),
		)
		.where(eq(chatSessionTable.id, sessionId))
		.limit(1);

	if (session.length === 0) {
		return null;
	}

	return session[0];
}

export async function createSession({
	icon,
	title,
	paperId,
}: { icon: string; title: string; paperId: string }) {
	const result = await db
		.insert(chatSessionTable)
		.values({
			id: uuid(),
			icon: icon,
			title: title,
			paperId: paperId,
			createdAt: new Date(),
			modifiedAt: new Date(),
		})
		.returning();

	return result[0];
}

export async function destroySession(sessionId: string) {
	await db.delete(chatSessionTable).where(eq(chatSessionTable.id, sessionId));
}

export async function getChats(sessionId: string) {
	const chats = await db
		.select({
			id: chatHistoryTable.id,
			role: chatHistoryTable.role,
			content: chatHistoryTable.contents,
			createdAt: chatHistoryTable.createdAt,
		})
		.from(chatHistoryTable)
		.where(eq(chatHistoryTable.sessionId, sessionId));

	return chats;
}

export async function generateResponse(sessionId: string, prompt: string) {
	await db.execute(
		sql.raw(`CALL chat_with_paper('${sessionId}', '${prompt}')`),
	);

	const lastRows = await db
		.select()
		.from(chatHistoryTable)
		.orderBy(desc(chatHistoryTable.createdAt))
		.limit(2);

	return lastRows;
}
