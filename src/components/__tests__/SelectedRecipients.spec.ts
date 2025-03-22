import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AvailableRecipients from "../AvailableRecipients.vue";
import type { Recipient } from "../../types/types";

vi.mock("vue-toastification", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

describe("AvailableRecipients.vue", () => {
  let wrapper: any;
  let mockRecipients: Recipient[];

  beforeEach(() => {
    mockRecipients = [
      { email: "test1@example.com", isSelected: false },
      { email: "test2@example.com", isSelected: false },
      { email: "user@different.org", isSelected: false },
      { email: "selected@example.com", isSelected: true },
    ];

    wrapper = mount(AvailableRecipients, {
      props: {
        recipients: mockRecipients,
      },
      global: {
        stubs: {
          MailOutlined: true,
          UserOutlined: true,
          DownOutlined: true,
          PlusOutlined: true,
          "a-tag": {
            template: '<span class="tag"><slot /></span>',
          },
          "a-divider": true,
        },
      },
    });
  });

  it("renders properly", () => {
    expect(wrapper.find(".available-recipients").exists()).toBe(true);
    expect(wrapper.find("h3").text()).toBe("Available Recipients");
  });

  it("filters out selected recipients", () => {
    const availableCount = wrapper.vm.availableRecipients.length;
    expect(availableCount).toBe(3);
  });

  it("groups recipients by domain", () => {
    const groups = wrapper.vm.groupedRecipients;
    expect(groups.length).toBe(2);

    const exampleGroup = groups.find((g: any) => g.domain === "example.com");
    expect(exampleGroup).toBeDefined();
    expect(exampleGroup.emails.length).toBe(2);
  });

  it("toggles group expansion", async () => {
    expect(wrapper.vm.expandedGroups[0]).toBeFalsy();

    const domainHeader = wrapper.findAll(".domain-header")[0];
    await domainHeader.trigger("click");

    expect(wrapper.vm.expandedGroups[0]).toBe(true);

    await domainHeader.trigger("click");
    expect(wrapper.vm.expandedGroups[0]).toBe(false);
  });

  it("emits select-recipient when an email is selected", async () => {
    await wrapper.findAll(".domain-header")[0].trigger("click");

    const emailItem = wrapper.findAll(".email-item")[0];
    await emailItem.trigger("click");

    expect(wrapper.emitted("select-recipient")).toBeTruthy();
    expect(wrapper.emitted("select-recipient")[0][0].length).toBe(1);
    expect(wrapper.emitted("select-recipient")[0][0][0].email).toBe(
      "test1@example.com"
    );
  });

  it('emits select-recipient for all domain emails when "Select All" is clicked', async () => {
    const selectAllBtn = wrapper.findAll(".select-all")[0];
    await selectAllBtn.trigger("click");

    expect(wrapper.emitted("select-recipient")).toBeTruthy();
    expect(wrapper.emitted("select-recipient")[0][0].length).toBe(2); // Both unselected example.com emails
  });

  it("shows empty state when no available recipients", async () => {
    const allSelectedWrapper = mount(AvailableRecipients, {
      props: {
        recipients: [
          { email: "test@example.com", isSelected: true },
          { email: "user@different.org", isSelected: true },
        ],
      },
      global: {
        stubs: {
          MailOutlined: true,
          UserOutlined: true,
          DownOutlined: true,
          PlusOutlined: true,
          "a-tag": true,
          "a-divider": true,
        },
      },
    });

    expect(allSelectedWrapper.find(".empty-state").exists()).toBe(true);
    expect(allSelectedWrapper.find(".empty-state").text()).toBe(
      "No available recipients"
    );
  });
});
