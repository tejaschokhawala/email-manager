import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

app.use(Antd);
app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true,
  position: "top-right",
  timeout: 1000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
});

app.mount("#app");
