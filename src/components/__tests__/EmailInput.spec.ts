import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import EmailInput from "../EmailInput.vue";
import type { Recipient } from "../../types/types";

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock("vue-toastification", () => ({
  useToast: () => mockToast,
}));

describe("EmailInput.vue", () => {
  let wrapper: any;
  let mockRecipients: Recipient[];

  beforeEach(() => {
    mockRecipients = [
      { email: "test@example.com", isSelected: false },
      { email: "user@example.com", isSelected: false },
      { email: "person@different.org", isSelected: true },
    ];

    wrapper = mount(EmailInput, {
      props: {
        recipients: mockRecipients,
      },
      global: {
        stubs: {
          "a-auto-complete": {
            template:
              '<div class="auto-complete"><slot></slot><div class="options"></div></div>',
            props: ["options", "value"],
            emits: ["select", "update:value"],
          },
          "a-input": {
            template:
              '<div class="input"><input :value="value" @input="$emit(\'update:value\', $event.target.value)" @keypress.enter="$emit(\'pressEnter\')" /><slot name="prefix"></slot></div>',
            props: ["value", "placeholder", "allow-clear"],
            emits: ["update:value", "pressEnter", "input"],
          },
          UserOutlined: true,
          "a-button": {
            template:
              '<button :type="type" :disabled="disabled" @click="$emit(\'click\')">{{ $slots.default || "Add" }}</button>',
            props: ["disabled", "type"],
            emits: ["click"],
          },
        },
      },
    });
  });

  it("renders properly", () => {
    expect(wrapper.find(".email-input-container").exists()).toBe(true);
    expect(wrapper.find(".auto-complete").exists()).toBe(true);
  });

  it("emits add-email event when Enter is pressed with valid email", async () => {
    const input = wrapper.find("input");
    await input.setValue("newuser@domain.com");

    await input.trigger("input");

    await input.trigger("keypress", { key: "Enter" });

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("add-email")).toBeTruthy();
    expect(wrapper.emitted("add-email")[0]).toEqual(["newuser@domain.com"]);
  });

  it("validates email format correctly", async () => {
    const input = wrapper.find("input");

    await input.setValue("invalid-email");
    await input.trigger("input");
    expect(wrapper.vm.isValidInput).toBe(false);

    await input.setValue("valid@email.com");
    await input.trigger("input");
    expect(wrapper.vm.isValidInput).toBe(true);
  });

  it("shows error toast for invalid emails when Enter is pressed", async () => {
    const input = wrapper.find("input");

    mockToast.error.mockReset();

    await input.setValue("invalid-email");
    await input.trigger("input");
    await input.trigger("keypress", { key: "Enter" });

    expect(mockToast.error).toHaveBeenCalledWith(
      "Please enter a valid email address"
    );
    expect(wrapper.emitted("add-email")).toBeFalsy();
  });

  it("handles selection from autocomplete", async () => {
    await wrapper.vm.handleSelect("test@example.com");

    expect(wrapper.emitted("select-recipient")).toBeTruthy();
    expect(wrapper.emitted("select-recipient")[0][0]).toEqual([
      mockRecipients[0],
    ]);

    expect(wrapper.vm.inputValue).toBe("");
  });

  it("handles domain selection from autocomplete", async () => {
    await wrapper.vm.handleSelect("@example.com");

    expect(wrapper.emitted("select-recipient")).toBeTruthy();

    const emitted = wrapper.emitted("select-recipient")[0][0];
    expect(emitted.length).toBe(2);
    expect(emitted[0].email).toBe("test@example.com");
    expect(emitted[1].email).toBe("user@example.com");
  });

  it("handles adding a new email that doesn't exist in recipients", async () => {
    const input = wrapper.find("input");
    await input.setValue("brand.new@email.com");
    await input.trigger("input");
    await input.trigger("keypress", { key: "Enter" });

    expect(wrapper.emitted("add-email")).toBeTruthy();
    expect(wrapper.emitted("add-email")[0][0]).toBe("brand.new@email.com");
  });

  it("computes filtered options correctly", async () => {
    wrapper.vm.inputValue = "example";

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredOptions.length).toBe(3);

    const domainOption = wrapper.vm.filteredOptions.find(
      (o: any) => o.value === "@example.com"
    );
    expect(domainOption).toBeTruthy();
    expect(domainOption.label).toBe("All emails from example.com");
  });
});
