import { useEffect, useState } from "react";

import PaymasterTest from "./paymasterTest/PaymasterTest";
import ProjectTest from "./projectTest/ProjectTest";

function App() {
  const [toggle, setToggle] = useState(false);

  return (
    <div className="App">
      <button
        onClick={() => {
          setToggle(!toggle);
        }}>
        테스트 변경
      </button>
      {toggle ? <PaymasterTest></PaymasterTest> : <ProjectTest></ProjectTest>}
    </div>
  );
}

export default App;
