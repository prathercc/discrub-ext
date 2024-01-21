import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}
