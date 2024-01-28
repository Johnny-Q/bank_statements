import TransactionsTable from "@/components/TransactionsTable";
import { Progress } from "@/components/ui/progress";
import { useSheetsClient } from "@/utils/hooks";
import { Transaction } from "@/utils/transactionValidator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


const DashboardPage = async () => {
    const sheets = await useSheetsClient();

    const today = new Date();
    const start_date = new Date(today.getFullYear(), today.getMonth(), 1);
    const end_date = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const MAX_SPENDINGS = 500;

    //run this first to check if there is any data in the spreadsheet (no data will cause problems for other queries)
    let recent_transactions: Transaction[] = [];
    let total_spending = 0;
    let spending_by_category = {}
    let error = true;
    try {
        recent_transactions = await sheets.getTransactions({ limit: 5 });
        if (recent_transactions.length > 0) { //these queries only work if the user has already added some data to the spreadsheet
            spending_by_category = await sheets.getCategorySpending({ startDate: start_date, endDate: end_date });
            total_spending = 0; Math.abs(await sheets.getTotalSpending({ startDate: start_date, endDate: end_date }));
        }
        error = false;
    } catch (err) {
        console.error(err);

        //reset variables
        recent_transactions = [];
        total_spending = 0;
        spending_by_category = {}
    }


    return (
        <div className="w-full px-5">
            {error &&
                (<Alert variant="destructive">
                    <AlertDescription>
                        Error loading transactions.
                    </AlertDescription>
                </Alert>)
            }
            <section className="my-5">
                <h1 className="text-xl">This month, you've spent</h1>
                <h1 className="text-6xl">${total_spending.toFixed(2)}</h1>
                <div>
                    <Progress value={total_spending / MAX_SPENDINGS * 100} className="h-3 w-full" />
                    <div className="w-full flex flex-row justify-between">
                        <p>$0</p>
                        <p>${MAX_SPENDINGS.toFixed(2)}</p>
                    </div>
                </div>
            </section>

            <section className="my-5">
                <h1 className="text-xl">Recently Added Transactions</h1>
                <div>
                    <TransactionsTable transactions={recent_transactions} />
                </div>
            </section>

            {/* <section className="my-5">
                <h1 className="text-xl">Spendings by category</h1>
                <div>
                    {Object.entries(spending_by_category).map((entry, index) => {
                        return (
                            <CategoryOverviewCard />
                        )
                    })}
                </div>
            </section> */}
        </div>
    )
}

export default DashboardPage