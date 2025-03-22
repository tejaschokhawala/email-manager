<template>
  <div class="email-manager">
    <a-card
      class="email-title"
      title="Email Recipient Manager"
      :bordered="false"
    >
      <EmailInput
        :recipients="recipients"
        @add-email="addEmail"
        @select-recipient="selectRecipient"
      />

      <div class="recipients-container">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12">
            <AvailableRecipients
              :recipients="recipients"
              @select-recipient="selectRecipient"
            />
          </a-col>
          <a-col :xs="24" :md="12">
            <SelectedRecipients
              :recipients="recipients"
              @remove-recipient="removeRecipient"
            />
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import EmailInput from "./EmailInput.vue";
import AvailableRecipients from "./AvailableRecipients.vue";
import SelectedRecipients from "./SelectedRecipients.vue";
import type { Recipient } from "../types/types";
import { recipientsData } from "../types/recipients";

export default defineComponent({
  name: "EmailManager",
  components: {
    EmailInput,
    AvailableRecipients,
    SelectedRecipients,
  },
  setup() {
    // Initialize with provided data
    const recipients = ref<Recipient[]>([...recipientsData]);

    // Add a new email
    const addEmail = (email: string) => {
      // First check if email already exists
      const exists = recipients.value.findIndex((r) => r.email === email) >= 0;

      if (!exists) {
        recipients.value.push({
          email,
          isSelected: true,
        });
      } else {
        // If it exists, select it
        const index = recipients.value.findIndex((r) => r.email === email);
        recipients.value[index].isSelected = true;
      }
    };

    // Select existing recipients
    const selectRecipient = (toSelect: Recipient[]) => {
      toSelect.forEach((recipient) => {
        const index = recipients.value.findIndex(
          (r) => r.email === recipient.email
        );
        if (index >= 0) {
          recipients.value[index].isSelected = true;
        }
      });
    };

    // Remove recipients from selection
    const removeRecipient = (toRemove: Recipient[]) => {
      toRemove.forEach((recipient) => {
        const index = recipients.value.findIndex(
          (r) => r.email === recipient.email
        );
        if (index >= 0) {
          recipients.value[index].isSelected = false;
        }
      });
    };

    return {
      recipients,
      addEmail,
      selectRecipient,
      removeRecipient,
    };
  },
});
</script>

<style scoped>
.email-manager {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-grow: 1;
  margin: 0 auto;
}

.email-title {
  display: flex;
  flex-grow: 1;
  margin: 0 auto;
  flex-direction: column;
  text-align: center;
}

.recipients-container {
  margin-top: 24px;
}

</style>
