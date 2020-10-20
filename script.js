const utapi = {};

utapi.input = (form) => {
  const url = form.getAttribute('data-spreadsheet-api');

  const enable_form = (enabled) => {
    const elements = form.querySelectorAll('[type=submit]');
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (enabled) {
        element.removeAttribute('disabled');
      } else {
        element.setAttribute('disabled', 'disabled');
      }
    }
  };


  form.addEventListener('submit', async (e) => {
    enable_form(false);

    e.preventDefault();
    const formData = new FormData(form);
    const entries = Array.from(formData);
    const data = {};
    entries.forEach(([k, v]) => {
      data[k] = v;
    });

    form.querySelectorAll('[type=submit]');

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((r) => r.json());

    document.dispatchEvent(new Event('form-submitted', {
      response,
    }));

    enable_form(true);
    form.reset();
  });
};

utapi.output = async (element) => {
  // Extract data from element
  const url = element.getAttribute('data-spreadsheet-api');
  let text = element.innerHTML;
  if (element.hasAttribute('data-spreadsheet-api-initial-text') === false) {
    element.setAttribute('data-spreadsheet-api-initial-text', text);
  } else {
    text = element.getAttribute('data-spreadsheet-api-initial-text');
  }
  element.innerHTML = '<div class="fa fa-spinner w3-spin flex-center" style="font-size:64px"></div>';

  let data = await fetch(url).then((r) => r.json());

  if (!Array.isArray(data)) {
    data = [data];
  }

  const replacement = data.map((object) => {
    Object.keys(object).forEach((k) => {
      object[k.trim()] = object[k];
    });

    return text.replace(/{{([^{}]*)}}/g, (match, key) => object[key.trim()]);
  });
  element.innerHTML = replacement.join('');
};

utapi.render = async () => {
  const elements = document.querySelectorAll('[data-spreadsheet-api]');
  const promises = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.tagName === 'FORM') {
      utapi.input(element);
    } else {
      promises.push(utapi.output(element));
    }
  }

  return Promise.all(promises);
};


document.addEventListener('DOMContentLoaded', utapi.render);
// rebuild4