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
  btralinstance,
  storagepath,
}) {
  if (
    !blocklisturl ||
    !addresslistname ||
    !syncinterval ||
    !btralinstance
  ) {
    handleError(new Error('Missing required fields'));
    return;
  }

  return `/system script
add name="${addresslistname}-sync" source={/tool fetch dst-path=${storagepath ? storagepath + '/' : ''}${addresslistname}_latest.rsc url="${btralinstance}/convert?url=${encodeURIComponent(
    blocklisturl,
  )}&listname=${encodeURIComponent(addresslistname)}" mode=https; /ip firewall address-list remove [find where list="${addresslistname}"]; /import file-name=${storagepath ? storagepath + '/' : ''}${addresslistname}_latest.rsc; /file remove ${storagepath ? storagepath + '/' : ''}${addresslistname}_latest.rsc}
/system scheduler
add interval=${syncinterval} name="${addresslistname}-sync-schedule" start-date=Jan/01/2000 start-time=00:00:00 on-event=${addresslistname}-sync`;
}

function handleError(error) {
  const output = document.getElementById('output');
  output.innerHTML = `<p class="error">${error.message}</p>`;
}
