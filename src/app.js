//@flow

import * as Effector from 'effector';

export default (() => {
  const clickedTimes = Effector.createStore(0);
  const {click} = Effector.createApi(clickedTimes, {
    click: n => n + 1,
  });

  const app = document.getElementById('app');
  const btn = document.createElement('button');
  btn.textContent = 'click';
  btn.addEventListener('click', ev => {
    ev.preventDefault();
    click();
  });
  const header = document.createElement('h1');
  header.textContent = 'Hello!';

  const timesNode = document.createElement('span');

  clickedTimes.watch(n => {
    timesNode.textContent = String(n);
  });

  const clickedTimesNode = document.createElement('span');
  clickedTimesNode.textContent = 'Clicked: ';
  const pNode = document.createElement('p');
  pNode.appendChild(clickedTimesNode);
  pNode.appendChild(timesNode);

  app.appendChild(header);
  app.appendChild(pNode);
  app.appendChild(btn);
})();
