import { spawn } from "node:child_process";
import { buffer } from "node:stream/consumers";

import minio, { MINIO_BUCKET_NAME } from "./minio";

export async function pdfExtract(objectName: string): Promise<string> {
	const file = await minio.getObject(MINIO_BUCKET_NAME, objectName);
	const pdfBuffer = await buffer(file);

	return new Promise((resolve, reject) => {
		let textContent = "";
		const child = spawn("pdftotext", ["-nodiag", "-", "-"]);

		child.stdout.on("data", (chunk) => {
			textContent += chunk;
		});
		child.stdout.on("end", () => {
			resolve(textContent);
		});

		child.stdin.write(pdfBuffer, (error) => {
			if (error) {
				reject(error);
			}
		});
		child.stdin.end();
	});
}
