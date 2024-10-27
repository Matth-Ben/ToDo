import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { useNuxtApp } from '#app';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todoLists: [],
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
          const lists = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              tasks: data.tasks || [],
              userId: data.userId || '',
            };
          });
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
            userId: user.uid,
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
        const newTask = {
          id: uuidv4(),
          text: task.text || '',
          completed: task.completed || false,
          description: task.description || '',
          subtasks: task.subtasks || [],
          archived: false,
        };
        const tasks = [...this.todoLists[listIndex].tasks, newTask];
        const listDoc = doc($db, 'todoLists', listId);
        await updateDoc(listDoc, {
          tasks: tasks,
        });
        // Mettre à jour l'état local
        this.todoLists[listIndex].tasks = tasks;
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
      }
    },

    findTaskIndex(listIndex, taskId) {
      return this.todoLists[listIndex].tasks.findIndex((task) => task.id === taskId);
    },

    async updateTask(listIndex, taskId, updatedTask) {
      const { $db } = useNuxtApp();
      try {
        const listId = this.todoLists[listIndex].id;
        const tasks = [...this.todoLists[listIndex].tasks];
        const taskIndex = tasks.findIndex((task) => task.id === taskId);
    
        if (taskIndex !== -1) {
          // Assurez-vous que l'ID est maintenu
          updatedTask.id = taskId;
    
          // Vérifiez que l'ID n'est pas undefined
          if (!updatedTask.id) {
            console.error("L'ID de la tâche est undefined.");
            return;
          }
    
          // Nettoyer les données
          const cleanedUpdatedTask = {
            id: updatedTask.id,
            text: updatedTask.text || '',
            completed: updatedTask.completed || false,
            description: updatedTask.description || '',
            subtasks: updatedTask.subtasks ? updatedTask.subtasks.map(subtask => ({
              text: subtask.text || '',
              completed: subtask.completed || false
            })) : [],
            archived: updatedTask.archived !== undefined ? updatedTask.archived : false
          };
    
          tasks.splice(taskIndex, 1, cleanedUpdatedTask);
    
          const listDoc = doc($db, 'todoLists', listId);
          await updateDoc(listDoc, {
            tasks: tasks,
          });
    
          // Mettre à jour l'état local
          this.todoLists[listIndex].tasks = tasks;
        } else {
          console.error("La tâche à mettre à jour n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
      }
    },       

    async deleteTask(listIndex, taskId) {
      const { $db } = useNuxtApp();
      try {
        const taskIndex = this.findTaskIndex(listIndex, taskId);
        if (taskIndex !== -1) {
          const listId = this.todoLists[listIndex].id;
          const taskToDelete = this.todoLists[listIndex].tasks[taskIndex];
          const listDoc = doc($db, 'todoLists', listId);

          await updateDoc(listDoc, {
            tasks: arrayRemove(taskToDelete),
          });

          this.todoLists[listIndex].tasks.splice(taskIndex, 1);
        } else {
          console.error("La tâche à supprimer n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche :', error);
      }
    },

    async toggleTaskCompletion(listIndex, taskId) {
      const { $db } = useNuxtApp();
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
    
          const listDoc = doc($db, 'todoLists', listId);
          await updateDoc(listDoc, {
            tasks: tasks,
          });
    
          // Mettre à jour l'état local
          this.todoLists[listIndex].tasks = tasks;
        } else {
          console.error("La tâche à mettre à jour n'a pas été trouvée dans le store.");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'état de la tâche :", error);
      }
    },
  },
});
