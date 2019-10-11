# yaoparallax
yet another one experimental parallax scroll

[Demo](https://takvol.github.io/yaoparallax)
## Usage
Include plugin files
```html
<link rel="stylesheet" type="text/css" href="yaoparallax/yaoparallax.css">
<script src="yaoparallax/yaoparallax.js"></script>
```
## Configure parallax containers
Create containers and style them as you need (set size, position, etc.). Specify image and parallax rate with `data-image` and `data-parallax` attributes.
```html
<div data-image="catdog.jpg" data-parallax="0.6"></div>
```
## Call yaoParallax
(When the page is loaded.)
```html
<script>window.addEventListener('load', yaoParallax);</script>;
```
