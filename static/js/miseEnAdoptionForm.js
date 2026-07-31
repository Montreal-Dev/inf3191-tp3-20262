import { Form } from "./formHandler.js";

const VALIDATION_MESSAGES = {
	missing: "Le champ est vide et requis.",
	invalidNumber: "Le champ doit être ≥ 0.",
	invalidEmail: "Le champ doit être une adresse email valide.",
	invalidPostalCode: "Le code postal est invalide.",
	invalidLength: (min, max) =>
		`Le texte doit avoir une longueur entre ${min} et ${max}.`,
	invalidRange: (min, max) =>
		`Le champ doit être compris entre ${min} et ${max}.`,
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
	if (value.length < min || value.length > max) {
		return VALIDATION_MESSAGES.invalidLength(min, max);
	}
};

const isRange = (value, min, max) => {
	const number = Number(value);
	if (number < min || number > max) {
		return VALIDATION_MESSAGES.invalidRange(min, max);
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
const isEmail = (value) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value) ? "" : VALIDATION_MESSAGES.invalidEmail;
};

/**
 * Canadian Postal Code validation for fields
 */
const isCanadianPostalCode = (value) => {
	const postalCodeRegex = /^[a-z]\d[a-z][ ]?\d[a-z]\d$/;
	return postalCodeRegex.test(value)
		? ""
		: VALIDATION_MESSAGES.invalidPostalCode;
};

const doValidators = (value, validators) => {
	for (const validator of validators) {
		const res = validator(value);
		if (res) return res;
	}
	return "";
};

const createMiseEnAdoptionForm = () =>
	new Form("mise-en-adoption-form", {
		// === User Information ==
		nom: {
			onChange: (field, event) => {},
			onValidate: (field) =>
				doValidators(field.input.value, [
					isMissing,
					(value) => isLength(value, 3, 20),
				]),
		},
		espece: {
			onValidate: (field) => doValidators(field.input.value, [isMissing]),
		},
		race: {
			onValidate: (field) => doValidators(field.input.value, [isMissing]),
			onChange: (field, event) => {
				if (event.target.value == "" || event.target.value == null) {
					field.input.value = "Inconnu";
				}
			},
		},
		age: {
			onValidate: (field) =>
				doValidators(field.input.value, [
					isMissing,
					isNumber,
					() => isRange(field.input.value, 0, 30),
				]),
		},
		description: {
			onValidate: (field) => doValidators(field.input.value, [isMissing]),
		},
		courriel: {
			onValidate: (field) =>
				doValidators(field.input.value, [isMissing, isEmail]),
		},
		adresse: {
			onValidate: (field) => doValidators(field.input.value, [isMissing]),
		},
		ville: {
			onValidate: (field) => doValidators(field.input.value, [isMissing]),
		},
		cp: {
			onValidate: (field) =>
				doValidators(field.input.value, [isMissing, isCanadianPostalCode]),
		},
	});

const form = createMiseEnAdoptionForm();

form.checkValidity();
