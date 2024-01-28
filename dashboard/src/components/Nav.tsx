import Link from "next/link"
import { Button } from "./ui/button"
const Nav = () => {
  return (
    <nav className="grid-col-start-1 col-span-1 h-full flex flex-col">
      <Button variant="ghost" asChild className="items-start justify-start">
        <Link href="/dashboard">
          Dashboard
        </Link>
      </Button>

      <Button variant="ghost" asChild className="items-start justify-start">
        <Link href="/add-transaction">
          Add Transaction
        </Link>
      </Button>

      <Button variant="ghost" asChild className="items-start justify-start">
        <Link href="/upload-transactions">
          Upload CSV
        </Link>
      </Button>
    </nav>
  )
}

export default Nav