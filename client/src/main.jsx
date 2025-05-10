import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import store from "./controller/store.js"
import { Provider } from "react-redux"

createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<App />
	</Provider>
)
