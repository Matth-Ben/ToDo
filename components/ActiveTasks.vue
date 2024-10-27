<template>
  <ul class="space-y-2">
    <li
      v-for="task in activeTasks"
      :key="task.id"
      class="flex justify-between items-center bg-gray-800 p-4 rounded-lg cursor-pointer"
    >
      <input
        type="checkbox"
        :checked="task.completed"
        class="mr-2 cursor-pointer"
        @change="$emit('toggleCompletion', task.id)"
      />
      <div @click="$emit('openModal', task.id)" class="flex-grow">
        <span :class="{ 'line-through': task.completed }">{{ task.text }}</span>
        <span v-if="task.subtasks && task.subtasks.length" class="ml-2 text-gray-400 text-sm">
          Sous-tâches : ({{ countCompletedSubtasks(task) }}/{{ task.subtasks.length }})
        </span>
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
    activeTasks() {
      return this.tasks.filter((task) => task && !task.archived);
    },
  },
  methods: {
    countCompletedSubtasks(task) {
      return task.subtasks ? task.subtasks.filter((subtask) => subtask.completed).length : 0;
    },
  },
};
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>