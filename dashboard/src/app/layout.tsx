import "@/styles/globals.css";
import Nav from "@/components/Nav"
import { ThemeProvider } from "@/components/ThemeProvider";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <body className="flex flex-row h-screen">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Nav />
                    <main className="grow flex flex-col justify-center items-center px-6">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout