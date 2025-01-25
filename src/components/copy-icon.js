import { BaseHtmlElement } from "../common/BaseElement.js";
import { showSuccessMessage } from "./message.js";

const copyIconName = "copy-icon";

window.customElements.define(
  copyIconName,
  class CopyIcon extends BaseHtmlElement {
    static get observedAttributes() {
      return ["value"];
    }

    constructor() {
      super();
      this.attributesProps(CopyIcon.observedAttributes);
    }

    render() {
      return [
        this.el(
          "button",
          {
            key: "copy-button",
            className: "text-button",
            onclick: () => {
              navigator.clipboard.writeText(this.value);
              showSuccessMessage("复制成功");
            },
          },
          this.el("i", {
            key: "copy-icon",
            className: ["fa-solid", "fa-copy"].join(" "),
          }),
        ),
        this.el("style", {
          key: "style-element",
          textContent: `
            ${this.baseStyle}
          `,
        }),
      ];
    }
  },
);

export { copyIconName };
