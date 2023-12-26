import Provider from "@/components/Provider"

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <Provider>
                <body>
                    <main className="app">
                        {children}
                    </main>
                </body>
            </Provider>
        </html>
    )
}

export default RootLayout