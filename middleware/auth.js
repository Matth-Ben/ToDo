import { getAuth, onAuthStateChanged } from "firebase/auth";

export default defineNuxtRouteMiddleware((to, from) => {
    return new Promise((resolve) => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (!user && to.path !== "/login") {
                return resolve(navigateTo("/login"));
            }
            resolve(); // L'utilisateur est authentifié, continue le chargement
        });
    });
});
