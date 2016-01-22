// ==UserScript==
// @name		Crédit Agricole login autofill
// @namespace	caloginautofill
// @author		mems
// @description	Enable password autofill on Crédit Agricole.
// @include		https://www.*-enligne.credit-agricole.fr/stb/entreeBam
// @version		1.0.0
// @grant		none
// ==/UserScript==

// Create a map from button to index
var keymap = Array.from(document.querySelectorAll("#pave-saisie-code a")).reduce((map, anchor) => {let val = anchor.textContent.trim(); val !== "" && map.set(val, anchor.parentElement); return map }, new Map())
var backspace = Array.from(document.getElementsByTagName("a")).find(anchor => anchor.textContent.trim() == "Corriger");
var input = document.createElement("input");
input.type = "password";
input.style = "position: fixed; right: 100%; bottom: 100%; opacity: 0;"
input.addEventListener("input", function(event){
	while(backspace && document.formulaire.CCCRYC2.value.length > 0){
		//backspace.dispatchEvent(new MouseEvent("click"));// but since href="javascript:..." is executed async, this cause an infinite loop here
		eval(backspace.href)// it's sync
	}
	for(let char of this.value){
		keymap.has(char) && keymap.get(char).dispatchEvent(new MouseEvent("click"));
	}
})
var account = document.querySelector("input[name=CCPTE]");
account.parentElement.insertBefore(input, account.nextSibling);
