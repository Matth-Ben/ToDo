<template>
    <div class="flex items-center justify-center h-screen bg-gray-900 text-white">
        <form @submit.prevent="login" class="bg-gray-800 p-8 rounded-lg w-full max-w-sm">
            <h2 class="text-2xl font-bold mb-6">Connexion</h2>
            <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                required
            />
            <input
                v-model="password"
                type="password"
                placeholder="Mot de passe"
                class="w-full p-2 mb-6 bg-gray-700 text-white rounded"
                required
            />
            <button type="submit" class="bg-blue-600 w-full p-2 rounded-lg hover:bg-blue-500">
                Connexion
            </button>
            <!-- Bouton de connexion Google -->
            <button @click.prevent="loginWithGoogle" class="bg-red-600 w-full p-2 rounded-lg hover:bg-red-500 mt-4">
                Connexion avec Google
            </button>
            <button @click.prevent="$router.push('/register')" class="mt-4">
                Créer un compte
            </button>
        </form>
    </div>
</template>
  
<script>
    import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    
    export default {
        data() {
            return {
                email: "",
                password: ""
            };
        },
        methods: {
            async login() {
                const auth = getAuth();
                try {
                    await signInWithEmailAndPassword(auth, this.email, this.password);
                    this.$router.push("/"); // Redirection après connexion
                } catch (error) {
                    console.error("Erreur de connexion :", error);
                    alert("Échec de la connexion. Vérifiez vos identifiants.");
                }
            },
            async loginWithGoogle() {
                const auth = getAuth();
                const provider = new GoogleAuthProvider();
                try {
                    await signInWithPopup(auth, provider);
                    this.$router.push("/"); // Redirection après connexion avec Google
                } catch (error) {
                    console.error("Erreur de connexion avec Google :", error);
                    alert("Échec de la connexion Google.");
                }
            }
        }
    };
</script>
  
<style scoped>
/* Ajouter du style si nécessaire */
</style>
