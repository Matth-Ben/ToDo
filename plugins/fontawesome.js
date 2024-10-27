import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faTrash, faBars, faTimes, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faEdit, faTrash, faBars, faTimes, faArrowUp);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon);
});