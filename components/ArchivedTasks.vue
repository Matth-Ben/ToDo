<template>
  <ul class="space-y-2 mt-4 bg-gray-700 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-2 text-white">Tâches archivées</h3>
    <li
      v-for="task in archivedTasks"
      :key="task.id"
      class="flex justify-between items-center bg-gray-600 p-4 rounded-lg cursor-pointer"
    >
      <input
        type="checkbox"
        :checked="task.completed"
        class="mr-2 cursor-pointer"
        @change="$emit('toggleCompletion', task.id)"
      />
      <div @click="$emit('openModal', task.id)" class="flex-grow">
        <span :class="{ 'line-through': task.completed }">{{ task.text }}</span>
      </div>
      <button @click="$emit('deleteTask', task.id)" class="text-red-500 hover:text-red-400">
        <font-awesome-icon icon="trash" />
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    tasks: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    archivedTasks() {
      return this.tasks.filter((task) => task && task.archived);
    },
  },
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>