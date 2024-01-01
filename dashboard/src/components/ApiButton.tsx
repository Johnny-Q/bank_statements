'use client';
import { useState } from "react";
const ApiButton = ({ text, apiFunc }: { text: string, apiFunc: () => Promise<any> }) => {
  const [apiResponse, setApiResponse] = useState({});
  return (
    <div>
      <button onClick={async () => {
        const resp = await apiFunc();
        console.log(resp);
        setApiResponse(resp);
      }}>{text}</button>
      <p>{JSON.stringify(apiResponse)}</p>
    </div >
  )
}

export default ApiButton