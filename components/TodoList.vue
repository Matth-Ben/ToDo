<template>
  <div class="space-y-4">
    <!-- Champ d'ajout de tâche -->
    <input
      v-model="newTask"
      placeholder="Ajouter une tâche"
      class="w-full bg-gray-700 text-white p-2 rounded mb-4"
      @keyup.enter="addTask"
    />

    <!-- Liste des tâches actives -->
    <ActiveTasks
      :tasks="list.tasks || []"
      @toggleCompletion="toggleCompletion"
      @openModal="openModal"
      @deleteTask="deleteTask"
    />

    <!-- Bouton pour afficher/masquer les archives -->
    <button @click="toggleShowArchives" class="text-gray-400 hover:text-gray-300 mt-4">
      {{ showArchives ? 'Masquer les archives' : 'Afficher les archives' }}
    </button>

    <!-- Liste des tâches archivées -->
    <ArchivedTasks
      v-if="showArchives"
      :tasks="list.tasks || []"
      @toggleCompletion="toggleCompletion"
      @openModal="openModal"
      @deleteTask="deleteTask"
    />

    <!-- Modal pour modifier la tâche -->
    <TaskModal
      v-if="isModalOpen"
      :task="editingTask"
      @close="closeModal"
      @save="saveTask"
      @delete="deleteTaskFromModal"
    />
  </div>
</template>

<script>
import { useTodoStore } from '@/store/todo';
import ActiveTasks from '@/components/ActiveTasks.vue';
import ArchivedTasks from '@/components/ArchivedTasks.vue';
import TaskModal from '@/components/TaskModal.vue';

export default {
  components: {
    ActiveTasks,
    ArchivedTasks,
    TaskModal,
  },
  props: ['list', 'listIndex'],
  data() {
    return {
      newTask: '',
      editingTaskId: null,
      editingTask: {},
      isModalOpen: false,
      showArchives: false,
    };
  },
  methods: {
    async addTask() {
      if (this.newTask.trim() !== '') {
        const todoStore = useTodoStore();
        await todoStore.addTask(this.listIndex, {
          text: this.newTask,
          completed: false,
          description: '',
          subtasks: [],
          archived: false,
        });
        this.newTask = '';
      }
    },
    async toggleCompletion(taskId) {
      const todoStore = useTodoStore();
      await todoStore.toggleTaskCompletion(this.listIndex, taskId);
    },
    async deleteTask(taskId) {
      const todoStore = useTodoStore();
      await todoStore.deleteTask(this.listIndex, taskId);
    },
    toggleShowArchives() {
      this.showArchives = !this.showArchives;
    },
    openModal(taskId) {
      const task = this.list.tasks.find((task) => task.id === taskId);
      if (task) {
        this.editingTaskId = taskId;
        this.editingTask = { ...task };
        this.isModalOpen = true;
      } else {
        console.error('La tâche avec l\'ID', taskId, "n'a pas été trouvée.");
      }
    },
    closeModal() {
      this.isModalOpen = false;
      this.editingTaskId = null;
      this.editingTask = {};
    },
    async saveTask(updatedTask) {
      if (updatedTask.text.trim() !== '') {
        const todoStore = useTodoStore();
        // Assurez-vous que l'ID est maintenu
        updatedTask.id = this.editingTaskId;
        await todoStore.updateTask(this.listIndex, this.editingTaskId, updatedTask);
        this.closeModal();
      } else {
        console.error('Le texte de la tâche est vide.');
      }
    },
    async deleteTaskFromModal() {
      const todoStore = useTodoStore();
      await todoStore.deleteTask(this.listIndex, this.editingTaskId);
      this.closeModal();
    },
  },
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>