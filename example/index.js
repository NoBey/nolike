import {
  render,
  createElement,
  Fragment,
  useState,
  useEffect,
} from "../src/index";

const app = document.createElement("div");
document.body.appendChild(app);

function Test() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    //   setTimeout(() => {
    //     setCount(count + 1)
    //   }, 1000)
  }, [count]);
  return (
    <>
      <h1> number: {count} </h1>
      <div onClick={() => (count > 10 ? setCount(1) : setCount(count + 1))}>
        +
      </div>

      {[...Array(count).keys()].map((i) => (
        <div>{i}</div>
      ))}
    </>
  );
}

render(
  <div>
    test
    <Test />
    <Test />
  </div>,
  app
);
