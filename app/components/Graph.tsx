import { useEffect, useRef } from "react";
import { Network } from "vis-network";

export function GraphVisualizer() {
	const containerRef = useRef(null);

	const nodes = [
		{ id: 1, label: "Node 1" },
		{ id: 2, label: "Node 2" },
		{ id: 3, label: "Node 3" },
		{ id: 4, label: "Node 4" },
		{ id: 5, label: "Node 5" },
	];

	const edges = [
		{ from: 1, to: 3 },
		{ from: 1, to: 2 },
		{ from: 2, to: 4 },
		{ from: 2, to: 5 },
		{ from: 3, to: 3 },
	];

	const options = {};

	useEffect(() => {
		containerRef.current &&
			new Network(containerRef.current, { nodes, edges }, options);
	}, []);

	return <div ref={containerRef} />;
}
