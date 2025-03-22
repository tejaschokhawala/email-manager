<template>
  <div class="email-input-container">
    <a-auto-complete
      ref="emailAutoComplete"
      v-model:value="inputValue"
      :options="filteredOptions"
      class="email-autocomplete"
      @select="handleSelect"
      :open="filteredOptions.length > 0"
      @keydown.enter="handleInputEnter"
      @change="handleInputChange"
      allow-clear
      autofocus
    >
      <template #default>
        <a-input
          v-model:value="inputValue"
          placeholder="Enter email or company name"
        >
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
      </template>
    </a-auto-complete>

    <a-button
      type="primary"
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
    const emailInput = ref<HTMLElement | null>(null); // Add ref for input

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

    const processEmail = (email: string) => {
      const exists = props.recipients.some((r) => r.email === email);
      if (exists) {
        const recipient = props.recipients.find((r) => r.email === email);
        if (recipient && !recipient.isSelected) {
          emit("select-recipient", [recipient]);
          toast.success(`${email} has been added`);
        }
      } else {
        emit("add-email", email);
        toast.success(`${email} has been added`);
      }
      return true;
    };

    const processDomain = (domain: string) => {
      const domainRecipients = props.recipients.filter(
        (r) => getDomain(r.email) === domain && !r.isSelected
      );

      if (domainRecipients.length > 0) {
        emit("select-recipient", domainRecipients);
        toast.success(`All emails from ${domain} have been added`);
        return true;
      }
      return false;
    };

    const handleInputEnter = () => {
      const value = inputValue.value;

      if (!value.trim()) {
        return;
      }

      if (value.startsWith("@")) {
        if (processDomain(value.substring(1))) {
          inputValue.value = "";
          return;
        }
      }

      const exactMatch = props.recipients.find(
        (r) => r.email.toLowerCase() === value.toLowerCase() && !r.isSelected
      );

      if (exactMatch) {
        processEmail(exactMatch.email);
        inputValue.value = "";
        return;
      }

      if (isValidEmail(value)) {
        processEmail(value);
        inputValue.value = "";
        return;
      }

      if (filteredOptions.value.length > 0) {
        handleSelect(filteredOptions.value[0].value);
        return;
      }

      toast.error("Please enter a valid email address");
    };

    const handleSelect = (value: string) => {
      if (value.startsWith("@")) {
        processDomain(value.substring(1));
      } else {
        processEmail(value);
      }
      inputValue.value = "";
    };

    const handleAddEmail = () => {
      if (!isValidEmail(inputValue.value)) {
        return toast.error("Please enter a valid email address");
      };
      processEmail(inputValue.value);
      inputValue.value = "";
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
