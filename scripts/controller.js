/* eslint-disable import/prefer-default-export */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
function extractPaths(obj, currentPath = '') {
  let folderAssets = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (key === 'jcr:content' && obj[key]['jcr:primaryType'] === 'dam:AssetContent') {
        // We've found an asset, add its path to the folderAssets array
        folderAssets.push(currentPath);
      } else if (obj[key]['jcr:primaryType'] === 'sling:Folder') {
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
export async function control() {
  window.dam = [];
  const urlString = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets.4.json';

  const username = 'admin';
  const password = 'admin';

  // Encode the username and password
  const credentials = btoa(`${username}:${password}`);
  try {
    const response = await fetch(urlString, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    window.dam = [];
    extractPaths(data);
  } catch (error) {
    console.error('Error fetching or processing the data:', error);
  }
}

window.cmsplus.callbackPageLoadChain.push(control);
