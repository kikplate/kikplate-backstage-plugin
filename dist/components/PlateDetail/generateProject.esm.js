const isRequiredFormValid = (formData, fields) => {
  return fields.filter((f) => f.required).every((f) => {
    const value = formData[f.name];
    if (f.type === "boolean") {
      return value === "true" || value === "false";
    }
    return value?.trim();
  });
};
const generateProject = async ({
  fetchApi,
  backendBaseUrl,
  plateSlug,
  formData,
  metadata
}) => {
  const values = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (!key.startsWith("module_")) {
      values[key] = value;
    }
  });
  if (metadata.modules) {
    Object.entries(metadata.modules).forEach(([moduleName]) => {
      const moduleKey = `module_${moduleName}`;
      values[`modules.${moduleName}.enabled`] = formData[moduleKey] === "true";
    });
  }
  const payload = { values };
  const endpoint = `${backendBaseUrl}/api/proxy/kikplate-api/generate/${encodeURIComponent(
    plateSlug
  )}`;
  const response = await fetchApi.fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generate failed (${response.status}): ${errorText}`);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${formData.projectName || plateSlug}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export { generateProject, isRequiredFormValid };
//# sourceMappingURL=generateProject.esm.js.map
