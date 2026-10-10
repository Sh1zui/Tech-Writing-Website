# TechWrite — ENG 2 Final Examination (City College of Calapan)

A four-page static website (HTML, CSS, JavaScript). No installation or server needed.

## Run it
1. Unzip the folder.
2. Double-click `index.html` to open it in Chrome, Edge, or Firefox.
   (Internet is only needed for the Google Fonts; the site still works without it.)

## Pages
- `index.html` Home / landing page
- `lectures.html` the seven lectures with a table of contents and self-check quizzes
- `about.html` About Us
- `contact.html` Contact Info with a validated form

## Personalize it (one file)
Open `js/config.js` and replace every `[bracketed]` value (name, course, year/section, instructor,
email, personal statement, photo path). Changes appear on every page. Yellow-highlighted text on the
site means a placeholder is still there. Remove the yellow "Editing note" box on the About page before submitting.

## Contact form limitation
A static site has no mail server. By default the form validates the input, then opens the visitor's
email app with the message filled in (or lets them copy it). To receive messages directly, create a
free Formspree form and paste its URL into `formEndpoint` in `js/config.js`.

## Folder layout
css/style.css · js/main.js · js/config.js · assets/logo.svg · assets/profile-placeholder.svg
