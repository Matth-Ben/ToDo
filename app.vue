<template>
    <div>
        <NuxtPage v-if="isAuthenticated || isAuthPage" />
    </div>
</template>
  
<script setup>
import { useRouter, useRoute } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref, onMounted, computed } from 'vue'

const isAuthenticated = ref(false)
const router = useRouter()
const route = useRoute()

// Calculer si la page actuelle est une page d'authentification (login ou register)
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')

onMounted(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthenticated.value = true
        } else if (!isAuthPage.value) {
            router.push('/login')
        }
    })
})
</script>
