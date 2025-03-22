import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import EmailManager from "../EmailManager.vue";
import { recipientsData } from "../../types/recipients";

describe("EmailManager Component", () => {
  it("renders correctly", () => {
    const wrapper = mount(EmailManager);
    expect(wrapper.exists()).toBe(true);
  });

  it("adds a new email", () => {
    const wrapper = mount(EmailManager);
    wrapper.vm.addEmail("newuser@example.com");
    expect(wrapper.vm.recipients).toContainEqual({
      email: "newuser@example.com",
      isSelected: true,
    });
  });

  it("does not add duplicate emails but selects them", () => {
    const wrapper = mount(EmailManager);
    wrapper.vm.addEmail(recipientsData[0].email);
    const index = wrapper.vm.recipients.findIndex(
      (r) => r.email === recipientsData[0].email
    );
    expect(wrapper.vm.recipients[index].isSelected).toBe(true);
  });

  it("selects existing recipients", () => {
    const wrapper = mount(EmailManager);
    const testRecipient = { email: "selected@example.com", isSelected: false };
    wrapper.vm.recipients.push(testRecipient);
    wrapper.vm.selectRecipient([testRecipient]);
    expect(
      wrapper.vm.recipients.find((r) => r.email === testRecipient.email)
        ?.isSelected
    ).toBe(true);
  });

  it("removes selected recipients", () => {
    const wrapper = mount(EmailManager);
    const testRecipient = { email: "remove@example.com", isSelected: true };
    wrapper.vm.recipients.push(testRecipient);
    wrapper.vm.removeRecipient([testRecipient]);
    expect(
      wrapper.vm.recipients.find((r) => r.email === testRecipient.email)
        ?.isSelected
    ).toBe(false);
  });
});
