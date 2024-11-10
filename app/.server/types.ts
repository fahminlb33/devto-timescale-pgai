export type PaginationResponse<T> = {
	currentPage: number;
	totalPage: number;
	count: number;
	totalData: number;
	data: T[];
};
