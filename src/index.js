const FRAGMENT_TYPE = Symbol.for("fragment");

// workInProgressHook
// https://github1s.com/facebook/react/blob/HEAD/packages/react-reconciler/src/ReactFiberHooks.new.js#L188

// https://github1s.com/preactjs/preact/blob/HEAD/hooks/src/index.js


let workInProgressVdom;
let workInProgressHooks;
let workInProgressHookIndex;

function mapProps(vdom) {
  return Object.entries(vdom).reduce(
    (props, [k, v]) =>
      ["type", "children"].includes(k) ? props : { ...props, [k]: v },
    {}
  );
}

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

function WorkInProgressHook(initialState) {
  if (!workInProgressHooks[workInProgressHookIndex])
    workInProgressHooks.push({ state: initialState, vdom: workInProgressVdom });
  return workInProgressHooks[workInProgressHookIndex++];
}

function updateWorkInProgressHook(hook, state) {
  hook.state = state;
  return updateFunctionDom(hook.vdom);
}

function useState(initialState) {
  const hook = WorkInProgressHook(initialState);
  return [hook.state, (state) => updateWorkInProgressHook(hook, state)];
}


function someDep(dep, _dep){
  if(!dep || !_dep) return false
  if(dep.length !== _dep.length) return false
  if(dep.length === 0) return true
  return dep.every((d, i) => d === _dep[i] )
}

function useEffect(cb, dep){
  const hook = WorkInProgressHook();
  if(dep && hook.dep && someDep(hook.dep, dep)) return
  if(hook.endeffect) hook.endeffect()
  hook.dep = dep
  queueMicrotask(() => {
    hook.endeffect = cb()
  })
}

function useCallback(cb, dep){
  const hook = WorkInProgressHook();
  if(dep && hook.dep && someDep(hook.dep, dep)) return hook.cb
  hook.dep = dep
  hook.cb = cb
  return hook.cb
}

function useMemo(cb, dep){
  const hook = WorkInProgressHook();
  if(dep && hook.dep && someDep(hook.dep, dep)) return hook.memo
  hook.dep = dep
  hook.memo = cb()
  return hook.memo
}
//  react imperativeHandleEffect https://github1s.com/facebook/react/blob/HEAD/packages/react-reconciler/src/ReactFiberHooks.new.js#L1773
//  preact applyRef https://github1s.com/preactjs/preact/blob/HEAD/src/diff/index.js#L464

function useRef(){
  const hook = WorkInProgressHook();
  if(!hook.ref) hook.ref = { current : null }
  return hook.ref
}


function updateFunctionDom(vdom) {
  workInProgressVdom = vdom;
  workInProgressHooks = vdom.hooks;
  workInProgressHookIndex = 0;
  const __return = FixString(vdom.type(vdom));
  updateDom(vdom.__return, __return);
}



function findEndDom(vdom) {
  if (vdom.__dom || vdom.textnode) return vdom.__dom || vdom.textnode;
  if (vdom.__return) return findEndDom(__return);
  return findEndDom(vdom.children[vdom.children.length - 1]);
}

function unmountDom(vdom) {
  if (vdom.__dom || vdom.textnode) {
    (vdom.__dom || vdom.textnode).remove();
  }
}

function updateDom(vdom, newvdom) {
  // const
  const replace = (elm) =>
    vdom.textnode
      ? vdom.textnode.replaceWith(elm)
      : vdom.__dom.replaceWith(elm) || elm;
  // 文本类型
  if (typeof newvdom === "string" || vdom instanceof String) {
    if (String(newvdom) == String(vdom)) return;

    const textnode = document.createTextNode(String(newvdom));
    replace(textnode);
    vdom.textnode = textnode;
    return textnode;
  }
  // Function 组件处理
  if (typeof newvdom.type === "function" && vdom.type === newvdom.type) {
    vdom.props = {...vdom.props, ...mapProps(newvdom.props || {})}
    updateFunctionDom(vdom);
    return;
  }
  // 普通处理 vdom.type 可是是 string 或者 FRAGMENT_TYPE
  if (typeof vdom === "object" && vdom.type === newvdom.type) {
    if (typeof vdom.type === "string") {
      setAttributes(vdom.__dom, newvdom);
    }
    vdom.props = {...vdom.props, ...mapProps(newvdom.props || {})}
    vdom.children = vdom.children.map(FixString);
    newvdom.children = newvdom.children.map(FixString);
    const oldList = vdom.children; // .map(dom => ({ id: dom.__key })) // 从 dom 获取 key
    const newList = newvdom.children; // 展开 Fragment
    //   // 这里还可以优化 diff 效率 目前是直接遍历
    let endDom;
    newList.forEach((childVdom, index) => {
      if (oldList[index]) {
        updateDom(oldList[index], childVdom);
      } else {
        if (!endDom) endDom = findEndDom(oldList[oldList.length - 1]);
        const dom = renderDom(childVdom);
        endDom.after(dom);
        endDom = dom;
        oldList.push(childVdom);
  
      }
    });

    while (oldList.length > newList.length) {
      vdom = oldList.pop();
      unmountDom(vdom);
      // unmount
    }
    return;

    //   return dom;
  }
  // 其余情况
  const newDom = renderDom(vdom);
  return replace(newDom);
}

// 渲染新 dom
function renderDom(vdom, parent) {
  const mount = parent ? (dom) => parent.appendChild(dom) : (dom) => dom;
  if (
    typeof vdom === "string" ||
    typeof vdom === "number" ||
    vdom instanceof String
  ) {
    // 文本数字处理
    const text = document.createTextNode(vdom);
    vdom.textnode = text;
    return mount(text);
  } else if (typeof vdom.type === "string") {
    // 普通处理
    const dom = document.createElement(vdom.type);
    vdom.__dom = dom;
    setAttributes(dom, vdom);
    if (vdom.children) {
      vdom.children = vdom.children.map(FixString);
      vdom.children.forEach((vdom) => renderDom(vdom, dom));
    }
    if(vdom.props && typeof vdom.props.ref === 'object') {
      vdom.props.ref.current = dom
    }
    return mount(dom);
  } else if (typeof vdom.type === "function") {
    // Function 组件处理
    // const props = { ...vdom.props, children: vdom.children };
    return renderFunctionDom(vdom, parent); // renderDom(vdom.type(props), parent);
  }
  if (vdom.type === FRAGMENT_TYPE) {
    // Fragment 组件处理
    const dom = document.createDocumentFragment();
    if (vdom.children) {
      vdom.children = vdom.children.map(FixString);
      vdom.children.forEach((vdom) => renderDom(vdom, dom));
    }
    return mount(dom);
  }
}

function FixString(vdom) {
  if (typeof vdom === "string" || typeof vdom === "number")
    return new String(vdom);
  return vdom;
}

function renderFunctionDom(vdom, parent) {
  vdom.hooks = [];
  workInProgressVdom = vdom;
  workInProgressHooks = vdom.hooks;
  workInProgressHookIndex = 0;
  vdom.__return = FixString(vdom.type(vdom));
  return renderDom(vdom.__return, parent);
}

export {
  createElement,
  renderDom as render,
  FRAGMENT_TYPE as Fragment,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
};
