
import { Component, render, createElement } from '../src/index'
import TodoList from './TodoList';

const app = document.createElement('div')
document.body.appendChild(app)
render(<TodoList />, app);
