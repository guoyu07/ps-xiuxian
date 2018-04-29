first = (arr) -> arr.length && arr[0]

debounce = (calback, time) ->
  timer = null
  return () ->
    if timer
      clearTimeout timer
    timer = setTimeout(calback, timer)

sticky = (query) ->
  stickyDom = document.querySelector query
  console.log stickyDom.getBoundingClientRect()
  top = stickyDom.getBoundingClientRect().top

  setTop = () ->
    stickyDom.style.top = document.documentElement.scrollTop

  window.onscroll = debounce(setTop, 369)

# sticky 'menu'
