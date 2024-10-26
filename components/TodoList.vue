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
        class="flex justify-between items-center bg-gray-800 p-4 rounded-lg cursor-pointer"
      >
        <input
          type="checkbox"
          v-model="task.completed"
          class="mr-2 cursor-pointer"
          @change="toggleTaskCompletion(index)"
        />
        <div @click="openModal(index)" class="flex-grow">
          <span :class="{ 'line-through': task.completed }">
            {{ task.text }}
          </span>
          <!-- Affichage du compteur de sous-tâches -->
          <span v-if="task.subtasks && task.subtasks.length" class="ml-2 text-gray-400 text-sm">
            Sous-tâches : ({{ countCompletedSubtasks(task) }}/{{ task.subtasks.length }})
          </span>
        </div>
        <button @click="deleteTask(index)" class="text-red-500 hover:text-red-400">
          <font-awesome-icon icon="trash" />
        </button>
      </li>
    </ul>

    <!-- Modal pour modifier la tâche -->
    <div v-if="isModalOpen" class="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50" @click.self="closeModal">
      <div class="bg-gray-800 text-white p-6 rounded-lg w-full max-w-xl relative">
        <!-- Icône de fermeture en haut à droite -->
        <button @click="closeModal" class="absolute top-3 right-3 text-gray-400 hover:text-gray-300">
          <font-awesome-icon icon="times" />
        </button>

        <!-- Champ titre de la tâche -->
        <h2 class="text-xl font-semibold mb-4">
          <textarea
            v-model="editingTaskText"
            class="text-lg resize-none w-full outline-none text-white no-scrollbar"
            rows="1"
            ref="taskTextarea"
            @input="adjustTextareaHeight"
          ></textarea>
        </h2>

        <!-- Champ description -->
        <div class="mb-4">
          <label class="block mb-1 text-gray-400">Description</label>
          <textarea
            v-model="editingTaskDescription"
            class="resize-none w-full bg-gray-700 text-white p-2 rounded"
            rows="3"
            placeholder="Ajouter une description"
          ></textarea>
        </div>

        <!-- Liste de sous-tâches -->
        <div v-if="editingSubtasks" class="mb-4">
          <label class="block mb-1 text-gray-400">Sous-tâches</label>
          <ul class="space-y-1">
            <li v-for="(subtask, subIndex) in editingSubtasks" :key="subIndex" class="flex items-center">
              <input type="checkbox" v-model="subtask.completed" class="mr-2" />
              <span :class="{ 'line-through': subtask.completed }">{{ subtask.text }}</span>
              <button @click="deleteSubtask(subIndex)" class="ml-auto text-red-500 hover:text-red-400">
                <font-awesome-icon icon="trash" />
              </button>
            </li>
          </ul>
          <input
            v-model="newSubtask"
            placeholder="Ajouter une sous-tâche"
            class="w-full bg-gray-700 text-white p-2 rounded mt-2"
            @keyup.enter="addSubtask"
          />
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-between items-center mt-6">
          <button @click="deleteTask(editingTaskIndex)" class="text-red-500 hover:text-red-400">
            <font-awesome-icon icon="trash" />
          </button>
          <button @click="saveTask(editingTaskIndex)" class="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 lg:w-auto w-full">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTodoStore } from '@/store/todo';

export default {
  props: ['list', 'listIndex'],
  data() {
    return {
      newTask: '',
      newSubtask: '',
      editingTaskIndex: null,
      editingTaskText: '',
      editingTaskDescription: '',
      editingSubtasks: [],
      isModalOpen: false,
    };
  },
  methods: {
    async addTask() {
      if (this.newTask.trim() !== '') {
        const todoStore = useTodoStore();
        await todoStore.addTask(this.listIndex, { text: this.newTask, completed: false, description: '', subtasks: [] });
        this.newTask = '';
      }
    },
    async deleteTask(taskIndex) {
      const todoStore = useTodoStore();
      await todoStore.deleteTask(this.listIndex, taskIndex);
      this.closeModal();
    },
    toggleTaskCompletion(taskIndex) {
      const todoStore = useTodoStore();
      todoStore.toggleTask(this.listIndex, taskIndex);
    },
    openModal(taskIndex) {
      const task = this.list.tasks[taskIndex];
      this.editingTaskIndex = taskIndex;
      this.editingTaskText = task.text;
      this.editingTaskDescription = task.description || '';
      this.editingSubtasks = task.subtasks ? [...task.subtasks] : [];
      this.isModalOpen = true;
      this.$nextTick(() => this.adjustTextareaHeight());
    },
    closeModal() {
      this.isModalOpen = false;
      this.editingTaskText = '';
      this.editingTaskIndex = null;
      this.editingTaskDescription = '';
      this.editingSubtasks = [];
    },
    async saveTask(taskIndex) {
      if (this.editingTaskText.trim() !== '') {
        const todoStore = useTodoStore();
        const updatedTask = {
          ...this.list.tasks[taskIndex],
          text: this.editingTaskText,
          description: this.editingTaskDescription,
          subtasks: this.editingSubtasks
        };
        await todoStore.updateTask(this.listIndex, taskIndex, updatedTask);
        this.closeModal();
      }
    },
    adjustTextareaHeight() {
      const textarea = this.$refs.taskTextarea;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    addSubtask() {
      if (this.newSubtask.trim()) {
        this.editingSubtasks.push({ text: this.newSubtask, completed: false });
        this.newSubtask = '';
      }
    },
    deleteSubtask(subIndex) {
      this.editingSubtasks.splice(subIndex, 1);
    },
    countCompletedSubtasks(task) {
      return task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0;
    }
  },
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
textarea.no-scrollbar {
  background: none;
  border: none;
  overflow: hidden;
}
</style>