// https://www.mediawiki.org/wiki/API:REST_API/Reference#PHP_3

const BASE_URL = "https://fr.wikipedia.org";
const SEARCH_URL = (title) =>
	`${BASE_URL}/w/rest.php/v1/search/title?q=${encodeURIComponent(title)}&limit=5&origin=*`;

async function searchWiki(args) {
	let res = [];
	if (args[1] && args[1].toLowerCase() != "inconnu") {
		const url = SEARCH_URL(`${args[1]} (${args[0]})`);
		res = await fetch(url)
			.then((res) => res.json())
			.then((data) => {
				return data?.pages ?? [];
			});

		if (res.length == 0) {
			const url = SEARCH_URL(args[1]);
			res = await fetch(url)
				.then((res) => res.json())
				.then((data) => {
					return data?.pages ?? [];
				});
		}
	}

	if (res.length == 0 && args[0]) {
		const url = SEARCH_URL(args[0]);
		res = await fetch(url)
			.then((res) => res.json())
			.then((data) => {
				return data?.pages ?? [];
			});
	}

	return res;
}
async function getPageWiki(title) {
	const url = `${BASE_URL}/api/rest_v1/page/summary/${encodeURI(title)}?origin=*`;
	return fetch(url)
		.then((res) => res.json())
		.then((data) => {
			return data;
		})
		.catch((e) => {});
}

// https://fr.wikipedia.org/w/rest.php/v1/search/title?q=mouton_doper&limit5
export async function findPage(args) {
	const pages = await searchWiki(args);

	if (pages.length === 0) return;
	let title = pages[0].key;

	return await getPageWiki(title).then((data) => {
		return data ?? {};
	});
}
