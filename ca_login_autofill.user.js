// ==UserScript==
// @name	Crédit Agricole login autofill
// @namespace	memmie.lenglet.name
// @author	mems <memmie@lenglet.name>
// @homepageURL https://github.com/mems/ca-login-autofill/
// @description	Enable password autofill on Crédit Agricole.
// @include	https://www.*-enligne.credit-agricole.fr/stb/entreeBam
// @include	https://www.credit-agricole.fr/*/*/acceder-a-mes-comptes.html
// @license	MIT
// @updateURL   https://openuserjs.org/meta/mems/Cr%C3%A9dit_Agricole_login_autofill.meta.js
// @downloadURL https://openuserjs.org/src/scripts/mems/Cr%C3%A9dit_Agricole_login_autofill.user.js
// @version	1.0.2
// @grant	none
// ==/UserScript==

// Create a map from button to index
const keymap = [...document.querySelectorAll("#pave-saisie-code a")].reduce((map, anchor) => {
	const val = anchor.textContent.trim();
	return val !== "" ? map.set(val, anchor.parentElement) : map;
}, new Map());
const backspace = [...document.getElementsByTagName("a")].find(anchor => anchor.textContent.trim() == "Corriger");
const backspaceExec = (function(){with(this){eval(backspace.href)}}).bind(unsafeWindow);// use page context, not sandbow context

// Fake password input that let password manager fill it and trigger pad
const input = document.createElement("input");
input.type = "password";
input.autocomplete = "current-password";
input.style = "position: fixed; right: 100%; bottom: 100%; opacity: 0;"
input.addEventListener("input", function(event){
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

const account = document.querySelector("input[name=CCPTE]");
account.parentElement.insertBefore(input, account.nextSibling);

// Allow to remove the last char
backspace.addEventListener("click", event => {
	input.value = input.value.slice(0, -1);
});
