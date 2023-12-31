import Nav from "@/components/Nav"

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <Nav />
                <main className="app">
                    {children}
                </main>
            </body>
        </html>
    )
}

export default RootLayout