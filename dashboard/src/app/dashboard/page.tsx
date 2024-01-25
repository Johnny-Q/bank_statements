import TransactionsTable from "@/components/TransactionsTable";
import { Progress } from "@/components/ui/progress";
import { useSheetsClient } from "@/utils/hooks";
import CategoryOverviewCard from "./CategoryOverviewCard";

const DashboardPage = async () => {
    const sheets = await useSheetsClient();

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const total_spending = await sheets.getTotalSpending({startDate, endDate});
    const recent_transactions = await sheets.getTransactions({ limit: 5 });
    const spending_by_category = await sheets.getCategorySpending({startDate, endDate});

    const MAX_SPENDINGS = 500;

    return (
        <div className="w-full px-5">
            <section className="my-5">
                <h1 className="text-xl">You've Spent</h1>
                <h1 className="text-6xl">${Math.abs(total_spending).toFixed(2)}</h1>
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