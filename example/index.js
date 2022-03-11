import {
  render,
  createElement,
  Fragment,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "../src/index";

const app = document.createElement("div");
document.body.appendChild(app);

function Test() {
  const [count, setCount] = useState(1);
  const [v, setV] = useState("1");
  const ref = useRef();
  useEffect(() => {
    //   setTimeout(() => {
    //     setCount(count + 1)
    //   }, 1000)
    console.log("count", count);
    return () => console.log("uncount", count);
  }, [count]);

  const log = useCallback(() => console.log(count), [count]);
  const log_ = useMemo(() => () => console.log(count, ref), []);
  return (
    <>
      <input value={v} onInput={(e) => setV(e.target.value)} />
      <b>{v}</b>
      <h1 ref={ref} onClick={log_}>
        number: {count}{" "}
      </h1>
      <button onClick={() => (count > 10 ? setCount(1) : setCount(count + 1))}>
        +
      </button>

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
    {/* <Test /> */}
  </div>,
  app
);
