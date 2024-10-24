<template>
    <div class="flex h-screen bg-gray-900 text-white">
      <!-- Barre latérale gauche -->
      <aside class="w-64 bg-gray-800 p-4 flex flex-col justify-between">
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
                <!-- Bouton pour modifier la liste -->
                <button @click="editTodoList(index)" class="text-blue-400 hover:text-blue-300">
                    <font-awesome-icon icon="edit" />
                </button>
                <!-- Bouton pour supprimer la liste -->
                <button @click="deleteTodoList(index)" class="text-red-500 hover:text-red-400">
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </li>
          </ul>
        </div>
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
  
      <!-- Contenu principal -->
      <main class="flex-1 p-6 overflow-y-auto">
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
        selectedListIndex: null
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
      await todoStore.fetchTodoLists();  // Récupérer les listes
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
        await todoStore.deleteTodoList(index);  // Supprimer la liste
      },
      async editTodoList(index) {
        const newTitle = prompt('Modifier le titre de la liste:', this.todoLists[index].title);
        if (newTitle !== null && newTitle.trim() !== '') {
          const todoStore = useTodoStore();
          await todoStore.updateTodoList(index, newTitle);  // Modifier le titre
        }
      },
      selectList(index) {
        this.selectedListIndex = index;
      }
    }
  };
  </script>
  