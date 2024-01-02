import Link from "next/link"
const Nav = () => {
  return (
    <nav className="grid-col-start-1 col-span-1 h-full flex flex-col">
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