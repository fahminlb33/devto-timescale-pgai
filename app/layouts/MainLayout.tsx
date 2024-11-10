import { AppShell, Burger, Group, Image, Skeleton, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "@remix-run/react";

import { Sidebar } from "../components/Sidebar";

export function MainLayout() {
	const [opened, { toggle }] = useDisclosure();

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<Image src="/logo.png" h={30} w={30} alt="Logo" />
					<Title order={3}>KawanPaper</Title>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar>
				<Sidebar />
			</AppShell.Navbar>
			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
