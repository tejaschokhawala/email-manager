import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SelectedRecipients from "../SelectedRecipients.vue";
import type { Recipient } from "../../types/types";

vi.mock("vue-toastification", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

describe("SelectedRecipients.vue", () => {
  let wrapper: any;
  let mockRecipients: Recipient[];

  beforeEach(() => {
    mockRecipients = [
      { email: "test@example.com", isSelected: true },
      { email: "user@example.com", isSelected: true },
      { email: "person@different.org", isSelected: true },
      { email: "not-selected@example.com", isSelected: false },
    ];

    wrapper = mount(SelectedRecipients, {
      props: {
        recipients: mockRecipients,
      },
      global: {
        stubs: {
          MailOutlined: true,
          UserOutlined: true,
          DownOutlined: true,
          DeleteOutlined: true,
          "a-tag": {
            template: '<span class="tag"><slot /></span>',
          },
          "a-divider": true,
        },
      },
    });
  });

  it("renders properly", () => {
    expect(wrapper.find(".selected-recipients").exists()).toBe(true);
    expect(wrapper.find("h3").text()).toBe("Selected Recipients");
  });

  it("filters only selected recipients", () => {
    const selectedCount = wrapper.vm.selectedRecipients.length;
    expect(selectedCount).toBe(3);
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

  it("emits remove-recipient when Remove icon is clicked", async () => {
    await wrapper.findAll(".domain-header")[0].trigger("click");

    const removeIcon = wrapper.findAll(".remove-icon")[0];
    await removeIcon.trigger("click");

    expect(wrapper.emitted("remove-recipient")).toBeTruthy();
    expect(wrapper.emitted("remove-recipient")[0][0].length).toBe(1);
  });

  it('emits remove-recipient for all domain emails when "Remove All" is clicked', async () => {
    const removeAllBtn = wrapper.findAll(".remove-all")[0];
    await removeAllBtn.trigger("click");

    expect(wrapper.emitted("remove-recipient")).toBeTruthy();

    const emitted = wrapper.emitted("remove-recipient")[0][0];
    expect(emitted.length).toBe(2);
    expect(
      emitted.every(
        (r: Recipient) => r.email.endsWith("@example.com") && r.isSelected
      )
    ).toBe(true);
  });

  it("shows empty state when no selected recipients", async () => {
    const noneSelectedWrapper = mount(SelectedRecipients, {
      props: {
        recipients: [
          { email: "test@example.com", isSelected: false },
          { email: "user@different.org", isSelected: false },
        ],
      },
      global: {
        stubs: {
          MailOutlined: true,
          UserOutlined: true,
          DownOutlined: true,
          DeleteOutlined: true,
          "a-tag": true,
          "a-divider": true,
        },
      },
    });

    expect(noneSelectedWrapper.find(".empty-state").exists()).toBe(true);
    expect(noneSelectedWrapper.find(".empty-state").text()).toBe(
      "No selected recipients"
    );
  });
});
