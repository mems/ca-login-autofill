// ==UserScript==
// @name	Crédit Agricole login autofill
// @namespace	memmie.lenglet.name
// @author	mems <memmie@lenglet.name>
// @homepageURL https://github.com/mems/ca-login-autofill/
// @description	Enable password autofill on Crédit Agricole.
// @match	https://*.credit-agricole.fr/stb/entreeBam*
// @match	https://www.credit-agricole.fr/*/*/acceder-a-mes-comptes.html*
// @license	MIT
// @updateURL   https://openuserjs.org/meta/mems/Cr%C3%A9dit_Agricole_login_autofill.meta.js
// @downloadURL https://openuserjs.org/src/scripts/mems/Cr%C3%A9dit_Agricole_login_autofill.user.js
// @version	1.1.1
// @grant	none
// ==/UserScript==

// Fake password input that let password manager fill it and trigger pad
const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.autocomplete = "current-password";
passwordInput.style = "position: fixed; right: 100%; bottom: 100%; opacity: 0;"

const loginInput = document.getElementById("Login-account");

// 2020 version
if(loginInput){
	const keypad = document.getElementById("clavier_num");
	const loginButton = document.querySelector(".Login-button");
	let dirty = false;
	let clearPasswordButton;

	const clearPasswordClickHandler = ({isTrusted}) => {
		// Not user action
		if(!isTrusted){
			return;
		}

		passwordInput.value = "";
	};
	const update = () => {
		if(keypad.style.display === "none" || !dirty){
			return false;
		}

		dirty = false;

		clearPasswordButton.dispatchEvent(new MouseEvent("click"));
      
		// Create a map from button to index
		const keymap = [...keypad.querySelectorAll(".Login-key div")].reduce((map, div) => map.set(div.textContent.trim(), div.parentElement), new Map());
    
		for(const char of passwordInput.value){
			if(!keymap.has(char)){
				continue;
			}
			keymap.get(char).dispatchEvent(new MouseEvent("click"));
		}

		return true;
	};

	passwordInput.addEventListener("change", event => {
  		dirty = true;

		if(!update()){
			loginButton.dispatchEvent(new MouseEvent("click"));// async load keypad (other rest of inputs are changed synchronously)
		}
	});

	new MutationObserver(mutations => {
		// if keypad is loaded and password is not entered yet
		if(mutations.find(({attributeName}) => attributeName === "style")){
			clearPasswordButton = document.querySelector("#Login-password ~ .add-clear-x");// only exist after keypad been loaded
			clearPasswordButton.addEventListener("click", clearPasswordClickHandler);

			update();
		}
	}).observe(keypad, {
		attributes: true,
		attributeFilter: ["style"],
		// attributeOldValue: true,
	});

	loginInput.after(passwordInput);
}
// pre-2020 version
else{
	// Create a map from button to index
	const keymap = [...document.querySelectorAll("#pave-saisie-code a")].reduce((map, anchor) => {
		const val = anchor.textContent.trim();
		return val !== "" ? map.set(val, anchor.parentElement) : map;
	}, new Map());
	const backspace = [...document.getElementsByTagName("a")].find(anchor => anchor.textContent.trim() == "Corriger");
	const backspaceExec = (function(){with(this){eval(backspace.href)}}).bind(unsafeWindow);// use page context, not sandbow context

	passwordInput.addEventListener("input", function(event){
		// Clear current value
		while(backspace && document.formulaire.CCCRYC2.value.length > 0){
			// backspace.dispatchEvent(new MouseEvent("click"));
			// but because href="javascript:..." is executed async, this cause an infinite loop here
	   		try{
				backspaceExec();
	    	}
	    	catch(error){}
		}

		for(const char of this.value){
			if(!keymap.has(char)){
				continue;
			}
			keymap.get(char).dispatchEvent(new MouseEvent("click"));
		}
	});

	document.querySelector("input[name=CCPTE]").after(passwordInput);

	// Allow to remove the last char
	backspace.addEventListener("click", event => {
		passwordInput.value = passwordInput.value.slice(0, -1);
	});
}
