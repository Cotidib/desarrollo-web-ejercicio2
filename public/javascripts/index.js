// MAIN

function add(event) {
  let card_list = event.closest('.card-body').querySelector('.card-list');
  let input_value = event.nextElementSibling.value;
  
  let new_item = buildNewItem(input_value);
  let edit_btn = buildEditButton();
  new_item.appendChild(edit_btn);

  let todo_board = event.closest(".board-column").id;

  if (input_value != ''){
    postData(input_value, todo_board);
    card_list.appendChild(new_item);
    event.nextElementSibling.value = "";
  }
}

function edit(eventCurrentTarget){
  // https://www.javascripttutorial.net/dom/manipulating/replace-a-dom-element/
  let iconClasses = eventCurrentTarget.querySelector("i").classList
  if(iconClasses.contains('fa-pen')){
    let item_content = eventCurrentTarget.parentElement.querySelector(".item-content");

    let edit_input = document.createElement('input');
    edit_input.type = "text";
    edit_input.classList.add('col', 'form-control', 'text-muted');

    eventCurrentTarget.parentElement.replaceChild(edit_input,item_content);
    toggleEditIcon(iconClasses);
  } else if (iconClasses.contains('fa-floppy-disk')) {
    let new_text_content = document.createElement('p');
    new_text_content.classList.add('card-text');
    let item_input = eventCurrentTarget.parentElement.querySelector("input");
    let item_input_value = item_input.value;
    new_text_content.textContent = item_input_value;
    new_text_content.classList.add('card-text');
    let new_card = document.createElement('div');
    new_card.classList.add('card', 'col', 'item-content');
    new_card.appendChild(new_text_content);

    let item_id = eventCurrentTarget.closest(".item").id.split("_")[3];
    let todo_board = eventCurrentTarget.closest(".board-column").id;
    putData(item_input_value, todo_board, item_id);

    eventCurrentTarget.parentElement.replaceChild(new_card,item_input);
    toggleEditIcon(iconClasses);
  }
}

// HELPERS - DATA

async function getData(board_id){
  const url_todo = `http://localhost:3000/${board_id}`;
  let response = await fetch(url_todo);
  const posts = await response.json();
  return posts;
}

async function postData(content, board_id){
  const url_todo = `http://localhost:3000/${board_id}`;
  let current_size = await getSize(board_id);
  
  fetch(url_todo, {
  method: "POST",
  body: JSON.stringify({
    id: `${board_id}_${current_size + 1}`,
    title: content
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
  })
    .then((response) => 
      {
        if(response.status == "201"){
          putSize(current_size + 1, board_id);
        }
      }
    );
}

function putData(content, board_id, id){
  const url_todo = `http://localhost:3000/${board_id}/${board_id}_${id}`;
  fetch(url_todo, {
    method: "PUT",
    body: JSON.stringify({
      title: content
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

// HELPERS - SIZE

async function getSize(board_id){
  const url_size = `http://localhost:3000/${board_id}_size`;
  let response = await fetch(url_size);
  const size = await response.json();
  return size.count;
}

function putSize(new_count, board_id){
  const url_size = `http://localhost:3000/${board_id}_size`;
  fetch(url_size, {
  method: "PUT",
  body: JSON.stringify({
    count: new_count
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
})
  .then((response) => response.json())
  .then((json) => console.log(json));
}

// HELPERS - FUNCTIONALITY

function toggleEditIcon(iconClasses){
  if (iconClasses.contains('fa-pen')){
    iconClasses.remove('fa-pen');
    iconClasses.add('fa-floppy-disk');
  } else {
    iconClasses.remove('fa-floppy-disk');
    iconClasses.add('fa-pen');
  }
}

// COMPONENTS

function buildEditButton(){
  let button = document.createElement('button');
  button.classList.add('col-auto', 'edit-btn');
  button.addEventListener('click', (event)=>{edit(event.currentTarget)});
  let icon = document.createElement('i');
  icon.classList.add('edit-icon', 'fa-solid', 'fa-pen');
  button.appendChild(icon);
  return button
}

function buildNewItem(input_value, id){
  let new_item = document.createElement('div');
  new_item.classList.add('item');
  new_item.setAttribute("id", `item_${id}`);
  
  let new_card = document.createElement('div');
  new_card.classList.add('card', 'col', 'item-content');
  
  let text_content = document.createElement('p');
  text_content.classList.add('card-text');
  text_content.textContent = input_value;
  new_card.appendChild(text_content);

  new_item.appendChild(new_card);
  return new_item;
}

// EVENTS

window.addEventListener("load", () => {
  const todos_lists = ['todos_1','todos_2','todos_3'];
  todos_lists.map(async (id) => {
    let first_card = document.querySelector(`#${id}_list`);
    const cards = await getData(id);
    cards.map((card)=>{
      let new_item = buildNewItem(card.title, card.id);
      let edit_btn = buildEditButton();
      new_item.appendChild(edit_btn);
      first_card.appendChild(new_item);
    });
  });
});