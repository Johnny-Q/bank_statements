import "@/styles/globals.css";
import Nav from "@/components/Nav"
import { ThemeProvider } from "@/components/ThemeProvider";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <body className="h-screen grid grid-cols-5">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Nav />
                    <main className="col-start-2 col-span-4 h-full max-h-full w-full overflow-y-auto">
                        <div className="min-h-full flex flex-col justify-center items-center">
                            {children}
                        </div>
                    </main>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout