import { PassThrough } from "node:stream";

import * as Minio from "minio";
import { v4 as uuid } from "uuid";
import {
	type UploadHandler,
	writeAsyncIterableToWritable,
} from "@remix-run/node";

export const MINIO_BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME;

const minioClient = new Minio.Client({
	endPoint: import.meta.env.VITE_MINIO_ENDPOINT || "minio",
	port: Number(import.meta.env.VITE_MINIO_PORT) || 9000,
	accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY,
	secretKey: import.meta.env.VITE_MINIO_SECRET_KEY,
	useSSL: false,
});

export default minioClient;

export const minioUploadHandler: UploadHandler = async ({
	name,
	contentType,
	data,
	filename,
}) => {
	if (name !== "article-pdf") {
		return undefined;
	}

	if (contentType !== "application/pdf") {
		return undefined;
	}

	const id = uuid();
	const savedFilename = `${id}.pdf`;

	const pass = new PassThrough();
	await writeAsyncIterableToWritable(data, pass);
	await minioClient.putObject(
		MINIO_BUCKET_NAME,
		savedFilename,
		pass,
		undefined,
		{
			"Content-Type": contentType,
		},
	);

	return `${import.meta.env.VITE_MINIO_HOST}/${MINIO_BUCKET_NAME}/${savedFilename}`;
};
