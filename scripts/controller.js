function extractPaths(obj, currentPath = "") {
  let folderAssets = [];
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (
        key === "jcr:content" &&
        obj[key]["jcr:primaryType"] === "dam:AssetContent"
      ) {
        // We've found an asset, add its path to the folderAssets array
        folderAssets.push(currentPath);
      } else if (obj[key]["jcr:primaryType"] === "sling:Folder") {
        // We've found a folder, recursively process it
        const newPath = `${currentPath}/${key}`;
        const subFolderAssets = extractPaths(obj[key], newPath);
        // If the subfolder has assets, add it to window.dam
        if (subFolderAssets.length > 0) {
          window.dam.push([key, subFolderAssets]);
        }
      } else {
        // Continue traversing
        const subAssets = extractPaths(obj[key], `${currentPath}/${key}`);
        folderAssets = folderAssets.concat(subAssets);
      }
    }
  }
  return folderAssets;
}

async function control() {
  window.dam = [];
  const urlString =
    "http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets.-1.json";
  const username = "admin";
  const password = "admin";
  const auth = "Basic " + btoa(username + ":" + password);

  try {
    const response = await fetch(urlString, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    });

    console.log("Response Headers:", response.headers);
    console.log("Response Status:", response.status);

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    extractPaths(data);
    console.log(window.dam);
  } catch (error) {
    console.error("Error fetching data", error);
  }
}
control();
