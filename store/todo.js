import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useNuxtApp } from '#app';
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
          const q = query(collection($db, 'todoLists'), where('userId', '==', user.uid));
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
            userId: user.uid
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
        const newTask = { text: task, completed: false, description: '', subtasks: [] };
        const listDoc = doc($db, 'todoLists', listId);

        const updatedTasks = [...this.todoLists[listIndex].tasks, newTask];
        await updateDoc(listDoc, { tasks: updatedTasks });

        this.todoLists[listIndex].tasks = updatedTasks;
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
      }
    },

    async updateTask(listIndex, taskIndex, updatedTask) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const listDoc = doc($db, 'todoLists', listId);

        // Mets à jour la tâche dans l'état local
        const updatedTasks = [...this.todoLists[listIndex].tasks];
        updatedTasks[taskIndex] = updatedTask;

        await updateDoc(listDoc, { tasks: updatedTasks });
        this.todoLists[listIndex].tasks = updatedTasks;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
      }
    },

    async deleteTask(listIndex, taskIndex) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const listDoc = doc($db, 'todoLists', listId);

        const updatedTasks = [...this.todoLists[listIndex].tasks];
        updatedTasks.splice(taskIndex, 1);

        await updateDoc(listDoc, { tasks: updatedTasks });
        this.todoLists[listIndex].tasks = updatedTasks;
      } catch (error) {
        console.error("Erreur lors de la suppression de la tâche :", error);
      }
    },

    async toggleTask(listIndex, taskIndex) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const listDoc = doc($db, 'todoLists', listId);

        // Mets à jour l'état de la tâche localement
        const updatedTasks = [...this.todoLists[listIndex].tasks];
        updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;

        await updateDoc(listDoc, { tasks: updatedTasks });
        this.todoLists[listIndex].tasks = updatedTasks;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'état de la tâche :", error);
      }
    }
  }
});
