const FRAGMENT_TYPE = Symbol.for("fragment");

function createElement(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity),
  };
}

// 为 dom 添加熟悉和事件
function setAttributes(dom, vdom) {
  Object.entries(vdom.props || {}).forEach(([key, value]) => {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      dom.__handlers = dom.__handlers || {};
      if (dom.__handlers[eventType]) {
        dom.removeEventListener(eventType, dom.__handlers[eventType]);
      }
      dom.__handlers[eventType] = value;
      dom.addEventListener(eventType, dom.__handlers[eventType]);
    } else if (key === "key") {
      dom.__key = value;
    } else {
      if (dom.setAttributes) {
        dom.setAttributes(key, value);
      } else {
        dom[key] = value;
      }
    }
  });
}

// 渲染新 dom
function renderDom(vdom, parent) {
  const mount = parent ? (dom) => parent.appendChild(dom) : (dom) => dom;
  if (
    typeof vdom !== "object" &&
    (typeof vdom === "string" || typeof vdom === "number")
  ) {
    // 文本数字处理
    return mount(document.createTextNode(vdom));
  } else if (typeof vdom.type === "string") {
    // 普通处理
    const dom = document.createElement(vdom.type);
    setAttributes(dom, vdom);
    vdom.children && vdom.children.forEach((vdom) => renderDom(vdom, dom));
    return mount(dom);
  } else if (Component.isPrototypeOf(vdom.type)) {
    // Component 组件处理
    return mount(renderComponet(vdom, parent));
  } else if (typeof vdom.type === "function") {
    // Function 组件处理
    const props = { ...vdom.props, children: vdom.children };
    return renderDom(vdom.type(props), parent);
  }
  if(vdom.type === FRAGMENT_TYPE){
    // Fragment 组件处理
    vdom.children && vdom.children.forEach((vdom) => renderDom(vdom, parent));
    return parent
  }

}

//  渲染新 dom 时辅助解析 组件
function renderComponet(vdom, parent) {
  const props = { ...vdom.props, children: vdom.children };
  const instance = new vdom.type(props);
  instance.willMount(props);
  instance.__dom = renderDom(instance.render(), parent);
  instance.__dom.__key = props.key;
  instance.__dom.__instance = instance;
  instance.mount(props);
  return instance.__dom;
}

// 更新 dom
function updateDom(dom, vdom, parent = dom.parentNode) {
  const replace = (elm) =>
    parent ? parent.replaceChild(elm, dom) && elm : dom.replaceWith(elm) || elm;

  // 文本类型
  if (typeof vdom === "string" && dom instanceof Text) {
    if (dom.textContent === vdom) return dom;
    return replace(document.createTextNode(vdom));
  }

  // Component 组件处理
  if (typeof vdom === "object" && Component.isPrototypeOf(vdom.type)) {
    return replace(updateComponet(dom, vdom, parent));
  }

  // Function 组件处理
  if (typeof vdom.type === "function") {
    const props = { ...vdom.props, children: vdom.children };
    return updateDom(dom, vdom.type(props), parent);
  }

  // 普通处理
  if (typeof vdom === "object" && typeof vdom.type === "string") {
    setAttributes(dom, vdom);
    // 节点相同时更新子节点
    if (vdom.type.toLocaleUpperCase() === dom.tagName) {
      const oldList = [...dom.childNodes]; // .map(dom => ({ id: dom.__key })) // 从 dom 获取 key
      const newList = vdom.children; // .map(({key}) => ({ id: key}))
      // 这里还可以优化 diff 效率 目前是直接遍历
      newList.forEach((childVdom, index) => {
        let childDom;
        if (oldList[index]) {
          childDom = oldList[index];
        } else {
          childDom = renderDom(childVdom);
          dom.appendChild(childDom);
        }
        updateDom(childDom, childVdom, dom);
      });
      if (oldList.length > newList.length) {
        for (let i = newList.length; i < oldList.length; i++) {
          if (oldList.__instance) oldList.__instance.WillUnmount();
          oldList[i].remove();
        }
      }
      return dom;
    }
  }

  // 其余情况
  const newDom = renderDom(vdom);
  return replace(newDom);
}

// 更新 dom 辅助更新 组件
function updateComponet(dom, vdom, parent = dom.parentNode) {
  //    const replace = parent ? parent.replaceChild(,)
  const props = { ...vdom.props, children: vdom.children };
  if (dom.__instance && dom.__instance.constructor === vdom.type) {
    dom.__instance.props = props;
    const newDom = updateDom(dom, dom.__instance.render(), parent);
    dom.__instance.__dom = newDom;
    newDom.__instance = dom.__instance;
    return newDom;
  } else if (Component.isPrototypeOf(vdom.type)) {
    const newDom = renderComponet(vdom, parent);
    return newDom;
  }
  return null;
}

class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
  }
  setState(newState) {
    const state = { ...this.state, ...newState };
    this.state = state;
    updateDom(this.__dom, this.render());
  }
  willMount() {}
  mount() {}
  WillUnmount() {}
}

export {
  createElement,
  Component,
  renderDom as render,
  FRAGMENT_TYPE as Fragment,
};
