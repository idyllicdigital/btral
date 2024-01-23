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

function writeScript({ blocklisturl, addresslistname, syncinterval, btralinstance }) {
  if (!blocklisturl || !addresslistname || !syncinterval || !btralinstance) {
    handleError(new Error('Missing required fields'));
    return;
  }

  return `/system script
add name="${addresslistname}-download" source={/tool fetch dst-path=sd1/${addresslistname}_latest.rsc url="${btralinstance}/convert/?url=${encodeURIComponent(blocklisturl)}" mode=https}
add name="${addresslistname}-sync" source {/ip firewall address-list remove [find where list="${addresslistname}"]; /import file-name=sd1/${addresslistname}_latest.rsc; /file remove sd1/${addresslistname}_latest.rsc}
/system scheduler
add interval=${syncinterval} name="dl-${addresslistname}" start-date=Jan/01/2000 start-time=00:05:00 on-event=${addresslistname}-download
add interval=${syncinterval} name="ins-${addresslistname}" start-date=Jan/01/2000 start-time=00:10:00 on-event=${addresslistname}-sync`;
}

function handleError(error) {
  const output = document.getElementById('output');
  output.innerHTML = `<p class="error">${error.message}</p>`;
}
