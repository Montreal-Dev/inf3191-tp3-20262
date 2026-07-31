class Field {
	constructor(form, key, shape) {
		this.form = form;
		this.shape = shape;
		this.inputAll = Array.from(
			form.element.querySelectorAll(`[name="${key}"]`),
		);
		this.input = this.inputAll[0];
		this.output = form.element.querySelector(`output[for="${key}"]`);
		this.inputAll.forEach((element) => {
			element.addEventListener("input", this.handleUpdate.bind(this));
		});
	}

	// custom validity + output text
	setValidity(message, element) {
		element.setCustomValidity(message);
		if (this.output) {
			this.output.textContent = message;
		}
	}

	checkValidity() {
		return this.inputAll.every((element) => element.checkValidity());
	}

	handleUpdate = (event) => {
		this.input = event.target;
		this.shape.onChange?.(this, event);
		this.form.data.set(this.input.name, this.input.value);
		this.triggerValidate();
		this.triggerValidateAll();
	};

	/**
	 * Trigger a single validation for the current input
	 */
	triggerValidate() {
		const message = this.shape.onValidate?.(this) ?? "";
		this.setValidity(message, this.input);
	}

	/**
	 * Trigger a single validation for all inputs
	 */
	triggerValidateAll() {
		if (!this.shape.onValidateAll) return;

		const message = this.shape.onValidateAll(this) ?? "";
		this.inputAll.forEach((element) => {
			this.setValidity(message, element);
		});
	}

	/**
	 * Trigger the field initialization
	 */
	triggerStart() {
		this.shape.onStart?.(this);
		const initialValue = this.getData();
		if (Array.isArray(initialValue)) {
			// Set all values for the same key
			if (initialValue.length > 0) this.setValue(initialValue);
		} else if (initialValue) {
			this.setValue(initialValue);
		}
	}

	setValue(value) {
		if (this.inputAll.length === 0) return; // No inputs found
		const inputType = this.input.type; // Get the control type
		// Handle different input types
		switch (inputType) {
			case "radio":
				const inputValue = String(value);
				this.inputAll.forEach((element) => {
					// if the input value is the same as the value, set the input to checked
					element.checked = element.value === inputValue;
					if (element.checked) this.input = element;
				});
				break;
			default:
				// number, text, etc — arrays fill multiple inputs (carHistoryValue[])
				if (Array.isArray(value)) {
					this.inputAll.forEach((element, index) => {
						element.value = value[index] ?? "";
					});
					this.input = this.inputAll[0];
				} else {
					this.inputAll[0].value = value;
					this.input = this.inputAll[0];
				}
				break;
		}

		this.input.dispatchEvent(new Event("input", { bubbles: true }));
	}

	/**
	 * Get the field data value
	 * @returns {FormDataEntryValue|null}
	 */
	getData() {
		return this.form.data.get(this.input.name);
	}
}

class FormDataHandler {
	data = null;
	element = null;

	constructor(element) {
		this.element = element;
		this.updateFromUrl();
	}

	/**
	 * Load UrlParams
	 */
	updateFromUrl() {
		const urlParams = new URLSearchParams(window.location.search);
		if (!urlParams) return null;
		this.data = {};
		for (const [key, value] of urlParams.entries()) {
			if (Object.hasOwn(this.data, key)) {
				// Regroup all values for the same key
				this.data[key] = [].concat(this.data[key], value);
			} else {
				this.data[key] = value;
			}
		}
	}

	updateFromForm() {
		if (!this.element) return null;
		this.data = {};
		for (const [key, value] of new FormData(this.element).entries()) {
			if (Object.hasOwn(this.data, key)) {
				// Regroup all values for the same key
				this.data[key] = [].concat(this.data[key], value);
			} else {
				this.data[key] = value;
			}
		}
	}

	get(key) {
		if (key == null) return this.data;
		const value = this.data[key];
		if (key.includes("[]")) {
			// Handle array values
			if (value == null) return [];
			return Array.isArray(value) ? value : [value];
		}
		return value ?? null;
	}

	set(key, value) {
		if (Object.keys(this.data).includes(key)) this.data[key] = value;
	}
}

export class Form {
	constructor(id, shapes = {}) {
		// Initialize fields & fieldsets
		this.element = document.getElementById(id);
		this.fields = {};
		this.fieldsets = Array.from(this.element.querySelectorAll("fieldset"));
		this.data = new FormDataHandler(this.element);
		for (const [key, shape] of Object.entries(shapes)) {
			this.fields[key] = new Field(this, key, shape);
		}
		// Trigger field initialization for all fields
		Object.values(this.fields).forEach((field) => field.triggerStart());
		this.data.updateFromForm();
	}

	checkValidity() {
		return Object.values(this.fields).every((field) => {
			field.triggerValidate();
			field.triggerValidateAll();
			return field.checkValidity();
		});
	}

	// only check inputs in that fieldset step
	checkFieldsetValidity(index) {
		const fieldset = this.fieldsets[index];
		const inputs = Array.from(
			fieldset.querySelectorAll("input, select, textarea"),
		);

		return inputs.every((input) => input.checkValidity());
	}

	submit() {
		this.element.requestSubmit();
	}

	getField(key) {
		return this.fields[key] ?? null;
	}
}
