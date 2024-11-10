export function elipsisText(s: string, length = 35): string {
	if (s.length > length) {
		return `${s.substring(0, length)}...`;
	}

	return s;
}
