import { Form } from "./formHandler.js";
import { findPage } from "./wiki.js";

/**
 * carHistoryValue validation depending on claims counter
 * @param {Field} field
 */
const carHistoryCountValidation = (field, value) => {};

const PET_ARRAY = [];
let RENDER_TIMEOUT = null;

const CARD_TEMPLATE = document.getElementById("pet-card-template");
const CARD_RESULTS = document.getElementById("pet-cards");

function clearCards() {
	CARD_RESULTS.innerHTML = "";
}

function createCard(data) {
	const fragment = CARD_TEMPLATE.content.cloneNode(true);
	const card = fragment.querySelector("[name='pet-card']");
	const nom = fragment.querySelector("[name='pet-card-nom']");
	const description = fragment.querySelector("[name='pet-card-description']");
	const espece = fragment.querySelector("[name='pet-card-espece']");
	const age = fragment.querySelector("[name='pet-card-age']");
	const image = fragment.querySelector("[name='pet-card-image']");
	const button = fragment.querySelector("[name='pet-card-button']");

	if (card != null) {
		card.setAttribute("id", "pet-card-" + data.id);
	}
	if (nom != null) {
		nom.textContent = data.nom;
	}
	if (description != null) {
		description.textContent = data.description;
	}
	if (espece != null) {
		espece.textContent = data.espece;
	}
	if (age != null) {
		age.textContent = data.age;
	}
	if (image != null) {
		findPage([data.espece, data.race]).then((data) => {
			if (data && data.originalimage) {
				image.src = data.originalimage?.source;
			} else {
				image.src = "static/images/not-found.jpg";
			}
		});
	}
	if (button != null) {
		button.setAttribute("data-pet-id", data.id);
	}
	CARD_RESULTS.appendChild(fragment);
	return fragment;
}

const typingFetch = (text) => {
	clearTimeout(RENDER_TIMEOUT);
	RENDER_TIMEOUT = setTimeout(async () => {
		fetch(`/api/v1/animals?q=${encodeURIComponent(text)}`)
			.then((res) => res.json())
			.then((data) => {
				clearCards();
				for (let pet of data) {
					createCard(pet);
				}
			});
	}, 250);
};

const randomFetch = () => {
	clearTimeout(RENDER_TIMEOUT);
	fetch(`/api/v1/animals?limit=5`)
		.then((res) => res.json())
		.then((data) => {
			clearCards();
			for (let pet of data) {
				createCard(pet);
			}
		});
};

const createSearchPetForm = () =>
	new Form("search-pet-form", {
		// === User Information ==
		searchInput: {
			onStart: (field) => {
				// Setup pets
				randomFetch();
			},
			onChange: (field, event) => {
				typingFetch(event.target.value);
			},
		},
	});

createSearchPetForm();
