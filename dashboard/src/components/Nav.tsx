import Link from "next/link"
const Nav = () => {
  return (
    <nav>
      <Link href="/api/auth/signout">
        Sign Out
      </Link>
      <Link href="/api/auth/signin">
        Sign In
      </Link>
      <Link href="/test">
        Test Page
      </Link>
    </nav>
  )
}

export default Nav