import {
	pgTable,
	pgView,
	text,
	integer,
	varchar,
	jsonb,
	vector,
	timestamp,
	char,
} from "drizzle-orm/pg-core";

export const researchArticleTable = pgTable("research_articles", {
	id: varchar("id", { length: 36 }).primaryKey(),
	title: text("title").notNull(),
	releaseYear: integer("release_year").notNull(),
	authors: text("authors").notNull(),
	publisher: text("publisher").notNull(),
	citation: text("citation").notNull(),
	paperUrl: text("paper_url").notNull(),
	paperPdfUrl: text("paper_pdf_url").notNull(),
	contents: text("contents").notNull(),
	createdAt: timestamp("created_at").notNull(),

	highlights: text("highlights"),
	metadata: jsonb("metadata"),
});

export const chatSessionTable = pgTable("chat_sessions", {
	id: varchar("id", { length: 36 }).primaryKey(),
	paperId: text("paper_id")
		.notNull()
		.references(() => researchArticleTable.id),
	icon: char("icon", { length: 1 }).notNull(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").notNull(),
	modifiedAt: timestamp("modified_at").notNull(),
});

export const chatHistoryTable = pgTable("chat_history", {
	id: varchar("id", { length: 36 }).primaryKey(),
	sessionId: text("session_id")
		.notNull()
		.references(() => chatSessionTable.id),
	role: text("chat_role").notNull(),
	contents: text("contents").notNull(),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").notNull(),
});

export const chatSessionsSummaryView = pgView("chat_sessions_summary", {
	id: varchar("id", { length: 36 }),
	title: text("title").notNull(),
	paperId: varchar("paper_id", { length: 36 }),
	paperTitle: text("paper_title").notNull(),
	totalChats: integer("total_chats").notNull(),
	totalTokens: integer("total_tokens").notNull(),
	createdAt: timestamp("created_at").notNull(),
	modifiedAt: timestamp("modified_at").notNull(),
}).existing();
