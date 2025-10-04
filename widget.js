// custom-widget.js
(function() {
  console.log("✅ Custom script loaded successfully!");

  // Example: add a floating button
  const button = document.createElement('button');
  button.innerText = "Click Me!";
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 20px';
  button.style.background = '#007bff';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';

  button.addEventListener('click', () => {
    alert("Hello from your custom script!");
  });

  document.body.appendChild(button);
})();
