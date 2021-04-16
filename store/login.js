import books from "../pages/books";

export const state = () => ({
  currentUser: (JSON.parse(localStorage.getItem("currentUser")) === null) ? {api_key:'',name:''} : JSON.parse(localStorage.getItem("currentUser")),
  current_books: localStorage.getItem("currentBooks"),
  notifications: []
})
export const mutations = {
  set(state, apiKey){
    state.currentUser = apiKey;
    localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  },
  addBook(state, Book){
    state.current_books.push(Book)
    localStorage.setItem("currentBooks", state.current_books);
  },
  removeBook(state, Book){
    const index = state.current_books.indexOf(Book);
    if (index > -1) {
      state.current_books.splice(index, 1);
    }
    localStorage.setItem("currentBooks", state.current_books);
  },
  addNotification(state, notification){
    state.notifications.push(notification)
  },
  removeNotification(state, notification){
    const index = state.notifications.indexOf(notification);
    if (index > -1) {
      state.notifications.splice(index, 1);
    }
  },
  clearNotifications(state){
    state.notifications = []
  },
}
