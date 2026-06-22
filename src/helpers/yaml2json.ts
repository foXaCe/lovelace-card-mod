const _load_yaml2json = async () => {
  if (customElements.get("developer-tools-event")) return;

  try {
    await customElements.whenDefined("partial-panel-resolver");
    const ppr: any = document.createElement("partial-panel-resolver");

    ppr.hass = {
      panels: [
        {
          url_path: "tmp",
          component_name: "config",
        },
      ],
    };
    ppr._updateRoutes();

    await ppr.routerOptions.routes.tmp.load();
    await customElements.whenDefined("ha-panel-config");
    const hpc: any = document.createElement("ha-panel-config");
    await hpc.routerOptions.routes["developer-tools"]?.load();
    await customElements.whenDefined("developer-tools-router");
    const dtr: any = document.createElement("developer-tools-router");
    await dtr.routerOptions.routes.event.load();
  } catch (err) {
    console.error("CARD-MOD: Error loading yaml2json:", err);
  }
};

export const yaml2json = async (yaml: string) => {
  await _load_yaml2json();
  const el: any = document.createElement("ha-yaml-editor");

  // ha-yaml-editor._onChange() builds an error message through a localize()
  // function when the YAML is invalid. Older HA reads it from `this.hass`,
  // newer HA from the `_i18n` context - which is undefined on a detached
  // element. Stub both so the error path never throws on a missing context.
  const localize = () => "Invalid YAML";
  el.hass = { localize };
  el._i18n = { localize };

  // _onChange is a private HA API; guard against any future change so a parse
  // failure degrades to an empty style instead of an uncaught exception.
  try {
    el._onChange(new CustomEvent("yaml", { detail: { value: yaml } }));
  } catch (err) {
    console.error("CARD-MOD: Error parsing theme yaml:", yaml, err);
    return {};
  }

  if (!el.isValid) {
    console.error("CARD-MOD: Error loading theme yaml:", yaml);
    return {};
  }
  return el.value;
};
