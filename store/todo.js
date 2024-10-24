import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; // Import arrayRemove pour supprimer
import { useNuxtApp } from '#app'; // Import de useNuxtApp

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todoLists: []
  }),
  actions: {
    async fetchTodoLists() {
      const { $db } = useNuxtApp();
      try {
        const querySnapshot = await getDocs(collection($db, 'todoLists'));
        const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.todoLists = lists;
      } catch (error) {
        console.error('Erreur lors de la récupération des listes de tâches :', error);
      }
    },

    async addTodoList(title) {
      const { $db } = useNuxtApp();
      try {
        const docRef = await addDoc(collection($db, 'todoLists'), { title, tasks: [] });
        this.todoLists.push({ id: docRef.id, title, tasks: [] });
      } catch (error) {
        console.error("Erreur lors de l'ajout de la liste de tâches :", error);
      }
    },

    async addTask(listIndex, task) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const newTask = { text: task, completed: false };
        const listDoc = doc($db, 'todoLists', listId);

        await updateDoc(listDoc, {
          tasks: arrayUnion(newTask)
        });

        this.todoLists[listIndex].tasks.push(newTask);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche :', error);
      }
    },

    // Modifier une tâche
    async updateTask(listIndex, taskIndex, newTask) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const listDoc = doc($db, 'todoLists', listId);

        const oldTask = this.todoLists[listIndex].tasks[taskIndex];

        // Supprimer l'ancienne tâche et ajouter la nouvelle tâche modifiée
        await updateDoc(listDoc, {
          tasks: arrayRemove(oldTask) // Supprimer l'ancienne tâche
        });
        await updateDoc(listDoc, {
          tasks: arrayUnion(newTask) // Ajouter la nouvelle tâche modifiée
        });

        // Mettre à jour localement
        this.todoLists[listIndex].tasks[taskIndex] = newTask;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
      }
    },

    // Supprimer une tâche
    async deleteTask(listIndex, taskIndex) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const taskToDelete = this.todoLists[listIndex].tasks[taskIndex];
        const listDoc = doc($db, 'todoLists', listId);

        // Supprimer la tâche de Firestore
        await updateDoc(listDoc, {
          tasks: arrayRemove(taskToDelete)
        });

        // Supprimer la tâche localement
        this.todoLists[listIndex].tasks.splice(taskIndex, 1);
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche :', error);
      }
    }
  }
});
