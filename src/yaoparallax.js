/*
* Autosized bg, reversed parallax, scroll only visible.
*/

;(function(window, document){

  let Utils = {
    isMobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    }
  };

  class Viewport {
    constructor(node) {
      this.node = node;
      this.height = this.node.clientHeight;
      this.scrollPosition = this.node.scrollTop;
    }

    get top() {
      return this.scrollPosition;
    }

    get bottom() {
      return this.scrollPosition + this.height;
    }

    isVisible(top, bottom) {
      return top < this.bottom && bottom > this.top;
    }

    onResize() {
      this.scrollPosition = this.node.scrollTop;
      this.height = this.node.clientHeight;
    }

    onScroll() {
      let newScrollPosition = this.node.scrollTop;

      if (this.scrollPosition != newScrollPosition) {
        this.scrollPosition = newScrollPosition;
      }
    }
  }

  class ViewportMobile extends Viewport {
    constructor(node) {
      super(node);
      this.measurer = document.createElement("div");
      this.measurer.className = 'parallax-measurer';
      document.body.appendChild(this.measurer);
      this.height = this.measurer.offsetHeight;
    }

    onResize() {
      this.scrollPosition = this.node.scrollTop;
      this.height = this.measurer.offsetHeight;
    }
  }

  function viewportFactory(node) {
    var viewport;

    if(Utils.isMobile() && node === document.documentElement) {
      viewport = ViewportMobile;
    } else {
      viewport = Viewport;
    }

    return new viewport(node);
  }

  class ImageWrapper {
    constructor(node, viewport) {
      this.node = node;
      this.viewport = viewport;
      this.updateDimension();
    }

    get scrolled() {
      return this.viewport.bottom - this.top;
    }

    updateDimension() {
      this.height = this.node.offsetHeight;
      this.top = this.node.getBoundingClientRect().top - this.viewport.node.getBoundingClientRect().top + this.viewport.scrollPosition;
      this.bottom = this.top + this.height;
    }
  }

  // let isCovered = (img.bottom < wrapper.bottom && wrapper.bottom < );
  // let shouldEase = isVisible && isCovered

  class ImageContainer {
    constructor(wrapper, node, speed = 0.5, threshold = 150) {
      this.wrapper = wrapper;
      this.node = node;
      this.speed = speed;
      this.threshold = threshold;
    }

    updateDimension() {
      var height, k1, k2;
      k1 = this.wrapper.viewport.height * (1 - this.speed);
      k2 = this.wrapper.height * this.speed;

      if (this.speed < 0) {
        height = Math.round(k1 - k2);
        this.top = height;
      } else if (this.speed < 1) {
        height = Math.round(k2 + k1);
        this.top = k1;
      } else {
        height = Math.round(k2 - k1);
        this.top = 0;
      }
      this.top += this.threshold;
      height += this.threshold * 2;
      this.node.style.height = height + 'px';
    }

    updatePosition() {
      let posY = this.wrapper.scrolled * (1 - this.speed) - this.top;
      this.node.style.transform = 'translate3d(0px, ' + posY + 'px, 0px)';
    }
  }


  class YaoParallax {
    constructor(args={}) {
      let defaults = {
        viewport: document.documentElement,
        preventMobile: false,
        smooth: false
      };

      for (let key in defaults) {
        this[key] = key in args ? args[key] : defaults[key];
      }

      let containers = Array.from(this.viewport.querySelectorAll('div[data-parallax]'));
      this.images = [];
      this.isEnabled = !Utils.isMobile() || !this.preventMobile;
      this.viewport = viewportFactory(this.viewport);

      containers.forEach((container) => {
        let image = this.bulidImage(container);
        if (this.isEnabled) {
          image.updateDimension();
          image.updatePosition();
        }
        container.classList.add('parallax-wrapper');
        container.appendChild(image.node);
        this.images.push(image);
      });

      if (this.isEnabled) {
        this.registerEvents();
      }
    }

    registerEvents() {
      this.viewport.node.addEventListener('resize', this.onResize.bind(this));
      let rafid = null;
      let raf = () => {
        if(rafid){
          console.log('wow');
          window.cancelAnimationFrame(rafid);
        }
        rafid = window.requestAnimationFrame(raf);
        this.onScroll();
        rafid = null;
      };
      raf();
    }

    bulidImage(container) {
      let node = document.createElement('div');
      let wrapper = new ImageWrapper(container, this.viewport);
      let speed = container.dataset.parallax;
      let imageUrl = container.dataset.image;
      let threshold = container.dataset.threshold || this.threshold;
      let className = 'parallax-image';

      if (!this.isEnabled) {
        className += ' parallax-image-fixed';
      } else if (this.smooth) {
        className += ' parallax-image-smooth';
      }
      node.style['background-image'] = "url('" + imageUrl + "')";
      node.className = className;

      return new ImageContainer(wrapper, node, speed, threshold);
    }

    onScroll() {
      this.viewport.onScroll();
      this.images.forEach((img) => {
        let top = img.wrapper.top - img.threshold;
        let bottom = img.wrapper.bottom + img.threshold;
        if (this.viewport.isVisible(top, bottom)) img.updatePosition();
      });
    }

    onResize() {
      this.viewport.onResize();
      this.images.forEach(function(img) {
        img.updateDimension();
        img.updatePosition();
      });
    }
  }

  window.yaoParallax = function(args) {
    return new YaoParallax(args);
  }
})(window, document);
