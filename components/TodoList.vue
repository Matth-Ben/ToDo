<template>
  <div class="space-y-4">
    <input
      v-model="newTask"
      placeholder="Ajouter une tâche"
      class="w-full bg-gray-700 text-white p-2 rounded mb-4"
      @keyup.enter="addTask"
    />
    <ul class="space-y-2">
      <li
        v-for="(task, index) in list.tasks"
        :key="index"
        class="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
      >
        <div class="flex items-center w-full">
          <input
            type="checkbox"
            v-model="task.completed"
            class="mr-2 cursor-pointer"
          />
          <!-- Affiche le texte ou l'input en fonction de l'état d'édition -->
          <span
            v-if="editingTaskIndex !== index"
            @click="setEditingTask(index)"
            :class="{ 'line-through': task.completed }"
            class="flex-grow cursor-pointer"
          >
            {{ task.text }}
          </span>
          <input
            v-else
            v-model="editingTaskText"
            @blur="saveTask(index)"
            @keyup.enter="saveTask(index)"
            @keyup.esc="cancelEdit"
            class="bg-gray-700 text-white p-1 rounded w-full"
          />
        </div>
        <!-- Icone FontAwesome pour supprimer la tâche -->
        <button @click="deleteTask(index)" class="text-red-500 hover:text-red-400">
          <font-awesome-icon icon="trash" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { useTodoStore } from '@/store/todo';

export default {
  props: ['list', 'listIndex'],
  data() {
    return {
      newTask: '',
      editingTaskIndex: null,
      editingTaskText: ''
    };
  },
  methods: {
    async addTask() {
      if (this.newTask.trim() !== '') {
        const todoStore = useTodoStore();
        await todoStore.addTask(this.listIndex, this.newTask);
        this.newTask = '';
      }
    },
    async deleteTask(taskIndex) {
      const todoStore = useTodoStore();
      await todoStore.deleteTask(this.listIndex, taskIndex);
    },
    setEditingTask(taskIndex) {
      this.editingTaskIndex = taskIndex;
      this.editingTaskText = this.list.tasks[taskIndex].text;
    },
    async saveTask(taskIndex) {
      if (this.editingTaskText.trim() !== '') {
        const todoStore = useTodoStore();
        const updatedTask = { ...this.list.tasks[taskIndex], text: this.editingTaskText };
        await todoStore.updateTask(this.listIndex, taskIndex, updatedTask);
        this.editingTaskIndex = null;
      }
    },
    cancelEdit() {
      this.editingTaskIndex = null;
    }
  }
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
@media (max-width: 640px) {
  li {
    flex-direction: column;
    align-items: flex-start;
  }

  button {
    align-self: flex-end;
    margin-top: 8px;
  }
}
</style>
