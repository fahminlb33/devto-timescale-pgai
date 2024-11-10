import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { destroy } from "~/.server/services/papers";

export async function loader({ params }: LoaderFunctionArgs) {
	const paperId = params.id;
	if (paperId) {
		await destroy(paperId);
	}

	return redirect("/papers");
}
