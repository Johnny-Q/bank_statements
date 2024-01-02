import Link from "next/link"
const Nav = () => {
  return (
    <nav className="flex flex-col">
      <Link href="/test">
        Dashboard
      </Link>
      <Link href="/add-transaction">
        Add Transaction
      </Link>
      <Link href="/upload-transactions">
        Upload CSV
      </Link>
    </nav>
  )
}

export default Nav