import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore'; // Import de `query` et `where`
import { useNuxtApp } from '#app'; // Import de `useNuxtApp`
import { getAuth } from 'firebase/auth';

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todoLists: []
  }),
  actions: {
    async fetchTodoLists() {
      const { $db } = useNuxtApp();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const q = query(collection($db, 'todoLists'), where('userId', '==', user.uid)); // Filtre par userId
          const querySnapshot = await getDocs(q);
          const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          this.todoLists = lists;
        } catch (error) {
          console.error('Erreur lors de la récupération des listes de tâches :', error);
        }
      }
    },

    async addTodoList(title) {
      const { $db } = useNuxtApp();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const docRef = await addDoc(collection($db, 'todoLists'), {
            title,
            tasks: [],
            userId: user.uid // Associe l'UID de l'utilisateur
          });
          this.todoLists.push({ id: docRef.id, title, tasks: [], userId: user.uid });
        } catch (error) {
          console.error("Erreur lors de l'ajout de la liste de tâches :", error);
        }
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

    async updateTask(listIndex, taskIndex, newTask) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const listDoc = doc($db, 'todoLists', listId);
        const oldTask = this.todoLists[listIndex].tasks[taskIndex];

        await updateDoc(listDoc, {
          tasks: arrayRemove(oldTask)
        });
        await updateDoc(listDoc, {
          tasks: arrayUnion(newTask)
        });

        this.todoLists[listIndex].tasks[taskIndex] = newTask;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
      }
    },

    async deleteTask(listIndex, taskIndex) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const taskToDelete = this.todoLists[listIndex].tasks[taskIndex];
        const listDoc = doc($db, 'todoLists', listId);

        await updateDoc(listDoc, {
          tasks: arrayRemove(taskToDelete)
        });

        this.todoLists[listIndex].tasks.splice(taskIndex, 1);
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche :', error);
      }
    },

    // Ajoute ces actions dans le store
    async updateTodoList(listId, newTitle) {
      const { $db } = useNuxtApp();
      try {
          const listDoc = doc($db, 'todoLists', listId); // Utilise l'ID de la liste
          await updateDoc(listDoc, {
              title: newTitle
          });

          // Mets à jour l'état local
          const index = this.todoLists.findIndex(list => list.id === listId);
          if (index !== -1) this.todoLists[index].title = newTitle;
      } catch (error) {
          console.error("Erreur lors de la mise à jour de la liste :", error);
      }
    },

    async deleteTodoList(listId) {
      const { $db } = useNuxtApp();
      try {
          const listDoc = doc($db, 'todoLists', listId); // Utilise l'ID de la liste
          await deleteDoc(listDoc);

          // Mets à jour l'état local
          this.todoLists = this.todoLists.filter(list => list.id !== listId);
      } catch (error) {
          console.error("Erreur lors de la suppression de la liste :", error);
      }
    }
  }
});
