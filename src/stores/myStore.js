import { defineStore } from 'pinia';

export const myAlert = defineStore('alert', {
  state: () => ({
    showAlert: false,
    alertMessage: '',
  }),
  actions: {
    triggerAlert(message) {
      this.alertMessage = message;
      this.showAlert = true;
      console.log(this.showAlert, this.alertMessage);
      setTimeout(() => {
        this.showAlert = false;
        this.alertMessage = '';
      }, 2000);
    },
    closeAlert() {
      this.showAlert = false;
      this.alertMessage = '';
      console.log(this.showAlert, this.alertMessage);
    },
  },
});
