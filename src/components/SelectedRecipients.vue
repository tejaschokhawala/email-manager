<template>
  <div class="selected-recipients">
    <h3>Selected Recipients</h3>
    <a-divider />

    <div v-if="groupedRecipients.length === 0" class="empty-state">
      No selected recipients
    </div>

    <div v-else class="recipients-list">
      <div
        v-for="(group, index) in groupedRecipients"
        :key="group.domain"
        class="domain-group"
      >
        <div class="domain-header" @click="toggleGroup(index)">
          <div class="domain-title">
            <mail-outlined />
            <span>{{ group.domain }}</span>
            <a-tag>{{ group.emails.length }}</a-tag>
          </div>
          <div class="domain-actions">
            <span class="remove-all" @click.stop="removeDomain(group.domain)">
              Remove All
            </span>
            <down-outlined
              :class="{
                expanded: expandedGroups[index],
                collapsed: !expandedGroups[index],
              }"
            />

          </div>
        </div>

        <div v-show="expandedGroups[index]" class="email-list">
          <div
            v-for="recipient in group.emails"
            :key="recipient.email"
            class="email-item"
          >
            <user-outlined />
            <span>{{ recipient.email }}</span>
            <delete-outlined
              class="remove-icon"
              @click="removeEmail(recipient)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs, ref } from "vue";
import {
  MailOutlined,
  UserOutlined,
  DownOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { useToast } from "vue-toastification";
import type { Recipient } from "../types/types";
import { groupByCompany, getDomain } from "../utils/emailUtils";

export default defineComponent({
  name: "SelectedRecipients",
  components: {
    MailOutlined,
    UserOutlined,
    DownOutlined,
    DeleteOutlined,
  },
  props: {
    recipients: {
      type: Array as () => Recipient[],
      required: true,
    },
  },
  emits: ["remove-recipient"],
  setup(props, { emit }) {
    const toast = useToast();
    const { recipients } = toRefs(props);
    const expandedGroups = ref<Record<number, boolean>>({});

    const selectedRecipients = computed(() => {
      return recipients.value.filter((r) => r.isSelected);
    });

    const groupedRecipients = computed(() => {
      return groupByCompany(selectedRecipients.value);
    });

    const toggleGroup = (index: number) => {
      expandedGroups.value[index] = !expandedGroups.value[index];
    };

    const removeEmail = (recipient: Recipient) => {
      emit("remove-recipient", [recipient]);
      toast.info(`${recipient.email} has been removed`);
    };

    const removeDomain = (domain: string) => {
      const domainRecipients = selectedRecipients.value.filter(
        (r) => getDomain(r.email) === domain
      );

      if (domainRecipients.length > 0) {
        emit("remove-recipient", domainRecipients);
        toast.info(`All emails from ${domain} have been removed`);
      }
    };

    return {
      selectedRecipients,
      groupedRecipients,
      expandedGroups,
      toggleGroup,
      removeEmail,
      removeDomain,
    };
  },
});
</script>

<style scoped>
.selected-recipients {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fff;
  height: 100%;
}

.recipients-list {
  max-height: 400px;
  overflow-y: auto;
}

.domain-group {
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.domain-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fafafa;
  cursor: pointer;
  border-radius: 4px;
}

.domain-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-all {
  font-size: 12px;
  color: #ff4d4f;
  margin-right: 10px;
}

.remove-all:hover {
  text-decoration: underline;
}

.email-list {
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

.email-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.remove-icon {
  margin-left: auto;
  color: #ff4d4f;
  cursor: pointer;
}

.expanded {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.collapsed {
  transform: rotate(0deg);
  transition: transform 0.3s;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #bfbfbf;
}

@media (max-width: 768px) {
  .recipients-list {
    max-height: 300px;
  }

  .domain-header {
    flex-wrap: wrap;
  }

  .remove-all {
    order: 3;
    margin-top: 8px;
    width: 100%;
  }
}
</style>
