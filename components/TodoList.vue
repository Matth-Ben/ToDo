<template>
  <div class="space-y-4">
    <!-- Champ d'ajout de tâche -->
    <input
      v-model="newTask"
      placeholder="Ajouter une tâche"
      class="w-full bg-gray-700 text-white p-2 rounded mb-4"
      @keyup.enter="addTask"
    />

    <!-- ... Votre code existant ... -->
    <button @click="showShareModal = true" class="bg-blue-600 text-white p-2 rounded">Partager la liste</button>

    <div v-if="showShareModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Partager la liste avec un utilisateur</h2>
        <input v-model="shareEmail" placeholder="Adresse e-mail de l'utilisateur" class="w-full p-2 rounded bg-gray-700 mb-4" />
        <div class="flex justify-end space-x-2">
          <button @click="showShareModal = false" class="bg-red-500 text-white px-4 py-2 rounded">Annuler</button>
          <button @click="shareList" class="bg-blue-500 text-white px-4 py-2 rounded">Partager</button>
        </div>
      </div>
    </div>

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
import { useNuxtApp } from '#app';
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
      showShareModal: false,
      shareEmail: '',
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
    async shareList() {
      if (this.shareEmail.trim() !== '') {
        try {
          const { $auth } = useNuxtApp();
          const user = $auth.currentUser;
          if (!user) {
            throw new Error('Utilisateur non authentifié');
          }

          // Obtenir le jeton d'identification Firebase
          const idToken = await user.getIdToken();

          // Appeler l'API sur Vercel
          const response = await fetch('/api/getUserUidByEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ email: this.shareEmail.trim() }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l\'appel à l\'API');
          }

          const result = await response.json();
          const sharedUserUid = result.uid;

          const todoStore = useTodoStore();
          await todoStore.shareListWithUser(this.listIndex, sharedUserUid);

          this.showShareModal = false;
          this.shareEmail = '';
          alert('La liste a été partagée avec succès.');
        } catch (error) {
          console.error('Erreur lors du partage de la liste :', error);
          alert('Impossible de partager la liste. Vérifiez que l\'adresse e-mail est correcte.');
        }
      }
    },
  },
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>