import { App } from "./ui/app.js";
// Point d'entree de l'application.
const root = document.getElementById("app");
if (!root) {
    throw new Error("Element #app introuvable.");
}
const app = new App(root);
app.init();
