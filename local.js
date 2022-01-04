onload = () => {
  document.querySelector('#button1').addEventListener('click', e => {
    console.log("local js event");
    console.log(window.api.switchPage());
  });
}
