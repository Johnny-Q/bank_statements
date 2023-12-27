import Nav from "@/components/Nav"
import Provider from "@/components/Provider"

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <Provider>
                <body>
                    <Nav />
                    <main className="app">
                        {children}
                    </main>
                </body>
            </Provider>
        </html>
    )
}

export default RootLayout