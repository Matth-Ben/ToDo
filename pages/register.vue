<template>
    <div class="flex items-center justify-center h-screen bg-gray-900 text-white">
        <form @submit.prevent="register" class="bg-gray-800 p-8 rounded-lg w-full max-w-sm">
            <h2 class="text-2xl font-bold mb-6">Créer un compte</h2>
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
            <button type="submit" class="bg-green-600 w-full p-2 rounded-lg hover:bg-green-500">
                S'inscrire
            </button>
            <!-- Bouton d'inscription avec Google -->
            <button @click.prevent="registerWithGoogle" class="bg-red-600 w-full p-2 rounded-lg hover:bg-red-500 mt-4">
                S'inscrire avec Google
            </button>
            <button @click.prevent="$router.push('/login')" class="mt-4">
                Se connecter
            </button>
        </form>
    </div>
</template>
  
<script>
    import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    
    export default {
        data() {
            return {
                email: "",
                password: ""
            };
        },
        methods: {
            async register() {
                const auth = getAuth();
                try {
                    await createUserWithEmailAndPassword(auth, this.email, this.password);
                    this.$router.push("/"); // Redirection après inscription
                } catch (error) {
                    console.error("Erreur lors de la création du compte :", error);
                    alert("Échec de la création du compte. Veuillez vérifier les informations fournies.");
                }
            },
            async registerWithGoogle() {
                const auth = getAuth();
                const provider = new GoogleAuthProvider();
                try {
                    await signInWithPopup(auth, provider);
                    this.$router.push("/"); // Redirection après inscription avec Google
                } catch (error) {
                    console.error("Erreur lors de l'inscription avec Google :", error);
                    alert("Échec de l'inscription avec Google.");
                }
            }
        }
    };
</script>
  
<style scoped>
/* Ajouter du style si nécessaire */
</style>