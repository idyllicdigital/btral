if (document.readyState === 'complete') {
  main();
} else {
  document.addEventListener('readystatechange', function () {
    if (document.readyState === 'complete') {
      main();
    }
  });
}

function main() {
  const form = document.getElementById('form');
  form.addEventListener('submit', handleSubmit);

  const previewButton = document.getElementById('show-conversion');
  previewButton.addEventListener('click', handlePreview);

  form.addEventListener('change', function (event) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (data.blocklisturl && data.addresslistname) {
      previewButton.disabled = false;
    } else {
      previewButton.disabled = true;
    }
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const script = writeScript(data);

  const output = document.getElementById('output');
  output.innerHTML = `<pre><code>${script}</code></pre>`;
}

function writeScript({
  blocklisturl,
  addresslistname,
  syncinterval,
  storagepath,
}) {
  if (!blocklisturl || !addresslistname || !syncinterval) {
    handleError(new Error('Missing required fields'));
    return;
  }

  const btralinstance = window.location.origin;

  return `/system script
add name="${addresslistname}-sync" source={/tool fetch dst-path=${
    storagepath ? storagepath + '/' : ''
  }${addresslistname}_latest.rsc url="${btralinstance}/convert?url=${encodeURIComponent(
    blocklisturl,
  )}&listname=${encodeURIComponent(
    addresslistname,
  )}" mode=https; /ip firewall address-list remove [find where list="${addresslistname}"]; /import file-name=${
    storagepath ? storagepath + '/' : ''
  }${addresslistname}_latest.rsc; /file remove ${
    storagepath ? storagepath + '/' : ''
  }${addresslistname}_latest.rsc}
/system scheduler
add interval=${syncinterval} name="${addresslistname}-sync-schedule" start-date=Jan/01/2000 start-time=00:00:00 on-event=${addresslistname}-sync`;
}

function handlePreview(event) {
  event.preventDefault();

  const form = document.getElementById('form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  Object.assign(document.createElement('a'), {
    target: '_blank',
    rel: 'noopener noreferrer',
    href: `/convert?url=${encodeURIComponent(
      data.blocklisturl,
    )}&listname=${encodeURIComponent(data.addresslistname)}`,
  }).click();
}

function handleError(error) {
  const output = document.getElementById('output');
  output.innerHTML = `<p class="error">${error.message}</p>`;
}
