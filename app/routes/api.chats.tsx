import { json, type LoaderFunctionArgs } from "@remix-run/server-runtime";

import { listSessions } from "~/.server/services/chats";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const page = Number(url.searchParams.get("page") || 1);
	const size = Number(url.searchParams.get("size") || 10);

	const sessions = await listSessions({
		q,
		page,
		size,
	});

	return json(sessions);
}
