export function must(condition: boolean, reason: string) {
	if (!condition) throw Error(reason);
}
