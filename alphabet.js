// let alphabet = TraverseElements(document.body);
let alphabet = null;
let adjusted = new Map();

function isIncreasingAlphabet(str) {
	let c = 'A' - 1;
	let increasingOrderAlphabetSequence = 0;
	for (let i = 0; i < str.length; i++) {
		while (i < str.length && (str[i] < 'A' || str[i] > 'Z')) {
			i++;
		}
		if (i == str.length) {
			return false;
		}
		if (str[i] <= c) {
			return false;
		}
		c = str[i];
		while (i < str.length && str[i] == c) {
			increasingOrderAlphabetSequence++;
			i++;
			c = String.fromCharCode(c.charCodeAt(0)+1)
		}
	}
	if (increasingOrderAlphabetSequence >= 12) {
		return true;
	}
	return false;
}

function likelyAnAlphabet(str) {
    let min_ed = 26;
    for (let i = 0; i < str.length - 18; i++) {
        if (isIncreasingAlphabet(str.substr(i, 26))) {
			return true;
		}
    }
    return false;
}

function cleanText(str) {
    return str.replaceAll("\n", "").replaceAll("\t", "").replaceAll(" ", "");
}

function TraverseElements(element) {
	if (element.checkVisibility == undefined || !element.checkVisibility()) {
		return null;
	}
	
	let textContent = cleanText(element.textContent);
	if (textContent.length < 18) {
		return null;
	}
	let hasAlphabet = false;
	if (textContent.length < 1500) {
		hasAlphabet = likelyAnAlphabet(textContent);
		if (!hasAlphabet) {
			return null;
		}
	}
	
    if (element.childNodes !== null) {
        for (let i of element.childNodes) {
            if (i.textContent.length < 18) {
                continue;
            }
            let ret = TraverseElements(i);
            if (ret !== null) {
                return ret;
            }
        }
    }
   
    if (element.getBoundingClientRect === null || element.getBoundingClientRect === undefined) {
        return null;
    }
    let boundingBox = element.getBoundingClientRect();
    if (boundingBox.width * 10 > boundingBox.height) {
        return null;
    }
	
	if (hasAlphabet) {
		return element;
	}

    return null;
}

function CalculateNumOfLettersToRemove(element) {
    let top_shift = 0;
    let char_height = 0;
    let inner_alphabet_text = "";
    let visible_height = Math.min(window.innerHeight - element.getBoundingClientRect().y, element.scrollHeight);
    let total_letters = 0;
    if (visible_height < element.scrollHeight) {
        let delta_length = element.scrollHeight - visible_height;
		let total_content_height = 0;
        let count = 0;
        let extra = 0;

        for (const child of element.childNodes) {
            let c = child.textContent;
           
            c = c.replaceAll("\n", "").replaceAll("\t", "").replaceAll("\s", "");
            if ((c[0] >= 'A' && c[0] <= 'Z') || (c[0] >= 'a' && c[0] <= 'z')) {
                if (total_letters == 0) {
                    char_height = child.clientHeight;
                    count = Math.ceil(delta_length / char_height);
                }
                total_letters++;
                inner_alphabet_text += c;
            } else {
                extra++;
            }
			total_content_height += child.clientHeight;
        }
		
		if (total_content_height > element.scrollHeight) {
			delta_length = total_content_height - visible_height;
			count = Math.ceil(delta_length / char_height);
		}
		
        count += extra;
       
        if (total_letters < 5 + count) {
            top_shift = char_height * (5 + count - total_letters);
            count = total_letters - 5;
        }
        return [count, total_letters, inner_alphabet_text];
    }
    return [0, total_letters, inner_alphabet_text];
}

