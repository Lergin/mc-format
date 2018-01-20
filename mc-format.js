const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
    }

    .format_0 { color: var(--mc-format-0, #000); }
    .format_1 { color: var(--mc-format-1, #00A); }
    .format_2 { color: var(--mc-format-2, #0A0); }
    .format_3 { color: var(--mc-format-3, #0AA); }
    .format_4 { color: var(--mc-format-4, #A00); }
    .format_5 { color: var(--mc-format-5, #A0A); }
    .format_6 { color: var(--mc-format-6, #FA0); }
    .format_7 { color: var(--mc-format-7, #AAA); }
    .format_8 { color: var(--mc-format-8, #555); }
    .format_9 { color: var(--mc-format-9, #55F); }
    .format_a { color: var(--mc-format-a, #5F5); }
    .format_b { color: var(--mc-format-b, #5FF); }
    .format_c { color: var(--mc-format-c, #F55); }
    .format_d { color: var(--mc-format-d, #F5F); }
    .format_e { color: var(--mc-format-e, #FF5); }
    .format_f { color: var(--mc-format-f, #FFF); }

    mc-obfuscated-char { 
      display: inline-block;
      width: 1em;
      text-align: center;
    }
    .format_l { font-weight: bolder; }
    .format_m { text-decoration: line-through; }
    .format_n { text-decoration: underline; }
    .format_o { font-style: italic; }
  </style>
`;

class McFormat extends HTMLElement {
  static get observedAttributes() {
    return ['text'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  get text() {
    return this.getAttribute('text');
  }

  set text(text) {
    this.setAttribute('text', text);
  }

  attributeChangedCallback() {
    const text = this.text;

    while (this.shadowRoot.firstChild) { this.shadowRoot.removeChild(this.shadowRoot.firstChild); }
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    if(this.text){
      this.shadowRoot.appendChild(parseFormat(this.text));
    }
  }
}

function parseFormat(text){
  const span = document.createElement('span');

  text.split("&r").forEach(part => {
    span.appendChild(parseFormatWithoutResets(part));
  });

  return span;
}

function parseFormatWithoutResets(text, obfuscated=false) {
  const [head, ... tail] = text.split('&');

  const rest = "&" + tail.join("&");

  const span = document.createElement('span');
  
  if (head.length !== 0){
    if(obfuscated){
      for(let i = 0; i < head.length; i++){
        span.appendChild(document.createElement('mc-obfuscated-char'));
      }
    }else{
      const span2 = document.createElement('span');
      span2.innerHTML = head;
      span.appendChild(span2);
    }

    span.appendChild(parseFormatWithoutResets(rest, obfuscated));
    
    return span;
  }else if(rest.length > 1){
    const formatCode = rest[1];
    
    if(formatCode === "k"){
      obfuscated = true;
    }
    
    span.className = `format_${formatCode}`;
    const remainingText = rest.substring(2);
    span.appendChild(parseFormatWithoutResets(remainingText, obfuscated))

    return span;
  }else {
    return span;
  }
}

customElements.define('mc-format', McFormat);


class McObfuscatedChar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.randchanger = setInterval(() => {
      this.shadowRoot.innerHTML = String.fromCharCode(Math.random() * (95-64) + 64);
    }, 100);
  }

  disconnectedCallback() {
    clearInterval(this.randchanger);
  }
}

customElements.define('mc-obfuscated-char', McObfuscatedChar);
