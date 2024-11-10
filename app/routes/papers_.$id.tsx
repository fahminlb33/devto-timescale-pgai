import {
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/node";
import { IconDownload, IconLink, IconTrash } from "@tabler/icons-react";
import {
	Button,
	Container,
	Grid,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link, useLoaderData } from "@remix-run/react";

import { get } from "~/.server/services/papers";

export const meta: MetaFunction = () => {
	return [{ title: "View paper - KawanPaper" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.id) {
		return null;
	}

	const data = await get(params.id);
	return json(data);
}

export default function Index() {
	const data = useLoaderData<Awaited<ReturnType<typeof get>> | null>();

	if (!data) {
		return <Title>Paper not found!</Title>;
	}

	return (
		<Container fluid p="md">
			<Grid mb="xl">
				<Grid.Col span={10}>
					<Stack gap="xs">
						<Title order={4}>{data.title}</Title>
						<Text>
							{data.releaseYear}. {data.authors}
						</Text>
						<Text>Publisher: {data.publisher}</Text>
						<Text>Citation: {data.citation}</Text>
					</Stack>
				</Grid.Col>

				<Grid.Col span={2}>
					<Stack gap="xs">
						<Button
							component={Link}
							to={data.url}
							variant="outline"
							target="_blank"
							leftSection={<IconLink />}
						>
							Visit Paper Page
						</Button>
						<Button
							component={Link}
							to={data.pdfUrl}
							variant="outline"
							target="_blank"
							leftSection={<IconDownload />}
						>
							Download PDF
						</Button>
						<Button
							component={Link}
							to={`/papers/${data.id}/destroy`}
							variant="outline"
							color="red"
							leftSection={<IconTrash />}
						>
							Delete
						</Button>
					</Stack>
				</Grid.Col>
			</Grid>

			<object
				data={data.pdfUrl}
				style={{ height: "70dvh" }}
				type="application/pdf"
				width="100%"
				height="100%"
				title="Article preview"
			/>
		</Container>
	);
}
