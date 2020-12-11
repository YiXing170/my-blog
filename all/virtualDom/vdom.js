const vnodeType = {
  HTML: 'HTML',
  TEXT: 'Text',
  COMPONENT: 'COMPONENT',
  CLASS_COMPONENT: 'CLASS_COMPONENT'
}
const childType = {
  EMPTY: 'EMPTY',
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
}

function createElement (tag, data, children) {
  let flag
  if (typeof tag === 'string') {
    flag = vnodeType.HTML
  } else if (typeof tag === 'function') {
    flag = vnodeType.COMPONENT
  } else {
    flag = vnodeType.Text
  }

  let childrenFlag
  if (children == null) {
    childrenFlag = childType.EMPTY
  } else if (Array.isArray(children)) {
    let length = children.length
    if (length === 0) {
      childrenFlag = childType.EMPTY
    } else {
      childrenFlag = childType.MULTIPLE
    }
  } else {
    // 其他情况看做文本
    childrenFlag = childType.SINGLE
    children = createTextNode(children + '')
  }
  return {
    flag,
    tag,
    data,
    children,
    childrenFlag,
    el: null
  }
}

function render (vnode, container) {
  console.log(vnode, container)
  // 区分首次渲染还是再次渲染
  mount(vnode, container)
}

function mount (vnode, container) {
  let { flag } = vnode
  console.log(flag)
  if (flag == vnodeType.HTML) {
    mountElement(vnode, container)
  } else if (flag == vnodeType.TEXT) {
    mountText(vnode, container)
  }
}
function mountElement (vnode, container) {
  let dom = document.createElement(vnode.tag)
  vnode.el = dom

  // let data = vnode.data
  let { data, children, childrenFlag } = vnode
  console.log(childrenFlag)
  if (childrenFlag !== childType.EMPTY) {
    if (childrenFlag == childType.SINGLE) {
      mount(children, dom)
    } else if (childrenFlag == childType.MULTIPLE) {
      for (let i = 0; i < children.length; i++) {
        mount(children[i], dom)
      }
    }
  }

  container.appendChild(dom)
}
function mountText (vnode, container) {
  let dom = document.createTextNode(vnode.children)
  vnode.el = dom
  container.appendChild(dom)
}


function createTextNode (text) {
  return {
    flag: vnodeType.TEXT,
    tag: null,
    data: null,
    children: text,
    childrenFlag: childType.EMPTY
  }
}