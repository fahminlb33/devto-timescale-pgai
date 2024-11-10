import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { destroySession } from "~/.server/services/chats";

export async function loader({ params }: LoaderFunctionArgs) {
	const sessionId = params.id;
	if (sessionId) {
		await destroySession(sessionId);
	}

	return redirect("/");
}
