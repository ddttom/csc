/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
function extractPaths(obj, currentPath = '') {
  let folderAssets = [];
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && typeof value === 'object') {
      if (
        key === 'jcr:content' && value['jcr:primaryType'] === 'dam:AssetContent'
      ) {
        // We've found an asset, add its path to the folderAssets array
        folderAssets.push(currentPath);
      } else if (value['jcr:primaryType'] === 'sling:Folder') {
        // We've found a folder, recursively process it
        const newPath = `${currentPath}/${key}`;
        const subFolderAssets = extractPaths(value, newPath);
        // If the subfolder has assets, add it to window.dam
        if (subFolderAssets.length > 0) {
          window.dam.push([key, subFolderAssets]);
        }
      } else {
        // Continue traversing
        const subAssets = extractPaths(value, `${currentPath}/${key}`);
        folderAssets = folderAssets.concat(subAssets);
      }
    }
  });
  return folderAssets;
}

async function control() {
  window.dam = [];
  const urlString = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets.-1.json';
  const username = 'admin';
  const password = 'admin';
  const auth = `Basic ${btoa(`${username}:${password}`)}`;

  try {
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    }
    const data = await response.json();
    extractPaths(data);

    const finalString = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets';

    // Iterate over window.dam and prepend finalString to each image path in the inner arrays
    window.dam = window.dam.map((folder) => {
      // Check if the current element is an array
      if (Array.isArray(folder)) {
        // Map over each inner array (starting from the second element) within the current folder
        return folder.map((subArray, index) => {
          // Only modify elements that are arrays (ignoring the first element if it's not)
          if (index !== 0 && Array.isArray(subArray)) {
            return subArray.map((imagePath) => finalString + imagePath);
          }
          return subArray;
        });
      }
      return folder;
    });

    window.cmsplus.debug(JSON.stringify(window.dam));
  } catch (error) {
    console.error('Error fetching data', error);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function fetchImageAsBase64(url) {
  const username = 'admin';
  const password = 'admin';
  const basicAuth = btoa(`${username}:${password}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  return blobToBase64(blob);
}

export async function updateDynamicImage(className, imageNumber) {
  const dynamicElement = document.querySelector(className);
  const newDivElement = document.createElement('div');
  const newImgElement = document.createElement('img');

  try {
    const imageUrl = window.dam[0][1][imageNumber];
    const base64Image = await fetchImageAsBase64(imageUrl);
    newImgElement.src = `data:image/jpeg;base64,${base64Image}`;
    newDivElement.appendChild(newImgElement);
    dynamicElement.innerHTML = '';
    dynamicElement.appendChild(newDivElement);
  } catch (error) {
    console.error('Error fetching or processing image:', error);
  }
}

control();
