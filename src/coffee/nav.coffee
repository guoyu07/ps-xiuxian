centerTitle = document.querySelector 'nav .center'

centerTitle.addEventListener 'click', ->
  nav = document.querySelector 'nav'
  nav.classList.toggle('is-active')