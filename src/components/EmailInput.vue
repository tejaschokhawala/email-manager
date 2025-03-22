<template>
  <div class="email-input-container">
    <a-auto-complete
      v-model:value="inputValue"
      :options="filteredOptions"
      class="email-autocomplete"
      @select="handleSelect"
      :open="filteredOptions.length > 0"
    >
      <a-input
        placeholder="Enter email or company name"
        v-model:value="inputValue"
        @input="handleInputChange"
        @pressEnter="handleInputEnter"
        allow-clear
      >
        <template #prefix>
          <UserOutlined />
        </template>
      </a-input>
    </a-auto-complete>
    <a-button
      type="primary"
      :disabled="!inputValue || !isValidInput"
      @click="handleAddEmail"
    >
      Add
    </a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useToast } from "vue-toastification";
import type { Recipient } from "../types/types";
import { getDomain, isValidEmail } from "../utils/emailUtils";

export default defineComponent({
  name: "EmailInput",
  components: {
    UserOutlined,
  },
  props: {
    recipients: {
      type: Array as () => Recipient[],
      required: true,
    },
  },
  emits: ["add-email", "select-recipient"],
  setup(props, { emit }) {
    const toast = useToast();
    const inputValue = ref("");
    const isValidInput = ref(false);

    const domains = computed(() => {
      const domainSet = new Set<string>();
      props.recipients.forEach((r) => {
        domainSet.add(getDomain(r.email));
      });
      return Array.from(domainSet);
    });

    const filteredOptions = computed(() => {
      if (!inputValue.value) return [];

      const value = inputValue.value.toLowerCase();
      const emailOptions = props.recipients
        .filter((r) => r.email.toLowerCase().includes(value) && !r.isSelected)
        .map((r) => ({ value: r.email, label: r.email }));

      const domainOptions = domains.value
        .filter((d) => d.toLowerCase().includes(value))
        .map((d) => ({ value: `@${d}`, label: `All emails from ${d}` }));

      return [...emailOptions, ...domainOptions];
    });

    watch(inputValue, (val) => {
      isValidInput.value = isValidEmail(val);
    });

    const handleInputChange = () => {
      isValidInput.value = isValidEmail(inputValue.value);
    };

    const handleInputEnter = () => {
      handleAddEmail();
    };

    const handleSelect = (value: string) => {
      if (!filteredOptions) return;
      if (value.startsWith("@")) {
        const domain = value.substring(1);
        const domainRecipients = props.recipients.filter(
          (r) => getDomain(r.email) === domain && !r.isSelected
        );

        if (domainRecipients.length > 0) {
          emit("select-recipient", domainRecipients);
          toast.success(`All emails from ${domain} have been added`);
        }
      } else {
        const recipient = props.recipients.find((r) => r.email === value);
        if (recipient && !recipient.isSelected) {
          emit("select-recipient", [recipient]);
          toast.success(`${value} has been added`);
        }
      }
      inputValue.value = "";
    };

    const handleAddEmail = () => {
      if (!isValidEmail(inputValue.value)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const exists = props.recipients.some((r) => r.email === inputValue.value);
      if (exists) {
        handleSelect(inputValue.value);
      } else {
        emit("add-email", inputValue.value);
        toast.success(`${inputValue.value} has been added`);
        inputValue.value = "";
      }
    };

    return {
      inputValue,
      isValidInput,
      filteredOptions,
      handleInputChange,
      handleInputEnter,
      handleSelect,
      handleAddEmail,
    };
  },
});
</script>

<style scoped>
.email-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
  text-align: left;
}

.email-autocomplete {
  flex: 1;
}
</style>
