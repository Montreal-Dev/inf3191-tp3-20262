// https://www.mediawiki.org/wiki/API:REST_API/Reference#PHP_3

const BASE_URL = "https://fr.wikipedia.org";
async function searchWiki(title) {
	const url = `${BASE_URL}/w/rest.php/v1/search/title?q=${encodeURIComponent(title)}&limit=5&origin=*`;
	return await fetch(url)
		.then((res) => res.json())
		.then((data) => {
			return data?.pages ?? [];
		});
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
	const pages = await searchWiki(args.join("+"));

	console.log(pages);
	if (pages.length === 0) {
		console.log("No results found.", args.join("_"));
		return;
	}

	const title = pages[0].key;
	const page = await getPageWiki(title);
	console.log(page);
}
