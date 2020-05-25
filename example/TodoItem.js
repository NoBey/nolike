import { Component, createElement } from '../src/index'

class TodoItem extends Component {
  constructor(props) {
    super(props)

    this.handleDelete = this.handleDelete.bind(this)
  }
  // 子组件如果想和父组件通信，子组件要调用父组件传递过来的方法
  handleDelete() {
    // console.log(this.props.index)
    // this.props.delete(this.props.index) //代码优化
    const {deleteItem, index} = this.props
    deleteItem(index)
  }
  render() {
    const {content} = this.props
    return (<div onClick={this.handleDelete}>{content}</div>)
  }
}
export default TodoItem
