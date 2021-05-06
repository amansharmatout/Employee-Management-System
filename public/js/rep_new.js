var i = 1;
function add() {
	// Get the element
	var elem = document.getElementsByClassName("ts");
	//Create a copy of it
	var clone = elem[0].cloneNode(true);
	// Update the ID and add a class
	clone.childNodes[1].childNodes[1].innerHTML = `Task ${i + 1}:`;
	clone.childNodes[1].childNodes[3].id = `task${i}`;

	// Inject it into the DOM
  let div = document.createElement("DIV");
	div.classList = "form-border";
	let span = document.createElement("SPAN");
	let link = document.createElement("P");
	link.classList = "dlt btn-sm";
	link.setAttribute("onclick", "remove(" + i + ")");
	link.id = "link" + i;
  link.innerHTML='X';
	span.appendChild(link);
	div.appendChild(span);
	console.log(div, span);
	div.appendChild(clone);
	console.log(div);

	let cont = document.getElementById("add");

	elem = document.getElementsByClassName("ds");
	clone = elem[0].cloneNode(true);

	clone.childNodes[1].childNodes[3].id = `desc${i}`;
	div.appendChild(clone);
	console.log(div);
	cont.appendChild(div);
	i += 1;
}
function remove(index) {
	document
		.getElementById("link" + index)
		.parentNode.parentNode.parentNode.removeChild(
			document.getElementById("link" + index).parentNode.parentNode,
		);
	
}