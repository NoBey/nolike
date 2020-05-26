
import { Component, render, createElement, Fragment } from '../src/index'
import TodoList from './TodoList';

const app = document.createElement('div')
document.body.appendChild(app)


class Test extends Component{
    constructor(){
        super()
        this.state = {a: 1}
    }
    add(){
        const {a}= this.state
        this.setState({ a: a + 2 })
        this.setState({ a: a + 3 })
    }
    render(){
        console.log('render', this.state.a )
        return <div> { this.state.a } <button onClick={() => this.add()}>+++++</button> </div>
    }
}



render(
<>
<TodoList /> 
<Test value={322332} />
</>, app);





