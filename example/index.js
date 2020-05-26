
import { Component, render, createElement, Fragment } from '../src/index'
import TodoList from './TodoList';

const app = document.createElement('div')
document.body.appendChild(app)
const Test = ({ value = 222 }) => {
return <div>test: {value}</div>
}

render(
<>
<TodoList /> 
<Test value={322332} />
</>, app);
