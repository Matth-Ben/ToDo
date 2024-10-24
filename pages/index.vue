<template>
  <div class="flex flex-col lg:flex-row h-screen bg-gray-900 text-white relative">
    <!-- Bouton pour ouvrir/fermer la barre latérale sur mobile -->
    <button
      @click="toggleSidebar"
      :class="{
        'left-4': !isSidebarOpen,
        'left-64 ml-4': isSidebarOpen
      }"
      class="lg:hidden absolute top-4 z-50 flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded-md transition-all duration-300"
    >
      <!-- Changement d'icône selon l'état de la sidebar -->
      <font-awesome-icon :icon="['fas', isSidebarOpen ? 'times' : 'bars']" />
    </button>

    <!-- Barre latérale gauche (Navbar) -->
    <aside
      :class="{
        'transform -translate-x-full': !isSidebarOpen,
        'transform translate-x-0': isSidebarOpen
      }"
      class="fixed lg:relative z-40 w-64 max-w-full bg-gray-800 p-4 h-full lg:h-auto transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between"
      @touchstart="startTouch"
      @touchmove="handleTouch"
    >
      <div>
        <h2 class="text-lg font-semibold mb-4">Mes ToDo Lists</h2>
        <ul>
          <li
            v-for="(list, index) in todoLists"
            :key="index"
            class="flex justify-between items-center py-2 px-3 rounded hover:bg-gray-700 transition cursor-pointer"
          >
            <span @click="selectList(index)" class="flex-grow">{{ list.title }}</span>
            <div class="space-x-2">
              <!-- Icône pour modifier la liste -->
              <button @click="editTodoList(index)" class="text-blue-400 hover:text-blue-300">
                <font-awesome-icon icon="edit" />
              </button>
              <!-- Icône pour supprimer la liste -->
              <button @click="deleteTodoList(index)" class="text-red-500 hover:text-red-400">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Section en bas : Champ texte et bouton "Ajouter une liste" -->
      <div class="mt-4">
        <input
          v-model="newListTitle"
          placeholder="Ajouter une nouvelle liste"
          class="w-full p-2 bg-gray-700 text-white rounded mb-2"
          @keyup.enter="addTodoList"
        />
        <button
          @click="addTodoList"
          class="bg-blue-600 hover:bg-blue-500 text-white py-2 w-full rounded-lg transition"
        >
          Ajouter une liste
        </button>
      </div>
    </aside>

    <!-- Overlay pour fermer la sidebar en cliquant à l'extérieur sur mobile -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>

    <!-- Contenu principal -->
    <main class="flex-1 p-6 overflow-y-auto h-full">
      <div v-if="selectedListIndex !== null" class="space-y-6">
        <h2 class="text-2xl font-bold mb-6">{{ todoLists[selectedListIndex].title }}</h2>
        <TodoList :list="todoLists[selectedListIndex]" :listIndex="selectedListIndex" />
      </div>
    </main>
  </div>
</template>

<script>
import { useTodoStore } from '@/store/todo';
import TodoList from '@/components/TodoList.vue';

export default {
  components: {
    TodoList
  },
  data() {
    return {
      newListTitle: '',
      selectedListIndex: null,
      isSidebarOpen: false,
      touchStartX: 0, // Pour capturer le point de départ du swipe
    };
  },
  computed: {
    todoLists() {
      const todoStore = useTodoStore();
      return todoStore.todoLists;
    }
  },
  async created() {
    const todoStore = useTodoStore();
    await todoStore.fetchTodoLists(); // Assurez-vous que les listes sont récupérées
  },
  methods: {
    async addTodoList() {
      if (this.newListTitle.trim() !== '') {
        const todoStore = useTodoStore();
        await todoStore.addTodoList(this.newListTitle);
        this.newListTitle = '';
      }
    },
    async deleteTodoList(index) {
      const todoStore = useTodoStore();
      await todoStore.deleteTodoList(index);
    },
    async editTodoList(index) {
      const newTitle = prompt('Modifier le titre de la liste:', this.todoLists[index].title);
      if (newTitle !== null && newTitle.trim() !== '') {
        const todoStore = useTodoStore();
        await todoStore.updateTodoList(index, newTitle);
      }
    },
    selectList(index) {
      this.selectedListIndex = index;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    // Capture le début du swipe
    startTouch(event) {
      this.touchStartX = event.touches[0].clientX;
    },
    // Gestion du swipe pour ouvrir/fermer la sidebar
    handleTouch(event) {
      const touchEndX = event.touches[0].clientX;
      const swipeDistance = touchEndX - this.touchStartX;
      // Swipe à droite pour ouvrir
      if (swipeDistance > 100) {
        this.isSidebarOpen = true;
      }
      // Swipe à gauche pour fermer
      if (swipeDistance < -100) {
        this.isSidebarOpen = false;
      }
    }
  }
};
</script>

<style scoped>
aside {
  transition: transform 0.3s ease-in-out;
  height: 100%; /* Full height */
}

button {
  z-index: 50; /* Le bouton doit être au-dessus du reste du contenu */
}

@media (min-width: 1024px) {
  aside {
    transform: none !important; /* Ne pas appliquer les transformations en grand écran */
    position: relative; /* Pas de position fixe sur grand écran */
  }
}
</style>