function RemoveLetters(inner_text, total_letters, to_remove) {
  let to_keep = "";
  let idx = [];
  if (to_remove + 2 >= total_letters) {
    return inner_text[0] + inner_text[inner_text.length-1];
  }
  if (to_remove === 0) {
    return inner_text;
  }
  for (let i = 0; i < total_letters; i++) {
    idx.push(i);
  }

  let i = 1;
  while (to_remove > 0) {
   
    if (i >= idx.length - 1) {
      i = 1;
    }
    while (i < idx.length - 1 && idx[i] === -1) {
      i++;
    }
   
    if (i < idx.length - 1) {
      if (i > 0 && idx[i - 1] !== -1) {
       
        idx[i] = -1;
        i++;
        while (idx[i] === -1) {
		  idx.splice(i, 1);
          to_remove--;
        }
      } else {
       
		  idx.splice(i, 1);
        to_remove--;
        while (idx[i] == -1) {
		  idx.splice(i, 1);
          to_remove--;
        }
        i++;
      }
    }
  }

  for (let j = 0; j < idx.length; j++) {
    if (idx[j] != -1) {
      to_keep += inner_text[idx[j]];
    }
  }
  return to_keep;
}

function AdjustAlphabet(to_keep, element) {
	let next = null;
	let prev_moved = false;
	for (let child = element.childNodes[0]; child; child = next) {
        next = child.nextSibling;
        let c = child.textContent.replaceAll("\n", "").replaceAll("\t", "").replaceAll("\s", "");
        if ((c[0] >= 'A' && c[0] <= 'Z') || (c[0] >= 'a' && c[0] <= 'z')) {
          if (!to_keep.includes(c)) {
            if (!prev_moved) {
				child.innerText = ".";
            } else {
              element.removeChild(child);
            }
            prev_moved = true;
          } else {
            prev_moved = false;
          }
        }
    }
}

const targetNode = document;

// Options for the observer (which mutations to observe)
const config = {
    attributes: true,
    childList: true,
    subtree: true
};

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
	  console.log("alphabet navi");
	  console.log("mutatio list size: " + mutationList.length);
	  for (const mutation of mutationList) {
        if (alphabet === null) {
			alphabet = TraverseElements(mutation.target);
		}
		if (alphabet !== null && adjusted.get(alphabet)) {
			console.log("complete");
			return;
		}
		if (alphabet != undefined && alphabet !== null) {
			console.log(alphabet);
			let num = CalculateNumOfLettersToRemove(alphabet);
			if (num[0] > 0) {
				let to_keep = RemoveLetters(num[2], num[1], num[0]);
				AdjustAlphabet(to_keep, alphabet);
				adjusted.set(alphabet, true);
			}
			console.log("complete");
			return;
		}
	  }
	  console.log("complete");
};

const button_callback = (mutationList, observer) => {
	  console.log("mutation");
	  console.log(mutationList);
	  if (document.getElementById("arkweb_alphabet_button") == null || document.getElementById("arkweb_alphabet_button") == undefined) {
		let button = document.createElement("button");
		button.innerHTML="<button id=\"arkweb_alphabet_button\" style=\"position:fixed;z-index:99999;top:20%;right:50%;width:10vh;height:10vh;background-color:green;border-radius:10px;filter:drop-shadow(2px 4px 6px black)\" onclick=\"UpdateAlphabet()\">abc</button>";
		document.body.appendChild(button);
	  } else {
		  console.log("button is already created");
	  }
};

function UpdateAlphabet() {
	if (alphabet === null) {
		alphabet = TraverseElements(document.body);
	}
	if (alphabet === null) {
		return;
	}
	let num = CalculateNumOfLettersToRemove(alphabet);
	if (num[0] > 0) {
		let to_keep = RemoveLetters(num[2], num[1], num[0]);
		AdjustAlphabet(to_keep, alphabet);
		adjusted.set(alphabet, true);
	}
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
const button_observer = new MutationObserver(button_callback);

// Start observing the target node for configured mutations
//document.addEventListener("DOMContentLoaded", (event) => {
console.log("DOM fully loaded and parsed");
alphabet = TraverseElements(document.body);
// observer.observe(targetNode, config);
button_observer.observe(targetNode, config);
if (alphabet !== null) {
	UpdateAlphabet();
}
//});
