import {
	ActionIcon,
	Button,
	Container,
	Group,
	rem,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconAffiliate,
	IconEye,
	IconMessage,
	IconNotebook,
	IconPaperclip,
	IconPdf,
	IconSearch,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";
import { useState } from "react";
import { modals } from "@mantine/modals";
import { DataTable } from "mantine-datatable";
import { json, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";

import { type ListPapersResponse, list } from "~/.server/services/papers";

export const meta: MetaFunction = () => {
	return [{ title: "Paper colletion - KawanPaper" }];
};

const PAGE_SIZES = [10, 15, 25, 50];

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const page = Number(url.searchParams.get("page") || 1);
	const size = Number(url.searchParams.get("size") || 10);

	return json(
		await list({
			q,
			page,
			size,
		}),
	);
};

function Table() {
	const [searchParams, setSearchParams] = useSearchParams();
	const papers = useLoaderData<ListPapersResponse>();
	const page = Number(searchParams.get("page") || 1);
	const size = Number(searchParams.get("size") || 10);

	if (!papers) {
		return <Text>Waiting for data...</Text>;
	}

	function handlePageChange(selectedPage: number) {
		setSearchParams((p) => {
			p.set("page", `${selectedPage}`);
			p.set("size", `${size}`);
			return p;
		});
	}

	function handlePageSizeChange(pageSize: number) {
		setSearchParams((p) => {
			p.set("size", `${pageSize}`);
			return p;
		});
	}

	return (
		<DataTable
			withTableBorder
			mt="lg"
			mih={rem(200)}
			page={page}
			records={papers.data}
			recordsPerPage={size}
			totalRecords={papers.totalData}
			onPageChange={handlePageChange}
			recordsPerPageOptions={PAGE_SIZES}
			onRecordsPerPageChange={handlePageSizeChange}
			columns={[
				{ accessor: "title" },
				{ accessor: "releaseYear" },
				{ accessor: "authors" },
				{ accessor: "publisher" },
				{
					accessor: "actions_ai",
					title: "AI",
					width: rem(80),
					render: ({ id }) => (
						<Group gap={0}>
							<Tooltip label="Chat with this paper">
								<ActionIcon
									variant="subtle"
									color="blue"
									component={Link}
									to={`/papers/${id}/chat`}
								>
									<IconMessage size={18} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label="Build knowledge graph with this paper">
								<ActionIcon
									variant="subtle"
									color="blue"
									component={Link}
									to={`/papers/${id}/graph`}
								>
									<IconAffiliate size={18} />
								</ActionIcon>
							</Tooltip>
						</Group>
					),
				},
				{
					accessor: "actions_this_paper",
					title: "This Paper",
					width: rem(110),
					render: ({ citation, url, pdfUrl }) => (
						<Group gap={0}>
							<Tooltip label="Cite this paper">
								<ActionIcon
									variant="subtle"
									color="blue"
									onClick={() =>
										modals.open({
											title: "Cite this paper",
											children: <Text>{citation}</Text>,
										})
									}
								>
									<IconNotebook size={18} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label="Publisher page">
								<ActionIcon
									variant="subtle"
									color="blue"
									component={Link}
									to={url}
									target="_blank"
									rel="noopener noreferrer"
								>
									<IconPaperclip size={18} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label="Download PDF">
								<ActionIcon
									variant="subtle"
									color="blue"
									component={Link}
									to={pdfUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<IconPdf size={18} />
								</ActionIcon>
							</Tooltip>
						</Group>
					),
				},
				{
					accessor: "actions",
					title: "Actions",
					width: rem(80),
					render: ({ id }) => (
						<Group gap={0}>
							<Tooltip label="Show paper details">
								<ActionIcon
									variant="subtle"
									color="green"
									component={Link}
									to={`/papers/${id}`}
								>
									<IconEye size={18} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label="Delete this paper">
								<ActionIcon
									variant="subtle"
									color="red"
									component={Link}
									to={`/papers/${id}/destroy`}
								>
									<IconTrash size={18} />
								</ActionIcon>
							</Tooltip>
						</Group>
					),
				},
			]}
		/>
	);
}

export default function Index() {
	const [searchParams, setSearchParams] = useSearchParams();
	const q = searchParams.get("q") || "";
	const [query, setQuery] = useState(q);

	function handleSearch() {
		setSearchParams((p) => {
			p.set("q", query);
			p.set("page", "1");
			p.set("size", p.get("size") || "10");
			return p;
		});
	}

	return (
		<Container fluid>
			<Group justify="space-between">
				<Title>Paper collection</Title>
				<Group>
					<TextInput
						radius="xl"
						placeholder="Find paper..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyUp={(e) => {
							e.preventDefault();
							if (e.key === "Enter") {
								handleSearch();
							}
						}}
						rightSection={
							<ActionIcon variant="gradient" radius="xl" onClick={handleSearch}>
								<IconSearch
									style={{ width: rem(18), height: rem(18) }}
									stroke={1.5}
								/>
							</ActionIcon>
						}
					/>
					<Button
						component={Link}
						to={"/papers/upload"}
						leftSection={<IconUpload size={18} />}
					>
						Upload
					</Button>
				</Group>
			</Group>

			<Table />
		</Container>
	);
}
