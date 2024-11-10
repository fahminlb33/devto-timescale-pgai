import { count, desc, eq, ilike, sql } from "drizzle-orm";

import db from "../db";
import {
	chatSessionTable,
	researchArticleTable as articlesTable,
} from "../db/schema";

import type { PaginationResponse } from "../types";

export type PaperItem = {
	id: string;
	title: string;
	releaseYear: number;
	authors: string;
	citation: string;
	publisher: string;
	url: string;
	pdfUrl: string;
};

export interface ListOpts {
	q: string;
	page: number;
	size: number;
}

export type ListPapersResponse = PaginationResponse<PaperItem>;
export async function list(props: ListOpts): Promise<ListPapersResponse> {
	const countQuery = await db
		.select({ count: count() })
		.from(articlesTable)
		.where(ilike(articlesTable.title, `%${props.q}%`));

	const filterQuery = await db
		.select({
			id: articlesTable.id,
			title: articlesTable.title,
			releaseYear: articlesTable.releaseYear,
			authors: articlesTable.authors,
			citation: articlesTable.citation,
			publisher: articlesTable.publisher,
			url: articlesTable.paperUrl,
			pdfUrl: articlesTable.paperPdfUrl,
		})
		.from(articlesTable)
		.where(ilike(articlesTable.title, `%${props.q}%`))
		.orderBy(desc(articlesTable.createdAt))
		.limit(props.size)
		.offset(props.size * (props.page - 1));

	return {
		currentPage: props.page,
		totalPage: Math.ceil(countQuery[0].count / props.size),
		count: filterQuery.length,
		totalData: countQuery[0].count,
		data: filterQuery,
	};
}

export type CreateOpts = Omit<PaperItem, "id"> & { contents: string };
export async function create(props: CreateOpts) {
	const id = props.pdfUrl.split("/").slice(-1)[0].replace(".pdf", "");
	const result = await db
		.insert(articlesTable)
		.values({
			id,
			title: props.title,
			releaseYear: props.releaseYear,
			authors: props.authors,
			publisher: props.publisher,
			citation: props.citation,
			paperUrl: props.url,
			paperPdfUrl: props.pdfUrl,
			contents: props.contents,
			createdAt: new Date(),
		})
		.returning();

	return result;
}

export async function get(id: string) {
	const result = await db
		.select({
			id: articlesTable.id,
			title: articlesTable.title,
			releaseYear: articlesTable.releaseYear,
			authors: articlesTable.authors,
			citation: articlesTable.citation,
			publisher: articlesTable.publisher,
			url: articlesTable.paperUrl,
			pdfUrl: articlesTable.paperPdfUrl,
		})
		.from(articlesTable)
		.where(eq(articlesTable.id, id))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const chatsUsingPaper = await db
		.select({ count: count() })
		.from(chatSessionTable)
		.where(eq(chatSessionTable.paperId, id));

	return {
		...result[0],
		sessionCount: chatsUsingPaper[0].count,
	};
}

export async function destroy(id: string) {
	await db.delete(articlesTable).where(eq(articlesTable.id, id));
}

export async function findHighlights(query: string) {
	type FindHighlightsRow = {
		paper_id: string;
		paper_title: string;
		highlights: string;
		distance: number;
	};
	const results = await db.execute<FindHighlightsRow>(
		sql`SELECT * FROM find_highlights(${query})`,
	);
	console.log(results);
	console.log(results.rows);
	return results.rows;
}
