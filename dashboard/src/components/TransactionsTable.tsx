import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/utils/transactionValidator"
import { DataTable } from "./DataTable"
import { Checkbox } from "./ui/checkbox"


const columns: ColumnDef<Transaction>[] = [
    { header: "Date", accessorKey: "date" },
    { header: "Description", accessorKey: "description" },
    { header: "Amount", accessorKey: "amount" },

]

const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {

    return (
        <DataTable columns={columns} data={transactions} />
    )
}

export default TransactionsTable