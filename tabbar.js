onload = () => {
  document.querySelector('#tab1').addEventListener('click', e => {
    window.api.tab1();
  });
  document.querySelector('#tab2').addEventListener('click', e => {
    window.api.tab2();
  });
}
