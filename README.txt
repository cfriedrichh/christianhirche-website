Christian Hirche — static website

This is the current website, including the animated 3D frequency spectrum.
No build step, Node.js, database, or backend is required.

Publishing
1. Extract this ZIP.
2. Upload index.html, style.css, app.js and the assets folder together into
   the document root of your static website. Keep the folder structure intact.
3. Configure your static host to serve index.html as the default document.
4. Open the hosted HTTP(S) URL. JavaScript files must be served with a
   JavaScript MIME type (for example text/javascript).

Uploading to a normal Nextcloud file share alone does not serve a website.
Use your configured static hosting integration or web server for the folder.

All paths are relative, so the site also works in a subdirectory.
For local preview, serve the extracted folder over HTTP; opening index.html
via file:// may block the JavaScript modules. For example, if Python is
installed: python3 -m http.server 8000
Then visit http://localhost:8000.

Contents
index.html — page content and links
style.css — layout, colours and responsive styling
app.js — publication list and Three.js spectrum animation
assets/ — portrait, Scalerò image and bundled Three.js modules

Three.js and images are included locally. Fonts are loaded from Google Fonts,
with system font fallbacks when unavailable. External publication, profile
and App Store links require internet access.

The spectrum is an illustrative synthesized animation; it does not access
microphone input. Pause and reduced-motion preferences are supported.

Third-party software: Three.js, MIT license (see THREE-LICENSE.txt).
