<template>
  <div class="app-container">
    <EmailManager />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EmailManager from './components/EmailManager.vue';

export default defineComponent({
  name: 'App',
  components: {
    EmailManager
  }
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  padding: 24px;
  min-height: 100vh;
  display: flex;
}

@media (max-width: 768px) {
  .app-container {
    padding: 16px 8px;
  }
}
</style>