/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
function extractPaths(data) {
  window.dam = { folders: [], files: [] };
  const filesByFolder = {};

  function traverse(obj, currentPath = '') {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== null && typeof value === 'object') {
        const newPath = `${currentPath}/${key}`;
        if (value['jcr:primaryType'] === 'sling:Folder') {
          window.dam.folders.push(key);
          traverse(value, newPath);
        } else if (key === 'jcr:content' && value['jcr:primaryType'] === 'dam:AssetContent') {
          const folder = currentPath.split('/').slice(0, -1).join('/');
          if (!filesByFolder[folder]) {
            filesByFolder[folder] = [];
          }
          filesByFolder[folder].push(currentPath);
        } else {
          traverse(value, newPath);
        }
      }
    });
  }
  traverse(data);
  // Remove duplicates from folders
  window.dam.folders = [...new Set(window.dam.folders)];
  window.dam.files = Object.values(filesByFolder);
}

// Initialize the window.dam object
async function control() {
  const DEFAULT_URL = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets';

  const USERNAME = 'admin';
  const PASSWORD = 'admin';

  const baseUrl = window.siteConfig?.['$meta:cscurl$'] || DEFAULT_URL;
  const urlString = `${baseUrl}.-1.json`;

  const auth = `Basic ${btoa(`${USERNAME}:${PASSWORD}`)}`;

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
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    window.cmsplus.debug('JSON captured');
    extractPaths(data);
    window.cmsplus.debug('Paths extracted');

    window.cmsplus.debug(JSON.stringify(window.dam));
  } catch (error) {
    console.error('Error fetching data:', error);
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
  window.cmsplus.debug('fetchImage');
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
  window.cmsplus.debug('image fetched');
  return blobToBase64(blob);
}
export async function updateDynamicImage(className, imageNumber) {
  const dynamicElement = document.querySelector(`${className} > picture`);
  const newImgElement = document.createElement('img');

  try {
    const imageUrl = window.dam.files[window.dam.sequence][imageNumber];
    const base64Image = await fetchImageAsBase64(imageUrl);
    newImgElement.src = `data:image/jpeg;base64,${base64Image}`;
    dynamicElement.innerHTML = '';
    dynamicElement.appendChild(newImgElement);
    window.cmsplus.debug('image swapped');
  } catch (error) {
    console.error('Error fetching or processing image:', error);
  }
}

control();
