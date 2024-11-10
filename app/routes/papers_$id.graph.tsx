import { Container, Text } from "@mantine/core";
import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export async function loader({ params }: LoaderFunctionArgs) {
	console.log(params);

	return json({});
}

export default function Index() {
	return (
		<Container>
			<Text>Hello</Text>
		</Container>
	);
}
