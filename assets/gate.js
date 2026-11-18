/* Password gate: decrypts assets/secure.js (AES-256-GCM, PBKDF2-SHA256) in the browser. */
(function () {
  "use strict";
  const E = window.ENCRYPTED;
  const KEY_STORE = "aiclub:key";
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const $ = (id) => document.getElementById(id);

  async function deriveKey(password) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64(E.salt), iterations: E.iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }

  async function decryptWith(key) {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(E.iv) }, key, b64(E.data));
    return new TextDecoder().decode(plain);
  }

  function run(code) {
    document.body.classList.remove("locked");
    $("gate").remove();
    const s = document.createElement("script");
    s.textContent = code;
    document.body.appendChild(s);
  }

  function saved() { try { return JSON.parse(localStorage.getItem(KEY_STORE) || "null"); } catch (e) { return null; } }
  function save(v) { try { v ? localStorage.setItem(KEY_STORE, JSON.stringify(v)) : localStorage.removeItem(KEY_STORE); } catch (e) { /* ignore */ } }

  async function tryRemembered() {
    const s = saved();
    if (!s || s.salt !== E.salt) return false;          // password/content changed since
    try {
      const key = await crypto.subtle.importKey("raw", b64(s.key), "AES-GCM", false, ["decrypt"]);
      run(await decryptWith(key));
      return true;
    } catch (e) { save(null); return false; }
  }

  async function unlock(ev) {
    ev.preventDefault();
    const btn = $("gate-btn"), err = $("gate-err");
    btn.disabled = true; btn.textContent = "Unlocking…"; err.textContent = "";
    try {
      const key = await deriveKey($("gate-pw").value);
      const code = await decryptWith(key);
      if ($("gate-remember").checked) save({ salt: E.salt, key: toB64(await crypto.subtle.exportKey("raw", key)) });
      run(code);
    } catch (e) {
      err.textContent = "Incorrect password.";
      btn.disabled = false; btn.textContent = "Unlock";
      $("gate-pw").select();
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    $("lock").addEventListener("click", () => { save(null); location.reload(); });
    if (!window.crypto || !crypto.subtle) {
      $("gate-err").textContent = "This browser can’t unlock the page. Please open it over https in an up-to-date browser.";
      return;
    }
    if (await tryRemembered()) return;
    $("gate-form").addEventListener("submit", unlock);
  });
})();
