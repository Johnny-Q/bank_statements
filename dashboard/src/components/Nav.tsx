import Link from "next/link"
import { Button } from "./ui/button"
import { HomeIcon, PlusIcon, UploadIcon } from "@radix-ui/react-icons"
import { IconProps } from "@radix-ui/react-icons/dist/types"
import { RefAttributes } from "react"

const NavLink = ({ Icon, link, text }: { Icon: React.ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>, link: string, text: string }) => {
  return (
    <Link href={link}>
      <Button variant="ghost" className="h-12 w-full justify-start">
        <Icon className="h-4 w-4"/>
        <span className="hidden mx-2 md:inline">
          {text}
        </span>
      </Button>
    </Link>

  )
}
const Nav = () => {
  return (
    <nav className="h-full w-full flex flex-col overflow-hidden">
      <NavLink text="Dashboard" link="/" Icon={HomeIcon} />
      <NavLink text="Add Transaction" link="/add-transaction" Icon={PlusIcon} />
      <NavLink text="Upload CSV" link="/upload-transactions" Icon={UploadIcon} />
    </nav>
  )
}

export default Nav