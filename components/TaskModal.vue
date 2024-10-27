<template>
  <div class="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50" @click.self="$emit('close')">
    <div class="bg-gray-800 text-white p-6 rounded-lg w-full max-w-xl relative">
      <!-- Bouton de fermeture -->
      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-400 hover:text-gray-300">
        <font-awesome-icon icon="times" />
      </button>

      <!-- Titre de la tâche -->
      <h2 class="text-xl font-semibold mb-4">
        <textarea
          v-model="localTask.text"
          class="text-lg resize-none w-full outline-none text-white no-scrollbar"
          rows="1"
          ref="taskTextarea"
          @input="adjustTextareaHeight"
        ></textarea>
      </h2>

      <!-- Description -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-400">Description</label>
        <textarea
          v-model="localTask.description"
          class="resize-none w-full bg-gray-700 text-white p-2 rounded"
          rows="3"
          placeholder="Ajouter une description"
        ></textarea>
      </div>

      <!-- Sous-tâches -->
      <div v-if="localTask.subtasks" class="mb-4">
        <label class="block mb-1 text-gray-400">Sous-tâches</label>
        <ul class="space-y-1">
          <li v-for="(subtask, subIndex) in localTask.subtasks" :key="subIndex" class="flex items-center">
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

      <!-- Actions -->
      <div class="flex justify-between items-center mt-6">
        <button @click="deleteTask" class="text-red-500 hover:text-red-400">
          <font-awesome-icon icon="trash" />
        </button>
        <button @click="saveTask" class="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 lg:w-auto w-full">
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localTask: { ...this.task },
      newSubtask: '',
    };
  },
  methods: {
    adjustTextareaHeight() {
      const textarea = this.$refs.taskTextarea;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    addSubtask() {
      if (this.newSubtask.trim()) {
        this.localTask.subtasks.push({ text: this.newSubtask, completed: false });
        this.newSubtask = '';
      }
    },
    deleteSubtask(subIndex) {
      this.localTask.subtasks.splice(subIndex, 1);
    },
    saveTask() {
      // Vérifier que l'ID est présent
      if (!this.localTask.id) {
        console.error("L'ID de la tâche est manquant dans TaskModal.");
        return;
      }

      // Vérifier que le texte de la tâche n'est pas vide
      if (!this.localTask.text || this.localTask.text.trim() === '') {
        alert('Le titre de la tâche ne peut pas être vide.');
        return;
      }

      // Nettoyer les données des sous-tâches
      if (this.localTask.subtasks) {
        this.localTask.subtasks = this.localTask.subtasks.map(subtask => ({
          text: subtask.text || '',
          completed: subtask.completed || false
        }));
      }

      this.$emit('save', this.localTask);
    },
    deleteTask() {
      this.$emit('delete');
    },
  },
  mounted() {
    this.adjustTextareaHeight();
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