<!-- components/NotificationPanel.vue -->

<template>
  <div class="absolute right-0 mt-2 w-80 bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50">
    <div class="p-4 bg-gray-900 text-white flex justify-between items-center">
      <span class="font-semibold">Notifications</span>
      <button @click="markAllAsRead" class="text-sm text-blue-200 hover:underline">
        Tout marquer comme lu
      </button>
    </div>
    <ul>
      <li
        v-for="notification in notifications"
        :key="notification.id"
        class="border-b border-gray-700"
      >
        <a
          href="#"
          @click.prevent="handleNotificationClick(notification)"
          class="block p-4 hover:bg-gray-700"
        >
          <p :class="{ 'font-bold': !notification.read }">{{ notification.message }}</p>
          <small class="text-gray-400">{{ formatDate(notification.timestamp) }}</small>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { useNotificationStore } from '@/store/notification';
import { computed } from 'vue';

export default {
  setup() {
    const notificationStore = useNotificationStore();
    const notifications = computed(() =>
      notificationStore.notifications.slice().sort((a, b) => b.timestamp - a.timestamp)
    );

    function handleNotificationClick(notification) {
      console.log('Notification cliquée :', notification);
      notificationStore.markAsRead(notification.id);
      // Vous pouvez ajouter une action supplémentaire, comme naviguer vers la tâche concernée
    }

    function markAllAsRead() {
      console.log('Bouton "Tout marquer comme lu" cliqué');
      notificationStore.markAllAsRead();
    }

    function formatDate(timestamp) {
      if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      } else {
        return '';
      }
    }

    return {
      notifications,
      handleNotificationClick,
      markAllAsRead,
      formatDate,
    };
  },
};
</script>
