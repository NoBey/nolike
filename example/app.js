// import { createElement as h, Component  } from '../src/index'
import { listDiff } from './listDiff'

function createElement(type, props, ...children){
    // console.log(children)
    return {
        type,
        props,
        children: children.flat(Infinity)
    }
}

const h = createElement

// 为 dom 添加熟悉和事件
function setAttributes(dom, vdom){
   Object.entries(vdom.props || {}).forEach(([key, value]) => {
       if(key.startsWith('on')){
        const eventType = key.slice(2).toLowerCase();
        dom.__handlers = dom.__handlers || {};
        if (dom.__handlers[eventType]){
            dom.removeEventListener(eventType, dom.__handlers[eventType]);
        }
        dom.__handlers[eventType] = value
        dom.addEventListener(eventType, dom.__handlers[eventType])
       } else if(key === 'key'){
           dom.__key = value
       } else {
           dom.setAttributes(key, value)
       }
   })
}

// 渲染新 dom 
function renderDom(vdom, parent){
    const mount = parent ? (dom) => parent.appendChild(dom) : dom => dom
    if(typeof vdom !== 'object' && (typeof vdom === 'string' || typeof vdom === 'number' ) ) {
        return mount(document.createTextNode(vdom)) 
    }
    if(typeof vdom.type === 'string'){
       const dom = document.createElement(vdom.type)
       setAttributes(dom, vdom)
       vdom.children && vdom.children.forEach(vdom =>  renderDom(vdom, dom));
       return mount(dom) 

    } else if( Component.isPrototypeOf(vdom.type) ){
       return mount(renderComponet(vdom, parent))
    }  
     console.log(vdom)
}
//  渲染新 dom 时辅助解析 组件
function renderComponet(vdom, parent){
    console.log('renderComponet', vdom)
    const props = { ...vdom.props, children: vdom.children }
    const instance = new (vdom.type)(props)
    instance.willMount(props)
    instance.__dom = renderDom(instance.render(), parent) 
    instance.__dom.__key = props.key
    instance.__dom.__instance = instance
    instance.mount(props)
    return instance.__dom
}

// 更新 dom 
function updateDom(dom, vdom, parent = dom.parentNode){
    const replace = (elm) =>  parent ? (parent.replaceChild(elm, dom) && elm) :  (dom.replaceWith(elm) || elm)

    // 文本类型
    if( typeof vdom === 'string'  && ( dom instanceof Text) ){
        if(dom.textContent === vdom ) return dom
        return  replace(document.createTextNode(vdom))
    }
    
    // 自定义组件
    if(typeof vdom === 'object' && Component.isPrototypeOf(vdom.type) ){
       return  replace(updateComponet(dom, vdom, parent)) 
    }

    if(typeof vdom === 'object' && typeof vdom.type === 'string' ){
      // 节点相同时更新子节点 
      if(vdom.type.toLocaleUpperCase() === dom.tagName ){
          // 通过 listDiff 对比 两个 children 的不同
        const oldList =  [...dom.children].map(dom => ({ id: dom.__key })) // 从 dom 获取 key
        const newList =  vdom.children.map(({key}) => ({ id: key}))
        const patch = listDiff(oldList, newList)
        console.log(patch)
        console.log(oldList, newList)
        console.log([...dom.children],  vdom.children)
        return  
      }
    }

    // 其余情况 
    const newDom = renderDom(vdom) 
    return replace(newDom)
  
}

// 更新 dom 辅助更新 组件
function updateComponet(dom, vdom, parent = dom.parentNode){
//    const replace = parent ? parent.replaceChild(,)
    const props = { ...vdom.props, children: vdom.children }
    if(dom.__instance && dom.__instance.constructor === vdom.type ){
        dom.__instance.props = props
        const newDom =  updateDom(div, dom.__instance.render(), parent)  
        dom.__instance.__dom = newDom
        newDom.__instance =  dom.__instance
        return newDom

    }else if( Component.isPrototypeOf(vdom.type)  ){
        const newDom = renderComponet(vdom, parent)
        return newDom
    }
    return null
}

class Component {
    constructor(props = {}){
        this.props = props
        this.state = {}
    }
    setState(newState) {
      const state = {...this.state, ...newState}  
      this.state = state
      updateDom(this.__dom, this.render())
    }
    willMount(){

    }
    mount(){

    }
}


class App extends Component {
    constructor(){
        super()
        this.state = { a: 3, list: [1,2,3,4,5,6,7,8,9] }
    }
    
    click(){
        // console.log('add')
        // this.setState({ a : this.state.a + 1 })
        const { list } = this.state
        this.setState({ list : list.sort(() => Math.random() - 0.5) })  
    }
 
    render(){
        const { list } = this.state
        return <div>
            <h1>title</h1>
            <h3 onClick={() => this.click()}>sub{this.state.a}</h3>
            <ul>
                {list.map((n)=> {
                    return <li key={n}> love-key: {n}  </li>
                })}
            </ul>
        </div>
    }
}


// return 
window.app = <App ss={1}>32332</App>
const div = document.createElement('div')
div.id = 'app'
document.body.appendChild(div)
const a = renderDom(window.app, div)

console.log(a)
window.renderDom = renderDom