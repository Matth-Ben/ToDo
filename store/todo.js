// store/todo.js

import { defineStore } from 'pinia'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { useNuxtApp } from '#app'
import { v4 as uuidv4 } from 'uuid'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todoLists: [],
    unsubscribes: [],
  }),
  actions: {
    async fetchTodoLists() {
      const { $db, $auth } = useNuxtApp()
      const user = $auth.currentUser

      if (user) {
        try {
          // Annuler les précédents écouteurs
          this.unsubscribes.forEach((unsub) => unsub())
          this.unsubscribes = []
          this.todoLists = [] // Réinitialiser les listes

          const ownerQuery = query(
            collection($db, 'todoLists'),
            where('ownerId', '==', user.uid)
          )

          const sharedQuery = query(
            collection($db, 'todoLists'),
            where('sharedWith', 'array-contains', user.uid)
          )

          const processSnapshot = (snapshot) => {
            snapshot.docs.forEach((docSnap) => {
              const listId = docSnap.id
              const listDocRef = doc($db, 'todoLists', listId)

              // Écouter les changements sur chaque liste
              const unsub = onSnapshot(listDocRef, (doc) => {
                const listData = { id: doc.id, ...doc.data() }
                this.updateOrAddList(listData)
              })

              // Stocker la fonction de désabonnement
              this.unsubscribes.push(unsub)
            })
          }

          // Écouter les listes dont l'utilisateur est le propriétaire
          const unsubOwner = onSnapshot(ownerQuery, processSnapshot)
          this.unsubscribes.push(unsubOwner)

          // Écouter les listes partagées avec l'utilisateur
          const unsubShared = onSnapshot(sharedQuery, processSnapshot)
          this.unsubscribes.push(unsubShared)
        } catch (error) {
          console.error('Erreur lors de la récupération des listes de tâches :', error)
        }
      }
    },

    updateOrAddList(newList) {
      const index = this.todoLists.findIndex((list) => list.id === newList.id)
      if (index !== -1) {
        // Mettre à jour la liste existante
        this.todoLists.splice(index, 1, newList)
      } else {
        // Ajouter la nouvelle liste
        this.todoLists.push(newList)
      }
    },

    async addTodoList(title) {
      const { $db, $auth } = useNuxtApp()
      const user = $auth.currentUser

      if (user) {
        try {
          const docRef = await addDoc(collection($db, 'todoLists'), {
            title,
            tasks: [],
            ownerId: user.uid,
            sharedWith: [],
          })
          // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
        } catch (error) {
          console.error("Erreur lors de l'ajout de la liste de tâches :", error)
        }
      } else {
        console.error('Utilisateur non authentifié.')
      }
    },

    async shareListWithUser(listIndex, sharedUserUid) {
      const { $db } = useNuxtApp()
      try {
        const listId = this.todoLists[listIndex].id
        const listDocRef = doc($db, 'todoLists', listId)

        // Mettre à jour le champ `sharedWith`
        await updateDoc(listDocRef, {
          sharedWith: arrayUnion(sharedUserUid),
        })

        // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
      } catch (error) {
        console.error('Erreur lors du partage de la liste :', error)
      }
    },

    async addTask(listIndex, task) {
      const { $db, $auth } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const newTask = {
          id: uuidv4(),
          text: task.text || '',
          completed: task.completed || false,
          description: task.description || '',
          subtasks: task.subtasks || [],
          archived: false,
        };
    
        const listDocRef = doc($db, 'todoLists', listId);
        const updatedTasks = [...this.todoLists[listIndex].tasks, newTask];
    
        await updateDoc(listDocRef, {
          tasks: updatedTasks,
        });
    
        // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
    
        // Générer une notification pour les utilisateurs concernés
        const sharedUsers = this.todoLists[listIndex].sharedWith || [];
        const ownerId = this.todoLists[listIndex].ownerId;
        const notificationMessage = `Une nouvelle tâche "${newTask.text}" a été ajoutée.`;
    
        // Créer une notification pour chaque utilisateur (sauf l'utilisateur actuel)
        const currentUserId = $auth.currentUser.uid;
        const notificationRecipients = [ownerId, ...sharedUsers].filter(
          (uid) => uid !== currentUserId
        );
    
        for (const userId of notificationRecipients) {
          await addDoc(collection($db, 'notifications'), {
            userId,
            message: notificationMessage,
            listId,
            type: 'task_added',
            timestamp: serverTimestamp(),
            read: false,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
      }
    },

    async updateTask(listIndex, taskId, updatedTask) {
      const { $db, $auth } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const tasks = [...this.todoLists[listIndex].tasks];
        const taskIndex = tasks.findIndex((task) => task.id === taskId);
    
        if (taskIndex !== -1) {
          updatedTask.id = taskId;
    
          // Nettoyer les données
          const cleanedUpdatedTask = {
            id: updatedTask.id,
            text: updatedTask.text || '',
            completed: updatedTask.completed || false,
            description: updatedTask.description || '',
            subtasks: updatedTask.subtasks
              ? updatedTask.subtasks.map((subtask) => ({
                  text: subtask.text || '',
                  completed: subtask.completed || false,
                }))
              : [],
            archived: updatedTask.archived !== undefined ? updatedTask.archived : false,
          };
    
          tasks.splice(taskIndex, 1, cleanedUpdatedTask);
    
          const listDocRef = doc($db, 'todoLists', listId);
          await updateDoc(listDocRef, {
            tasks: tasks,
          });
    
          // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
    
          // Après avoir mis à jour la tâche
          const sharedUsers = this.todoLists[listIndex].sharedWith || [];
          const ownerId = this.todoLists[listIndex].ownerId;
          const notificationMessage = `La tâche "${updatedTask.text}" a été modifiée.`;
    
          // Utilisez $auth et $db déjà déclarés
          const currentUserId = $auth.currentUser.uid;
          const notificationRecipients = [ownerId, ...sharedUsers].filter(
            (uid) => uid !== currentUserId
          );
    
          for (const userId of notificationRecipients) {
            await addDoc(collection($db, 'notifications'), {
              userId,
              message: notificationMessage,
              listId,
              type: 'task_modified',
              timestamp: serverTimestamp(),
              read: false,
            });
          }
        } else {
          console.error("La tâche à mettre à jour n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
      }
    },    

    async deleteTask(listIndex, taskId) {
      const { $db, $auth } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const tasks = [...this.todoLists[listIndex].tasks];
        const taskIndex = tasks.findIndex((task) => task.id === taskId);
    
        if (taskIndex !== -1) {
          const task = tasks[taskIndex];
          tasks.splice(taskIndex, 1);
    
          const listDocRef = doc($db, 'todoLists', listId);
          await updateDoc(listDocRef, {
            tasks: tasks,
          });
    
          // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
    
          // Générer une notification pour les utilisateurs concernés
          const sharedUsers = this.todoLists[listIndex].sharedWith || [];
          const ownerId = this.todoLists[listIndex].ownerId;
          const notificationMessage = `La tâche "${task.text}" a été supprimée.`;
    
          // Créer une notification pour chaque utilisateur (sauf l'utilisateur actuel)
          const currentUserId = $auth.currentUser.uid;
          const notificationRecipients = [ownerId, ...sharedUsers].filter(
            (uid) => uid !== currentUserId
          );
    
          for (const userId of notificationRecipients) {
            await addDoc(collection($db, 'notifications'), {
              userId,
              message: notificationMessage,
              listId,
              type: 'task_deleted',
              timestamp: serverTimestamp(),
              read: false,
            });
          }
        } else {
          console.error("La tâche à supprimer n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche :', error);
      }
    },

    async toggleTaskCompletion(listIndex, taskId) {
      const { $db, $auth } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const tasks = [...this.todoLists[listIndex].tasks];
        const taskIndex = tasks.findIndex((task) => task.id === taskId);
    
        if (taskIndex !== -1) {
          const task = tasks[taskIndex];
          const isCompleted = !task.completed;
          const updatedTask = {
            ...task,
            completed: isCompleted,
            archived: isCompleted,
          };
          tasks.splice(taskIndex, 1, updatedTask);
    
          const listDocRef = doc($db, 'todoLists', listId);
          await updateDoc(listDocRef, {
            tasks: tasks,
          });
    
          // L'écouteur en temps réel mettra à jour `todoLists` automatiquement
    
          // Générer une notification pour les utilisateurs concernés
          const sharedUsers = this.todoLists[listIndex].sharedWith || [];
          const ownerId = this.todoLists[listIndex].ownerId;
          const action = isCompleted ? 'archivée' : 'désarchivée';
          const notificationMessage = `La tâche "${task.text}" a été ${action}.`;
    
          // Créer une notification pour chaque utilisateur (sauf l'utilisateur actuel)
          const currentUserId = $auth.currentUser.uid;
          const notificationRecipients = [ownerId, ...sharedUsers].filter(
            (uid) => uid !== currentUserId
          );
    
          for (const userId of notificationRecipients) {
            await addDoc(collection($db, 'notifications'), {
              userId,
              message: notificationMessage,
              listId,
              type: 'task_archived',
              timestamp: serverTimestamp(),
              read: false,
            });
          }
        } else {
          console.error("La tâche à mettre à jour n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'état de la tâche :", error);
      }
    },

    async createNotification(userId, message, listId, type) {
      const { $db } = useNuxtApp()
      try {
        await addDoc(collection($db, 'notifications'), {
          userId,
          message,
          listId,
          type,
          timestamp: serverTimestamp(),
          read: false,
        })
      } catch (error) {
        console.error('Erreur lors de la création de la notification :', error)
      }
    }    
  },
})
