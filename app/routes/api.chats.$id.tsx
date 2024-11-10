import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/server-runtime";

import { generateResponse, getChats } from "~/.server/services/chats";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const sessionId = params.id;
	if (!sessionId) {
		return json({
			success: false,
			message: "session_id is not provided",
		});
	}

	const chats = await getChats(sessionId);
	if (!chats || chats.length === 0) {
		return json({
			success: true,
			data: [],
		});
	}

	return json({
		success: true,
		data: chats,
	});
}

export async function action({ request, params }: ActionFunctionArgs) {
	const sessionId = params.id;
	if (!sessionId) {
		return json({
			success: false,
			message: "session_id is not provided",
		});
	}

	if (request.method !== "POST") {
		return json({
			success: false,
			message: "HTTP method not supported",
		});
	}

	const body = await request.json();
	const result = await generateResponse(sessionId, body.prompt);

	return json(
		result.map((x) => ({
			id: x.id,
			role: x.role,
			content: x.contents,
			createdAt: new Date(x.createdAt),
		})),
	);
}
