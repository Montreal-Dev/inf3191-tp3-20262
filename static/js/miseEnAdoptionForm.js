import { Form } from "./formHandler.js";

const TODAY = new Date();

const VALIDATION_MESSAGES = {
	missing: "Le champ est vide et requis.",
	invalidNumber: "Le champ doit être ≥ 0.",
	invalidDate: `Le champ est invalide. Nous sommes le ${TODAY.toLocaleDateString()}.`,
	invalidLength: (min, max) =>
		`Le champ doit avoir une longueur entre ${min} et ${max}.`,
};

/**
 * Number formating element
 */
const formatNumberElement = (field, event) => {
	const newValue = Number.parseInt(event.target.value);
	if (Number.isInteger(newValue) && newValue >= 0) {
		event.target.value = newValue;
	} else {
		event.target.value = field.getData();
	}
};

/**
 * Missing validation for all fields
 */
const isMissing = (value, isPlural) => {
	if (value == null || value == "") {
		return VALIDATION_MESSAGES.missing;
	}
};

/**
 * Length validation for fields
 */
const isLength = (value, min, max) => {
	console.log(value.length, min, max);
	if (value.length < min || value.length > max) {
		return VALIDATION_MESSAGES.invalidLength(min, max);
	}
};

/**
 * Number validation for fields
 */
const isNumber = (value, isPlural) => {
	const number = Number(value);
	if (number < 0) {
		return VALIDATION_MESSAGES.invalidNumber;
	}
};

/**
 * Email validation for fields
 */
const isEmail = (value) => {};

const doValidators = (value, validators) => {
	console.log(value);
	for (const validator of validators) {
		const res = validator(value);
		if (res) return res;
	}
	return "";
};

const createMiseEnAdoptionForm = () =>
	new Form("mise-en-adoption-form", {
		// === User Information ==
		name: {
			onChange: (field, event) => {},
			onValidate: (field) =>
				doValidators(field.input.value, [
					isMissing,
					(value) => isLength(value, 3, 20),
				]),
		},
	});

const form = createMiseEnAdoptionForm();

form.checkValidity();
