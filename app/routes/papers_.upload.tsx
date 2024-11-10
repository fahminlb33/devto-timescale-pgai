import {
	Button,
	Container,
	NumberInput,
	rem,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import {
	redirect,
	unstable_composeUploadHandlers,
	unstable_createMemoryUploadHandler,
	unstable_parseMultipartFormData,
} from "@remix-run/node";

import type { ActionFunction, MetaFunction } from "@remix-run/node";

import { create } from "~/.server/services/papers";
import { pdfExtract } from "~/.server/utils/processor";
import { minioUploadHandler } from "~/.server/utils/minio";

export const meta: MetaFunction = () => {
	return [{ title: "Upload new paper - KawanPaper" }];
};

export const action: ActionFunction = async ({ request }) => {
	const formData = await unstable_parseMultipartFormData(
		request,
		unstable_composeUploadHandlers(
			minioUploadHandler,
			unstable_createMemoryUploadHandler(),
		),
	);

	const pdfUrl = formData.get("article-pdf");
	if (!pdfUrl) {
		return redirect("/papers?error=An error occurred when uploading PDF");
	}

	console.log("FORMDATA", formData);

	const pdfFileName = pdfUrl.toString().split("/").slice(-1).pop();
	// biome-ignore lint/style/noNonNullAssertion: will not return null
	const pdfContent = await pdfExtract(pdfFileName!);
	await create({
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		title: formData.get("title")?.toString()!,
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		releaseYear: Number(formData.get("release-year")?.toString()!),
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		authors: formData.get("authors")?.toString()!,
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		publisher: formData.get("publisher")?.toString()!,
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		citation: formData.get("citation")?.toString()!,
		// biome-ignore lint/style/noNonNullAssertion: will not return null
		url: formData.get("url")?.toString()!,
		pdfUrl: pdfUrl.toString(),
		contents: pdfContent,
	});

	return redirect("/papers");
};

export default function Index() {
	return (
		<Container maw={rem(400)}>
			<Title mb="lg">Upload research article</Title>
			<form method="post" encType="multipart/form-data">
				<TextInput required name="title" label="Title" />
				<NumberInput
					required
					hideControls
					name="release-year"
					label="Release year"
					maw={150}
				/>
				<TextInput required name="authors" label="Authors" />
				<TextInput required name="publisher" label="Publisher" />
				<TextInput required name="citation" label="Citation" />
				<TextInput required name="url" label="Paper URL" />

				<Text mt="lg">Select article PDF file:</Text>
				<input
					required
					type="file"
					name="article-pdf"
					style={{ marginBottom: "1rem" }}
				/>

				<Button
					fullWidth
					mt="lg"
					type="submit"
					leftSection={<IconUpload size={18} />}
				>
					Upload
				</Button>
			</form>
		</Container>
	);
}
