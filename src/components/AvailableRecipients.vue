<template>
  <div class="available-recipients">
    <h3>Available Recipients</h3>
    <a-divider />

    <div v-if="groupedRecipients.length === 0" class="empty-state">
      No available recipients
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
            <span class="select-all" @click.stop="selectDomain(group.domain)">
              Select All
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
            @click="selectEmail(recipient)"
          > 
            <user-outlined />
            <span>{{ recipient.email }}</span>
            <plus-outlined class="add-icon" />
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
  PlusOutlined,
} from "@ant-design/icons-vue";
import { useToast } from "vue-toastification";
import type { Recipient } from "../types/types";
import { groupByCompany, getDomain } from "../utils/emailUtils";

export default defineComponent({
  name: "AvailableRecipients",
  components: {
    MailOutlined,
    UserOutlined,
    DownOutlined,
    PlusOutlined,
  },
  props: {
    recipients: {
      type: Array as () => Recipient[],
      required: true,
    },
  },
  emits: ["select-recipient"],
  setup(props, { emit }) {
    const toast = useToast();
    const { recipients } = toRefs(props);
    const expandedGroups = ref<Record<number, boolean>>({});

    // Filter out already selected recipients
    const availableRecipients = computed(() => {
      return recipients.value.filter((r) => !r.isSelected);
    });

    // Group available recipients by company domain
    const groupedRecipients = computed(() => {
      return groupByCompany(availableRecipients.value);
    });

    // Toggle expand/collapse of a group
    const toggleGroup = (index: number) => {
      expandedGroups.value[index] = !expandedGroups.value[index];
    };

    // Select a single email recipient
    const selectEmail = (recipient: Recipient) => {
      emit("select-recipient", [recipient]);
      toast.success(`${recipient.email} has been added`);
    };

    // Select all emails from a domain
    const selectDomain = (domain: string) => {
      const domainRecipients = availableRecipients.value.filter(
        (r) => getDomain(r.email) === domain
      );

      if (domainRecipients.length > 0) {
        emit("select-recipient", domainRecipients);
        toast.success(`All emails from ${domain} have been added`);
      }
    };

    return {
      availableRecipients,
      groupedRecipients,
      expandedGroups,
      toggleGroup,
      selectEmail,
      selectDomain,
    };
  },
});
</script>

<style scoped>
.available-recipients {
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

.select-all {
  font-size: 12px;
  color: #1890ff;
  margin-right: 10px;
}

.select-all:hover {
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
  cursor: pointer;
  transition: background-color 0.3s;
}

.email-item:hover {
  background-color: #f5f5f5;
}

.add-icon {
  margin-left: auto;
  color: #1890ff;
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

  .select-all {
    order: 3;
    margin-top: 8px;
    width: 100%;
  }
}
</style>

