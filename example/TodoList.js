import { Component, createElement } from '../src/index'
import TodoItem from './TodoItem'

class TodoList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      inputValue: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleBtnClick = this.handleBtnClick.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleInputChange(e) {
    this.setState({
      inputValue: e.target.value
    })
  }

  handleBtnClick() {
    console.log([...this.state.list, this.state.inputValue])
    this.setState({
      list: [...this.state.list, this.state.inputValue],
      inputValue: ''
    })
  }

  handleItemClick(index) {
    console.log(index)
    const list = [...this.state.list]
    list.splice(index, 1)
    this.setState({
      list
    })
  }

  // 父组件通过属性的形式向子组件传递参数
  // 子组件通过props接收父组件传递过来的参数
  handleDelete(index) {
    console.log(index)
    const list = [...this.state.list]
    list.splice(index, 1)
    this.setState({
      list
    })
  }

  getTodoItem() {
    return this.state.list.map((item, index) => {
      return (
        <TodoItem
          deleteItem={this.handleDelete}
          key={index}
          content={item}
          index={index}
        />
      )
    })
  }
  render() {
    return (
      <div>
        <input
          value={this.state.inputValue}
          onChange={this.handleInputChange}
        />
        <button onClick={this.handleBtnClick}>add</button>
        <ul>{this.getTodoItem()}</ul>
      </div>
    )
  }
}

export default TodoList
