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
      const newPath = `${currentPath}/${key}`;
      if (key === 'jcr:content' && value['jcr:primaryType'] === 'dam:AssetContent') {
        files.push(currentPath);
      } else if (value['jcr:primaryType'] === 'sling:Folder') {
        folders.push(newPath);
        const { files: subFiles, folders: subFolders } = extractPaths(value, newPath);
        if (subFiles.length > 0) {
          files.push(subFiles);
        }
        folders = folders.concat(subFolders);
      } else {
        const { files: subFiles, folders: subFolders } = extractPaths(value, newPath);
        files = files.concat(subFiles);
        folders = folders.concat(subFolders);
      }
    }
  });

  window.dam = {
    folders: [],
    files: [],
  };
  // Update window.dam
  window.dam.folders = folders.map((folder) => folder.split('/').pop());
  window.dam.files = files;
  window.dam.files = window.dam.files.filter((subArray) => subArray.length > 0);
}

// Initialize the window.dam object
function control() {
  const urlString = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets.-1.json';
  const username = 'admin';
  const password = 'admin';
  const auth = `Basic ${btoa(`${username}:${password}`)}`;

  return fetch(urlString, {
    method: 'GET',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    mode: 'cors',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      window.cmsplus.debug('json captured');
      extractPaths(data);
      window.cmsplus.debug('paths extracted');

      const urlParams = new URLSearchParams(window.location.search);
      const aiParam = urlParams.get('ai');
      if (aiParam !== null) {
        const numericValue = parseFloat(aiParam);
        if (!Number.isNaN(numericValue)) {
          const targetString = `/version_${numericValue.toString().padStart(2, '0')}`;
          window.dam.sequence = window.dam.folders.indexOf(targetString);
          window.cmsplus.debug(`Sequence fixed=${window.dam.sequence}`);
        }
      } else {
        window.dam.sequence = Math.floor(Math.random() * window.dam.folders.length);
        window.cmsplus.debug(`Sequence randomized=${window.dam.sequence}`);
      }

      const finalString = 'http://localhost:4502/content/dam/comwrap-uk-demo-assets/csc-demo-eds-assets';

      window.dam.files = window.dam.files.map((folderFiles) => folderFiles.map((imagePath) => finalString + imagePath));
      window.dam.folders = window.dam.folders.map((folderName) => `${finalString}/${folderName}`);
      window.cmsplus.debug(JSON.stringify(window.dam));

      // Dispatch an event to signal that the data is ready
      window.cmsplus.debug('damDataReady Event Fired');
      window.dispatchEvent(new Event('damDataReady'));
    })
    .catch((error) => {
      console.error('Error fetching data', error);
    });
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
