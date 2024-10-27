// store/notification.js

import { defineStore } from 'pinia';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { useNuxtApp } from '#app';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    notificationPanelOpen: false,
    unsubscribe: null,
  }),
  getters: {
    unreadNotifications(state) {
      return state.notifications.filter((notif) => !notif.read);
    },
  },
  actions: {
    async fetchNotifications() {
      const { $db, $auth } = useNuxtApp();
      const user = $auth.currentUser;

      if (user) {
        // Annuler l'écouteur précédent si nécessaire
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }

        const notificationsRef = collection($db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.uid));

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          this.notifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      }
    },
    toggleNotificationPanel() {
      this.notificationPanelOpen = !this.notificationPanelOpen;
    },
    async markAsRead(notificationId) {
      const { $db } = useNuxtApp();
      try {
        const notificationRef = doc($db, 'notifications', notificationId);
        await updateDoc(notificationRef, { read: true });
        console.log(`Notification ${notificationId} marquée comme lue`);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification comme lue :', error);
      }
    },
    async markAllAsRead() {
      const { $db } = useNuxtApp();
      try {
        const batch = writeBatch($db);
        this.unreadNotifications.forEach((notif) => {
          const notificationRef = doc($db, 'notifications', notif.id);
          batch.update(notificationRef, { read: true });
        });
        await batch.commit();
        console.log('Toutes les notifications ont été marquées comme lues');
      } catch (error) {
        console.error('Erreur lors du marquage de toutes les notifications comme lues :', error);
      }
    },
  },
});
