/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
function extractPaths(obj, currentPath = '') {
  let files = [];
  let folders = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && typeof value === 'object') {
      if (key === 'jcr:content' && value['jcr:primaryType'] === 'dam:AssetContent') {
        // We've found an asset, add its path to the files array
        files.push(currentPath);
      } else if (value['jcr:primaryType'] === 'sling:Folder') {
        // We've found a folder, add it to folders array and recursively process it
        folders.push(key);
        const newPath = `${currentPath}/${key}`;
        const { files: subFiles, folders: subFolders } = extractPaths(value, newPath);
        // Add subFiles to window.dam.files
        if (subFiles.length > 0) {
          window.dam.files.push(subFiles);
        }
        // Add subFolders to window.dam.folders
        folders = folders.concat(subFolders);
      } else {
        // Continue traversing
        const { files: subFiles, folders: subFolders } = extractPaths(value, `${currentPath}/${key}`);
        files = files.concat(subFiles);
        folders = folders.concat(subFolders);
      }
    }
  });

  return { files, folders };
}

window.dam = { folders: [], files: [] };

async function control() {
  window.dam = {};
  const urlParams = new URLSearchParams(window.location.search);
  const aiParam = urlParams.get('ai');
  if (aiParam !== null) {
    const numericValue = parseFloat(aiParam);
    if (!Number.isNaN(numericValue)) {
      const targetString = `version_${numericValue.toString().padStart(2, '0')}`;
      window.dam.sequence = window.dam.folders.indexOf(targetString);
    }
  }
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

    // Refactored subroutine
    window.dam.files = window.dam.files.map((folderFiles) => folderFiles.map((imagePath) => finalString + imagePath));

    // If you need to modify the folders array as well, you can do:
    window.dam.folders = window.dam.folders.map((folderName) => `${finalString}/${folderName}`);
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
  let sequence = 0;
  if (window.dam.sequence) {
    sequence = window.dam.sequence;
  } else {
    sequence = Math.floor(Math.random() * window.dam.folders.length);
  }
  const dynamicElement = document.querySelector(`${className} > picture`);
  const newImgElement = document.createElement('img');

  try {
    const imageUrl = window.dam.files[sequence][imageNumber];
    const base64Image = await fetchImageAsBase64(imageUrl);
    newImgElement.src = `data:image/jpeg;base64,${base64Image}`;
    dynamicElement.innerHTML = '';
    dynamicElement.appendChild(newImgElement);
  } catch (error) {
    console.error('Error fetching or processing image:', error);
  }
}

control();
