'use client';
import { getProviders, signIn, signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react";
const Home = () => {
  const { data: session } = useSession();
  const [providers, setProviders] = useState(null);
  useEffect(() => {
    console.log(session)
  }, [session])
  useEffect(() => {
    const initProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    }
    initProviders();
  }, []);
  return (
    <div>
      Home
      {session?.user ? (
        <button onClick={signOut}>
          Sign Out
        </button>
      ) :
        providers && Object.values(providers).map((provider) => {
          return (
            <button
              type="button"
              key={provider.name}
              className="black_btn"
              onClick={() => {
                signIn(provider.id);
              }}
            >
              Sign In
            </button>
          )
        })
      }
    </div>
  )
}

export default Home