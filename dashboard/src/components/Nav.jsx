import Link from "next/link"
const Nav = () => {
  return (
    <nav>
        <Link href="/api/auth/signout">
            Signout
        </Link>
    </nav>
  )
}

export default Nav