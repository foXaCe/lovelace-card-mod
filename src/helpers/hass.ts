import { Unpromise } from "@watchable/unpromise";
import type { HomeAssistant } from "custom-card-helpers";

export async function hass_base_el() {
  await Unpromise.race([
    customElements.whenDefined("home-assistant"),
    customElements.whenDefined("hc-main"),
  ]);

  const element = customElements.get("home-assistant")
    ? "home-assistant"
    : "hc-main";

  while (!document.querySelector(element))
    await new Promise((r) => window.setTimeout(r, 100));
  return document.querySelector(element);
}

export async function hass(): Promise<HomeAssistant> {
  const base = (await hass_base_el()) as unknown as { hass?: HomeAssistant };
  while (!base.hass) await new Promise((r) => window.setTimeout(r, 100));
  return base.hass!;
}
