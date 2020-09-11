// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */
(function() {
  // make focus ring visible only for keyboard navigation (i.e., tab key) 
  var focusTab = document.getElementsByClassName('js-tab-focus');
  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  };

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };
  window.addEventListener('mousedown', detectClick);
}());
// File#: _1_3d-drawer
// Usage: codyhouse.co/license
(function() {
	var TdDrawer = function(element) {
    this.element = element;
    this.mianContent = document.getElementsByClassName('js-td-drawer-main');
		this.content = document.getElementsByClassName('js-td-drawer__body');
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
    this.showClass = "td-drawer--is-visible";
    this.showMainClass = "td-drawer-main--drawer-is-visible";
		initDrawer(this);
  };
  
  function initDrawer(drawer) {
    // open drawer when clicking on trigger buttons
		if ( drawer.triggers ) {
			for(var i = 0; i < drawer.triggers.length; i++) {
				drawer.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(drawer.element, drawer.showClass)) {
						closeDrawer(drawer);
						return;
					}
					drawer.selectedTrigger = event.target;
					showDrawer(drawer);
					initDrawerEvents(drawer);
				});
			}
		}
		
		// if drawer is already open -> we should initialize the drawer events
		if(Util.hasClass(drawer.element, drawer.showClass)) initDrawerEvents(drawer);
  };

  function showDrawer(drawer) {
    if(drawer.content.length  > 0 ) drawer.content[0].scrollTop = 0;
    if(drawer.mianContent.length  > 0 ) Util.addClass(drawer.mianContent[0], drawer.showMainClass);
		Util.addClass(drawer.element, drawer.showClass);
	  getFocusableElements(drawer);
		Util.moveFocus(drawer.element);
		// wait for the end of transitions before moving focus
		drawer.element.addEventListener("transitionend", function cb(event) {
			Util.moveFocus(drawer.element);
			drawer.element.removeEventListener("transitionend", cb);
		});
		emitDrawerEvents(drawer, 'drawerIsOpen');
  };

  function closeDrawer(drawer) {
    if(drawer.mianContent.length  > 0 ) Util.removeClass(drawer.mianContent[0], drawer.showMainClass);
    Util.removeClass(drawer.element, drawer.showClass);
		drawer.firstFocusable = null;
		drawer.lastFocusable = null;
		if(drawer.selectedTrigger) drawer.selectedTrigger.focus();
		//remove listeners
		cancelDrawerEvents(drawer);
		emitDrawerEvents(drawer, 'drawerIsClose');
  };

  function initDrawerEvents(drawer) {
    //add event listeners
    drawer.element.addEventListener('keydown', handleEvent.bind(drawer));
    drawer.element.addEventListener('click', handleEvent.bind(drawer));
  };

  function cancelDrawerEvents(drawer) {
		//remove event listeners
		drawer.element.removeEventListener('keydown', handleEvent.bind(drawer));
		drawer.element.removeEventListener('click', handleEvent.bind(drawer));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'click': {
        initClick(this, event);
      }
      case 'keydown': {
        initKeyDown(this, event);
      }
    }
  };

  function initKeyDown(drawer, event) {
    if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
      //close drawer window on esc
      closeDrawer(drawer);
    } else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
      //trap focus inside drawer
      trapFocus(drawer, event);
    }
  };

  function initClick(drawer, event) {
    //close drawer when clicking on close button or drawer bg layer 
		if( !event.target.closest('.js-td-drawer__close') && !Util.hasClass(event.target, 'js-td-drawer') ) return;
		event.preventDefault();
		closeDrawer(drawer);
  };

  function trapFocus(drawer, event) {
    if( drawer.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.lastFocusable.focus();
		}
		if( drawer.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.firstFocusable.focus();
		}
  };

  function getFocusableElements(drawer) {
    //get all focusable elements inside the drawer
		var allFocusable = drawer.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(drawer, allFocusable);
		getLastVisible(drawer, allFocusable);
  };

  function getFirstVisible(drawer, elements) {
    //get first visible focusable element inside the drawer
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				drawer.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(drawer, elements) {
    //get last visible focusable element inside the drawer
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				drawer.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function emitDrawerEvents(drawer, eventName) {
    var event = new CustomEvent(eventName, {detail: drawer.selectedTrigger});
		drawer.element.dispatchEvent(event);
  };

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-td-drawer');
	if( drawer.length > 0 ) {
		for( var i = 0; i < drawer.length; i++) {
			(function(i){new TdDrawer(drawer[i]);})(i);
		}
	}
}());
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion'+this.version+'__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
			Util.setAttributes(button, {'aria-expanded': isOpen, 'aria-controls': 'accordion-content-'+i, 'id': 'accordion-header-'+i});
			Util.addClass(button, 'js-accordion__trigger');
			Util.setAttributes(content, {'aria-labelledby': 'accordion-header-'+i, 'id': 'accordion-content-'+i});
		}

		//listen for Accordion events
		this.initAccordionEvents();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var self = this;
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool);
	};

	Accordion.prototype.animateAccordion = function(trigger, bool) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) Util.addClass(item, this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if( !this.multiItems && !bool) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		Util.toggleClass(item, this.showClass, !bool);
		content.removeAttribute("style");
		if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Util.getIndexInArray(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(Util.hasClass(this.items[i], this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if(openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	window.Accordion = Accordion;
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
// File#: _1_alert-card
// Usage: codyhouse.co/license
(function() {
  function initAlertCard(card) {
    card.addEventListener('click', function(event) {
      if(event.target.closest('.js-alert-card__close-btn')) Util.addClass(card, 'is-hidden');
    });
  };

  var alertCards = document.getElementsByClassName('js-alert-card');
  if(alertCards.length > 0) {
    for(var i = 0; i < alertCards.length; i++) {
      (function(i){initAlertCard(alertCards[i])})(i);
    }
  }
}());
// File#: _1_alert
// Usage: codyhouse.co/license
(function() {
	var alertClose = document.getElementsByClassName('js-alert__close-btn');
	if( alertClose.length > 0 ) {
		for( var i = 0; i < alertClose.length; i++) {
			(function(i){initAlertEvent(alertClose[i]);})(i);
		}
	};
}());

function initAlertEvent(element) {
	element.addEventListener('click', function(event){
		event.preventDefault();
		Util.removeClass(element.closest('.js-alert'), 'alert--is-visible');
	});
};
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
				Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
	var backTop = document.getElementsByClassName('js-back-to-top')[0];
	if( backTop ) {
		var dataElement = backTop.getAttribute('data-element');
		var scrollElement = dataElement ? document.querySelector(dataElement) : window;
		var scrollDuration = parseInt(backTop.getAttribute('data-duration')) || 300, //scroll to top duration
			scrollOffset = parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
			scrolling = false;
		
		//detect click on back-to-top link
		backTop.addEventListener('click', function(event) {
			event.preventDefault();
			if(!window.requestAnimationFrame) {
				scrollElement.scrollTo(0, 0);
			} else {
				dataElement ? Util.scrollTo(0, scrollDuration, false, scrollElement) : Util.scrollTo(0, scrollDuration);
			} 
			//move the focus to the #top-element - don't break keyboard navigation
			Util.moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
		});
		
		//listen to the window scroll and update back-to-top visibility
		checkBackToTop();
		if (scrollOffset > 0) {
			scrollElement.addEventListener("scroll", function(event) {
				if( !scrolling ) {
					scrolling = true;
					(!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
				}
			});
		}

		function checkBackToTop() {
			var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
			if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
			Util.toggleClass(backTop, 'back-to-top--is-visible', windowTop >= scrollOffset);
			scrolling = false;
		}
	}
}());
// File#: _1_chameleonic-header
// Usage: codyhouse.co/license
(function() {
  var ChaHeader = function(element) {
    this.element = element;
    this.sections = document.getElementsByClassName('js-cha-section');
    this.header = this.element.getElementsByClassName('js-cha-header')[0];
    // handle mobile behaviour
    this.headerTrigger = this.element.getElementsByClassName('js-cha-header__trigger');
    this.modal = document.getElementsByClassName('js-cha-modal');
    this.focusMenu = false;
    this.firstFocusable = null;
		this.lastFocusable = null;
    initChaHeader(this);
  };

  function initChaHeader(element) {
    // set initial status
    for(var j = 0; j < element.sections.length; j++) {
      initSection(element, j);
    }

    // handle mobile behaviour
    if(element.headerTrigger.length > 0) {
      initMobileVersion(element);
    }

    // make sure header element is visible when in focus
    element.header.addEventListener('focusin', function(event){
      checkHeaderVisible(element);
    });
  };

  function initSection(element, index) {
    // clone header element inside each section
    var cloneItem = (index == 0) ? element.element : element.element.cloneNode(true);
    Util.removeClass(cloneItem, 'js-cha-header-clip');
    var customClasses = element.sections[index].getAttribute('data-header-class');
    // hide clones to SR
    cloneItem.setAttribute('aria-hidden', 'true');
    if( customClasses ) Util.addClass(cloneItem.getElementsByClassName('js-cha-header')[0], customClasses);
    // keyborad users - make sure cloned items are not tabbable
    if(index != 0) {
      // reset tab index
      resetTabIndex(cloneItem);
      element.sections[index].insertBefore(cloneItem, element.sections[index].firstChild);
    }
  }

  function resetTabIndex(clone) {
    var focusable = clone.querySelectorAll('[href], button, input');
    for(var i = 0; i < focusable.length; i++) {
      focusable[i].setAttribute('tabindex', '-1');
    }
  };

  function initMobileVersion(element) {
    //detect click on nav trigger
    var triggers = document.getElementsByClassName('js-cha-header__trigger');
    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function(event) {
        event.preventDefault();
        var ariaExpanded = !Util.hasClass(element.modal[0], 'is-visible');
        //show nav and update button aria value
        Util.toggleClass(element.modal[0], 'is-visible', ariaExpanded);
        element.headerTrigger[0].setAttribute('aria-expanded', ariaExpanded);
        if(ariaExpanded) { //opening menu -> move focus to first element inside nav
          getFocusableElements(element);
          element.firstFocusable.focus();
        } else if(element.focusMenu) {
          if(window.scrollY < element.focusMenu.offsetTop) element.focusMenu.focus();
          element.focusMenu = false;
        }
      });
    }

    // close modal on click
    element.modal[0].addEventListener("click", function(event) {
      if(!event.target.closest('.js-cha-modal__close')) return;
      closeModal(element);
    });
    
    // listen for key events
		window.addEventListener('keydown', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(element.headerTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(element.headerTrigger[0])) {
          closeModal(element);
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				trapFocus(element, event);
			}
		});
  };

  function closeModal(element) {
    element.focusMenu = element.headerTrigger[0]; // move focus to menu trigger when menu is close
		element.headerTrigger[0].click();
  };

  function trapFocus(element, event) {
    if( element.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			element.lastFocusable.focus();
		}
		if( element.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			element.firstFocusable.focus();
		}
  };

  function getFocusableElements(element) {
		//get all focusable elements inside the modal
		var allFocusable = element.modal[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(element, allFocusable);
		getLastVisible(element, allFocusable);
	};

	function getFirstVisible(element, elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(element, elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.lastFocusable = elements[i];
				return true;
			}
		}
  };
  
  function checkHeaderVisible(element) {
    if(window.scrollY > element.sections[0].offsetHeight - element.header.offsetHeight) window.scrollTo(0, 0);
  };

  function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

  // init the ChaHeader Object
  var chaHader = document.getElementsByClassName('js-cha-header-clip'),
    clipPathSupported = Util.cssSupports('clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)') || Util.cssSupports('-webkit-clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  if(chaHader.length > 0 && clipPathSupported) {
    for(var i = 0; i < chaHader.length; i++) {
      new ChaHeader(chaHader[i]);
    }
  }
}());
// File#: _1_countdown
// Usage: codyhouse.co/license
(function() {
  var CountDown = function(element) {
    this.element = element;
    this.labels = this.element.getAttribute('data-labels') ? this.element.getAttribute('data-labels').split(',') : [];
    this.intervalId;
    //create countdown HTML
    this.createCountDown();
    //store time elements
    this.days = this.element.getElementsByClassName('js-countdown__value--0')[0];
    this.hours = this.element.getElementsByClassName('js-countdown__value--1')[0];
    this.mins = this.element.getElementsByClassName('js-countdown__value--2')[0];
    this.secs = this.element.getElementsByClassName('js-countdown__value--3')[0];
    this.endTime = this.getEndTime();
    //init counter
    this.initCountDown();
  };

  CountDown.prototype.createCountDown = function() {
    var wrapper = document.createElement("div");
    Util.setAttributes(wrapper, {'aria-hidden': 'true', 'class': 'countdown__timer'});

    for(var i = 0; i < 4; i++) {
      var timeItem = document.createElement("span"),
        timeValue = document.createElement("span"),
        timeLabel = document.createElement('span');
      
      timeItem.setAttribute('class', 'countdown__item');
      timeValue.setAttribute('class', 'countdown__value countdown__value--'+i+' js-countdown__value--'+i);
      timeItem.appendChild(timeValue);

      if( this.labels && this.labels.length > 0 ) {
        timeLabel.textContent = this.labels[i].trim();
        timeLabel.setAttribute('class', 'countdown__label');
        timeItem.appendChild(timeLabel);
      }
      
      wrapper.appendChild(timeItem);
    }
    // append new content to countdown element
    this.element.insertBefore(wrapper, this.element.firstChild);
    // this.element.appendChild(wrapper);
  };

  CountDown.prototype.getEndTime = function() {
    // get number of remaining seconds 
    if(this.element.getAttribute('data-timer')) return Number(this.element.getAttribute('data-timer'))*1000 + new Date().getTime();
    else if(this.element.getAttribute('data-countdown')) return Number(new Date(this.element.getAttribute('data-countdown')).getTime());
  };

  CountDown.prototype.initCountDown = function() {
    var self = this;
    this.intervalId = setInterval(function(){
      self.updateCountDown(false);
    }, 1000);
    this.updateCountDown(true);
  };
  
  CountDown.prototype.updateCountDown = function(bool) {
    // original countdown function
    // https://gist.github.com/adriennetacke/f5a25c304f1b7b4a6fa42db70415bad2
    var time = parseInt( (this.endTime - new Date().getTime())/1000 ),
      days = 0,
      hours = 0,
      mins = 0,
      seconds = 0;

    if(isNaN(time) || time < 0) {
      clearInterval(this.intervalId);
      this.emitEndEvent();
    } else {
      days = parseInt(time / 86400);
      time = (time % 86400);
      hours = parseInt(time / 3600);
      time = (time % 3600);
      mins = parseInt(time / 60);
      time = (time % 60);
      seconds = parseInt(time);
    }
    
    // hide days/hours/mins if not available 
    if(bool && days == 0) this.days.parentElement.style.display = "none";
    if(bool && days == 0 && hours == 0) this.hours.parentElement.style.display = "none";
    if(bool && days == 0 && hours == 0 && mins == 0) this.mins.parentElement.style.display = "none";
    
    this.days.textContent = days;
    this.hours.textContent = this.getTimeFormat(hours);
    this.mins.textContent = this.getTimeFormat(mins);
    this.secs.textContent = this.getTimeFormat(seconds);
  };

  CountDown.prototype.getTimeFormat = function(time) {
    return ('0'+ time).slice(-2);
  };

  CountDown.prototype.emitEndEvent = function(time) {
    var event = new CustomEvent('countDownFinished');
    this.element.dispatchEvent(event);
  };

  //initialize the CountDown objects
  var countDown = document.getElementsByClassName('js-countdown');
  if( countDown.length > 0 ) {
    for( var i = 0; i < countDown.length; i++) {
      (function(i){new CountDown(countDown[i]);})(i);
    }
  }
}());
// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
  var menuAim = function(opts) {
    init(opts);
  };

  window.menuAim = menuAim;

  function init(opts) {
    var activeRow = null,
      mouseLocs = [],
      lastDelayLoc = null,
      timeoutId = null,
      options = Util.extend({
        menu: '',
        rows: false, //if false, get direct children - otherwise pass nodes list 
        submenuSelector: "*",
        submenuDirection: "right",
        tolerance: 75,  // bigger = more forgivey when entering submenu
        enter: function(){},
        exit: function(){},
        activate: function(){},
        deactivate: function(){},
        exitMenu: function(){}
      }, opts),
      menu = options.menu;

    var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
      DELAY = 300;  // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     */
    var mousemoveDocument = function(e) {
      mouseLocs.push({x: e.pageX, y: e.pageY});

      if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
        mouseLocs.shift();
      }
    };

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    var mouseleaveMenu = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If exitMenu is supplied and returns true, deactivate the
      // currently active row on menu exit.
      if (options.exitMenu(this)) {
        if (activeRow) {
          options.deactivate(activeRow);
        }

        activeRow = null;
      }
    };

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    var mouseenterRow = function() {
      if (timeoutId) {
        // Cancel any previous activation delays
        clearTimeout(timeoutId);
      }

      options.enter(this);
      possiblyActivate(this);
    },
    mouseleaveRow = function() {
      options.exit(this);
    };

    /*
     * Immediately activate a row if the user clicks on it.
     */
    var clickRow = function() {
      activate(this);
    };  

    /**
     * Activate a menu row.
     */
    var activate = function(row) {
      if (row == activeRow) {
        return;
      }

      if (activeRow) {
        options.deactivate(activeRow);
      }

      options.activate(row);
      activeRow = row;
    };

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     */
    var possiblyActivate = function(row) {
      var delay = activationDelay();

      if (delay) {
        timeoutId = setTimeout(function() {
          possiblyActivate(row);
        }, delay);
      } else {
        activate(row);
      }
    };

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    var activationDelay = function() {
      if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
        // If there is no other submenu row already active, then
        // go ahead and activate immediately.
        return 0;
      }

      function getOffset(element) {
        var rect = element.getBoundingClientRect();
        return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
      };

      var offset = getOffset(menu),
          upperLeft = {
              x: offset.left,
              y: offset.top - options.tolerance
          },
          upperRight = {
              x: offset.left + menu.offsetWidth,
              y: upperLeft.y
          },
          lowerLeft = {
              x: offset.left,
              y: offset.top + menu.offsetHeight + options.tolerance
          },
          lowerRight = {
              x: offset.left + menu.offsetWidth,
              y: lowerLeft.y
          },
          loc = mouseLocs[mouseLocs.length - 1],
          prevLoc = mouseLocs[0];

      if (!loc) {
        return 0;
      }

      if (!prevLoc) {
        prevLoc = loc;
      }

      if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
        // If the previous mouse location was outside of the entire
        // menu's bounds, immediately activate.
        return 0;
      }

      if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
        // If the mouse hasn't moved since the last time we checked
        // for activation status, immediately activate.
        return 0;
      }

      // Detect if the user is moving towards the currently activated
      // submenu.
      //
      // If the mouse is heading relatively clearly towards
      // the submenu's content, we should wait and give the user more
      // time before activating a new row. If the mouse is heading
      // elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the
      // current mouse location and the upper/lower right points of
      // the menu. We do the same for the previous mouse location.
      // If the current mouse location's slopes are
      // increasing/decreasing appropriately compared to the
      // previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves
      // down the screen, we are looking for the slope between the
      // cursor and the upper right corner to decrease over time, not
      // increase (somewhat counterintuitively).
      function slope(a, b) {
        return (b.y - a.y) / (b.x - a.x);
      };

      var decreasingCorner = upperRight,
        increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values
      // depends on which direction the submenu opens relative to the
      // main menu. By default, if the menu opens on the right, we
      // expect the slope between the cursor and the upper right
      // corner to decrease over time, as explained above. If the
      // submenu opens in a different direction, we change our slope
      // expectations.
      if (options.submenuDirection == "left") {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      } else if (options.submenuDirection == "below") {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      } else if (options.submenuDirection == "above") {
        decreasingCorner = upperLeft;
        increasingCorner = upperRight;
      }

      var decreasingSlope = slope(loc, decreasingCorner),
        increasingSlope = slope(loc, increasingCorner),
        prevDecreasingSlope = slope(prevLoc, decreasingCorner),
        prevIncreasingSlope = slope(prevLoc, increasingCorner);

      if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
        // Mouse is moving from previous location towards the
        // currently activated submenu. Delay before activating a
        // new menu row, because user may be moving into submenu.
        lastDelayLoc = loc;
        return DELAY;
      }

      lastDelayLoc = null;
      return 0;
    };

    /**
     * Hook up initial menu events
     */
    menu.addEventListener('mouseleave', mouseleaveMenu);  
    var rows = (options.rows) ? options.rows : menu.children;
    if(rows.length > 0) {
      for(var i = 0; i < rows.length; i++) {(function(i){
        rows[i].addEventListener('mouseenter', mouseenterRow);  
        rows[i].addEventListener('mouseleave', mouseleaveRow);
        rows[i].addEventListener('click', clickRow);  
      })(i);}
    }

    document.addEventListener('mousemove', function(event){
    (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
    });
  };
}());


// File#: _1_dialog
// Usage: codyhouse.co/license
(function() {
  var Dialog = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.showClass = "dialog--is-visible";
    initDialog(this);
  };

  function initDialog(dialog) {
    if ( dialog.triggers ) {
			for(var i = 0; i < dialog.triggers.length; i++) {
				dialog.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					dialog.selectedTrigger = event.target;
					showDialog(dialog);
					initDialogEvents(dialog);
				});
			}
    }
    
    // listen to the openDialog event -> open dialog without a trigger button
		dialog.element.addEventListener('openDialog', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			showDialog(dialog);
			initDialogEvents(dialog);
		});
  };

  function showDialog(dialog) {
		Util.addClass(dialog.element, dialog.showClass);
    getFocusableElements(dialog);
		dialog.firstFocusable.focus();
		// wait for the end of transitions before moving focus
		dialog.element.addEventListener("transitionend", function cb(event) {
			dialog.firstFocusable.focus();
			dialog.element.removeEventListener("transitionend", cb);
		});
		emitDialogEvents(dialog, 'dialogIsOpen');
  };

  function closeDialog(dialog) {
    Util.removeClass(dialog.element, dialog.showClass);
		dialog.firstFocusable = null;
		dialog.lastFocusable = null;
		if(dialog.selectedTrigger) dialog.selectedTrigger.focus();
		//remove listeners
		cancelDialogEvents(dialog);
		emitDialogEvents(dialog, 'dialogIsClose');
  };
  
  function initDialogEvents(dialog) {
    //add event listeners
		dialog.element.addEventListener('keydown', handleEvent.bind(dialog));
		dialog.element.addEventListener('click', handleEvent.bind(dialog));
  };

  function cancelDialogEvents(dialog) {
		//remove event listeners
		dialog.element.removeEventListener('keydown', handleEvent.bind(dialog));
		dialog.element.removeEventListener('click', handleEvent.bind(dialog));
  };
  
  function handleEvent(event) {
		// handle events
		switch(event.type) {
      case 'click': {
        initClick(this, event);
      }
      case 'keydown': {
        initKeyDown(this, event);
      }
		}
  };
  
  function initKeyDown(dialog, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close dialog on esc
			closeDialog(dialog);
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside dialog
			trapFocus(dialog, event);
		}
	};

	function initClick(dialog, event) {
		//close dialog when clicking on close button
		if( !event.target.closest('.js-dialog__close') ) return;
		event.preventDefault();
		closeDialog(dialog);
	};

	function trapFocus(dialog, event) {
		if( dialog.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of dialog
			event.preventDefault();
			dialog.lastFocusable.focus();
		}
		if( dialog.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of dialog
			event.preventDefault();
			dialog.firstFocusable.focus();
		}
	};

  function getFocusableElements(dialog) {
    //get all focusable elements inside the dialog
		var allFocusable = dialog.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(dialog, allFocusable);
		getLastVisible(dialog, allFocusable);
  };

  function getFirstVisible(dialog, elements) {
    //get first visible focusable element inside the dialog
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				dialog.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(dialog, elements) {
    //get last visible focusable element inside the dialog
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				dialog.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function emitDialogEvents(dialog, eventName) {
    var event = new CustomEvent(eventName, {detail: dialog.selectedTrigger});
		dialog.element.dispatchEvent(event);
  };

  //initialize the Dialog objects
	var dialogs = document.getElementsByClassName('js-dialog');
	if( dialogs.length > 0 ) {
		for( var i = 0; i < dialogs.length; i++) {
			(function(i){new Dialog(dialogs[i]);})(i);
		}
	}
}());
// File#: _1_drawer
// Usage: codyhouse.co/license
(function() {
	var Drawer = function(element) {
		this.element = element;
		this.content = document.getElementsByClassName('js-drawer__body')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.isModal = Util.hasClass(this.element, 'js-drawer--modal');
		this.showClass = "drawer--is-visible";
		this.initDrawer();
	};

	Drawer.prototype.initDrawer = function() {
		var self = this;
		//open drawer when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(self.element, self.showClass)) {
						self.closeDrawer(event.target);
						return;
					}
					self.selectedTrigger = event.target;
					self.showDrawer();
					self.initDrawerEvents();
				});
			}
		}

		// if drawer is already open -> we should initialize the drawer events
		if(Util.hasClass(this.element, this.showClass)) this.initDrawerEvents();
	};

	Drawer.prototype.showDrawer = function() {
		var self = this;
		this.content.scrollTop = 0;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		Util.moveFocus(this.element);
		// wait for the end of transitions before moving focus
		this.element.addEventListener("transitionend", function cb(event) {
			Util.moveFocus(self.element);
			self.element.removeEventListener("transitionend", cb);
		});
		this.emitDrawerEvents('drawerIsOpen', this.selectedTrigger);
	};

	Drawer.prototype.closeDrawer = function(target) {
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelDrawerEvents();
		this.emitDrawerEvents('drawerIsClose', target);
	};

	Drawer.prototype.initDrawerEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Drawer.prototype.cancelDrawerEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Drawer.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Drawer.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close drawer window on esc
			this.closeDrawer(false);
		} else if( this.isModal && (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' )) {
			//trap focus inside drawer
			this.trapFocus(event);
		}
	};

	Drawer.prototype.initClick = function(event) {
		//close drawer when clicking on close button or drawer bg layer 
		if( !event.target.closest('.js-drawer__close') && !Util.hasClass(event.target, 'js-drawer') ) return;
		event.preventDefault();
		this.closeDrawer(event.target);
	};

	Drawer.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Drawer.prototype.getFocusableElements = function() {
		//get all focusable elements inside the drawer
		var allFocusable = this.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
	};

	Drawer.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the drawer
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				this.firstFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the drawer
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				this.lastFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.emitDrawerEvents = function(eventName, target) {
		var event = new CustomEvent(eventName, {detail: target});
		this.element.dispatchEvent(event);
	};

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-drawer');
	if( drawer.length > 0 ) {
		for( var i = 0; i < drawer.length; i++) {
			(function(i){new Drawer(drawer[i]);})(i);
		}
	}
}());
// File#: _1_expandable-search
// Usage: codyhouse.co/license
(function() {
	var expandableSearch = document.getElementsByClassName('js-expandable-search');
	if(expandableSearch.length > 0) {
		for( var i = 0; i < expandableSearch.length; i++) {
			(function(i){ // if user types in search input, keep the input expanded when focus is lost
				expandableSearch[i].getElementsByClassName('js-expandable-search__input')[0].addEventListener('input', function(event){
					Util.toggleClass(event.target, 'expandable-search__input--has-content', event.target.value.length > 0);
				});
			})(i);
		}
	}
}());
// File#: _1_google-maps
// Usage: codyhouse.co/license
function initGoogleMap() {
	var contactMap = document.getElementsByClassName('js-google-maps');
	if(contactMap.length > 0) {
		for(var i = 0; i < contactMap.length; i++) {
			initContactMap(contactMap[i]);
		}
	}
};

function initContactMap(wrapper) {
	var coordinate = wrapper.getAttribute('data-coordinates').split(',');
	var map = new google.maps.Map(wrapper, {zoom: 10, center: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}});
	var marker = new google.maps.Marker({position: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}, map: map});
};
// File#: _1_immersive-section-transition
// Usage: codyhouse.co/license
(function() {
  var ImmerseSectionTr = function(element) {
    this.element = element;
    this.media = this.element.getElementsByClassName('js-immerse-section-tr__media');
    this.scrollContent = this.element.getElementsByClassName('js-immerse-section-tr__content');
    if(this.media.length < 1) return;
    this.figure = this.media[0].getElementsByClassName('js-immerse-section-tr__figure');
    if(this.figure.length < 1) return;
    this.visibleFigure = false;
    this.mediaScale = 1;
    this.mediaInitHeight = 0;
    this.elementPadding = 0;
    this.scrollingFn = false;
    this.scrolling = false;
    this.active = false;
    this.scrollDelta = 0; // amount to scroll for full-screen scaleup
    initImmerseSectionTr(this);
  };

  function initImmerseSectionTr(element) {
    initContainer(element);
    resetSection(element);

    // listen to resize event and reset values
    element.element.addEventListener('update-immerse-section', function(event){
      resetSection(element);
    });

    // detect when the element is sticky - update scale value and opacity layer 
    var observer = new IntersectionObserver(immerseSectionTrCallback.bind(element));
    observer.observe(element.media[0]);
  };

  function resetSection(element) {
    getVisibleFigure(element);
    checkEffectActive(element);
    if(element.active) {
      Util.removeClass(element.element, 'immerse-section-tr--disabled');
      updateMediaHeight(element);
      getMediaScale(element); 
      updateMargin(element);
      setScaleValue.bind(element)();
    } else {
      // reset appearance
      Util.addClass(element.element, 'immerse-section-tr--disabled');
      element.media[0].style = '';
      element.scrollContent[0].style = '';
      updateScale(element, 1);
      updateOpacity(element, 0);
    }
    element.element.dispatchEvent(new CustomEvent('immersive-section-updated', {detail: {active: element.active, asset: element.visibleFigure}}));
  };

  function getVisibleFigure(element) { // get visible figure element
    element.visibleFigure = false;
    for(var i = 0; i < element.figure.length; i++) {
      if(window.getComputedStyle(element.figure[i]).getPropertyValue('display') != 'none') {
        element.visibleFigure = element.figure[i];
        break;
      }
    }
  };

  function updateMediaHeight(element) { // set sticky element padding/margin + height
    element.mediaInitHeight = element.visibleFigure.offsetHeight;
    element.scrollDelta = (window.innerHeight - element.visibleFigure.offsetHeight) > (window.innerWidth - element.visibleFigure.offsetWidth)
      ? (window.innerHeight - element.visibleFigure.offsetHeight)/2
      : (window.innerWidth - element.visibleFigure.offsetWidth)/2;
    if(element.scrollDelta > window.innerHeight) element.scrollDelta = window.innerHeight;
    if(element.scrollDelta < 200) element.scrollDelta = 200;
    element.media[0].style.height = window.innerHeight+'px';
    element.media[0].style.paddingTop = (window.innerHeight - element.visibleFigure.offsetHeight)/2+'px';
    element.media[0].style.marginTop = (element.visibleFigure.offsetHeight - window.innerHeight)/2+'px';
  };

  function getMediaScale(element) { // get media final scale value
    var scaleX = roundValue(window.innerWidth/element.visibleFigure.offsetWidth),
      scaleY = roundValue(window.innerHeight/element.visibleFigure.offsetHeight);

    element.mediaScale = Math.max(scaleX, scaleY);
    element.elementPadding = parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top'));
  };

  function roundValue(value) {
    return (Math.ceil(value*100)/100).toFixed(2);
  };

  function updateMargin(element) { // update distance between media and content elements
    if(element.scrollContent.length > 0) element.scrollContent[0].style.marginTop = element.scrollDelta+'px';
  };

  function setScaleValue() { // update asset scale value
    if(!this.active) return; // effect is not active
    var offsetTop = (window.innerHeight - this.mediaInitHeight)/2;
    var top = this.element.getBoundingClientRect().top + this.elementPadding;

    if( top < offsetTop && top > offsetTop - this.scrollDelta) {
      var scale = 1 + (top - offsetTop)*(1 - this.mediaScale)/this.scrollDelta;
      updateScale(this, scale);
      updateOpacity(this, 0);
    } else if(top >= offsetTop) {
      updateScale(this, 1);
      updateOpacity(this, 0);
    } else {
      updateScale(this, this.mediaScale);
      updateOpacity(this, 1.8*( offsetTop - this.scrollDelta - top)/ window.innerHeight);
    }

    this.scrolling = false;
  };

  function updateScale(element, value) { // apply new scale value
    element.visibleFigure.style.transform = 'scale('+value+')';
    element.visibleFigure.style.msTransform = 'scale('+value+')';
  };

  function updateOpacity(element, value) { // update layer opacity
    element.element.style.setProperty('--immerse-section-tr-opacity', value);
  };

  function immerseSectionTrCallback(entries) { // intersectionObserver callback
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      immerseSectionTrScrollEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      this.scrollingFn = false;
    }
  };

  function immerseSectionTrScrollEvent(element) { // listen to scroll when asset element is inside the viewport
    element.scrollingFn = immerseSectionTrScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function immerseSectionTrScrolling() { // update asset scale on scroll
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(setScaleValue.bind(this));
  };

  function initContainer(element) {
    // add a padding to the container to fix the collapsing-margin issue
    if(parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top')) == 0) element.element.style.paddingTop = '1px';
  };

  function checkEffectActive(element) { //check if effect needs to be activated
    element.active = true;
    if(element.visibleFigure.offsetHeight >= window.innerHeight) element.active = false;
    if( window.innerHeight - element.visibleFigure.offsetHeight >= 600) element.active = false;
  };

  //initialize the ImmerseSectionTr objects
  var immerseSections = document.getElementsByClassName('js-immerse-section-tr'),
    reducedMotion = Util.osHasReducedMotion(),
    intObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);

  if(immerseSections.length < 1 ) return;
	if( !reducedMotion && intObserverSupported) {
    var immerseSectionsArray = [];
		for( var i = 0; i < immerseSections.length; i++) {
      (function(i){immerseSectionsArray.push(new ImmerseSectionTr(immerseSections[i]));})(i);
    }

    if(immerseSectionsArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-immerse-section');
      
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      function doneResizing() {
        for( var i = 0; i < immerseSectionsArray.length; i++) {
          (function(i){immerseSectionsArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    };
  } else { // effect deactivated
    for( var i = 0; i < immerseSections.length; i++) Util.addClass(immerseSections[i], 'immerse-section-tr--disabled');
  }
}());
// File#: _1_lazy-load
// Usage: codyhouse.co/license
(function() {
  var LazyLoad = function(elements) {
    this.elements = elements;
    initLazyLoad(this);
  };

  function initLazyLoad(asset) {
    if(lazySupported) setAssetsSrc(asset);
    else if(intersectionObsSupported) observeAssets(asset);
    else scrollAsset(asset);
  };

  function setAssetsSrc(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      if(asset.elements[i].getAttribute('data-bg') || asset.elements[i].tagName.toLowerCase() == 'picture') { // this could be an element with a bg image or a <source> element inside a <picture>
        observeSingleAsset(asset.elements[i]);
      } else {
        setSingleAssetSrc(asset.elements[i]);
      } 
    }
  };

  function setSingleAssetSrc(img) {
    if(img.tagName.toLowerCase() == 'picture') {
      setPictureSrc(img);
    } else {
      setSrcSrcset(img);
      var bg = img.getAttribute('data-bg');
      if(bg) img.style.backgroundImage = bg;
      if(!lazySupported || bg) img.removeAttribute("loading");
    }
  };

  function setPictureSrc(picture) {
    var pictureChildren = picture.children;
    for(var i = 0; i < pictureChildren.length; i++) setSrcSrcset(pictureChildren[i]);
    picture.removeAttribute("loading");
  };

  function setSrcSrcset(img) {
    var src = img.getAttribute('data-src');
    if(src) img.src = src;
    var srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
  };

  function observeAssets(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      observeSingleAsset(asset.elements[i]);
    }
  };

  function observeSingleAsset(img) {
    if( !img.getAttribute('data-src') && !img.getAttribute('data-srcset') && !img.getAttribute('data-bg') && img.tagName.toLowerCase() != 'picture') return; // using the native lazyload with no need js lazy-loading

    var threshold = img.getAttribute('data-threshold') || '200px';
    var config = {rootMargin: threshold};
    var observer = new IntersectionObserver(observerLoadContent.bind(img), config);
    observer.observe(img);
  };

  function observerLoadContent(entries, observer) { 
    if(entries[0].isIntersecting) {
      setSingleAssetSrc(this);
      observer.unobserve(this);
    }
  };

  function scrollAsset(asset) {
    asset.elements = Array.prototype.slice.call(asset.elements);
    asset.listening = false;
    asset.scrollListener = eventLazyLoad.bind(asset);
    document.addEventListener("scroll", asset.scrollListener);
    asset.resizeListener = eventLazyLoad.bind(asset);
    document.addEventListener("resize", asset.resizeListener);
    eventLazyLoad.bind(asset)(); // trigger before starting scrolling/resizing
  };

  function eventLazyLoad() {
    var self = this;
    if(self.listening) return;
    self.listening = true;
    setTimeout(function() {
      for(var i = 0; i < self.elements.length; i++) {
        if ((self.elements[i].getBoundingClientRect().top <= window.innerHeight && self.elements[i].getBoundingClientRect().bottom >= 0) && getComputedStyle(self.elements[i]).display !== "none") {
          setSingleAssetSrc(self.elements[i]);

          self.elements = self.elements.filter(function(image) {
            return image.hasAttribute("loading");
          });

          if (self.elements.length === 0) {
            if(self.scrollListener) document.removeEventListener("scroll", self.scrollListener);
            if(self.resizeListener) window.removeEventListener("resize", self.resizeListener);
          }
        }
      }
      self.listening = false;
    }, 200);
  };

  window.LazyLoad = LazyLoad;

  var lazyLoads = document.querySelectorAll('[loading="lazy"]'),
    lazySupported = 'loading' in HTMLImageElement.prototype,
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  if( lazyLoads.length > 0 ) {
    new LazyLoad(lazyLoads);
  };
  
}());
// File#: _1_looping_tabs
// Usage: codyhouse.co/license
(function() { 
  var LoopTab = function(opts) {
    this.options = Util.extend(LoopTab.defaults , opts);
		this.element = this.options.element;
		this.tabList = this.element.getElementsByClassName('js-loop-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-loop-tabs__panels')[0];
    this.panels = Util.getChildrenByClassName(this.panelsList, 'js-loop-tabs__panel');
    this.assetsList = this.element.getElementsByClassName('js-loop-tabs__assets')[0];
		this.assets = this.assetsList.getElementsByTagName('li');
		this.videos = getVideoElements(this);
    this.panelShowClass = 'loop-tabs__panel--selected';
		this.assetShowClass = 'loop-tabs__asset--selected';
		this.assetExitClass = 'loop-tabs__asset--exit';
    this.controlActiveClass = 'loop-tabs__control--selected';
    // autoplay
    this.autoplayPaused = false;
		this.loopTabAutoId = false;
		this.loopFillAutoId = false;
		this.loopFill = 0;
		initLoopTab(this);
	};
	
	function getVideoElements(tab) {
		var videos = [];
		for(var i = 0; i < tab.assets.length; i++) {
			var video = tab.assets[i].getElementsByTagName('video');
			videos[i] = video.length > 0 ? video[0] : false;
		}
		return videos;
	};
  
  function initLoopTab(tab) {
    //set initial aria attributes
		tab.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = Util.hasClass(tab.triggers[i], tab.controlActiveClass),
        panelId = tab.panels[i].getAttribute('id');
			tab.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(tab.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(tab.triggers[i], 'js-loop-tabs__trigger'); 
      Util.setAttributes(tab.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			
			resetVideo(tab, i, bool); // play/pause video if available

			if(!bool) tab.triggers[i].setAttribute('tabindex', '-1'); 
		}
		// add autoplay-off class if needed
		!tab.options.autoplay && Util.addClass(tab.element, 'loop-tabs--autoplay-off');
		//listen for Tab events
		initLoopTabEvents(tab);
  };

  function initLoopTabEvents(tab) {
		if(tab.options.autoplay) { 
			initLoopTabAutoplay(tab); // init autoplay
			// pause autoplay if user is interacting with the tabs
			tab.element.addEventListener('focusin', function(event){
				pauseLoopTabAutoplay(tab);
				tab.autoplayPaused = true;
			});
			tab.element.addEventListener('focusout', function(event){
				tab.autoplayPaused = false;
				initLoopTabAutoplay(tab);
			});
		}

    //click on a new tab -> select content
		tab.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-loop-tabs__trigger') ) triggerLoopTab(tab, event.target.closest('.js-loop-tabs__trigger'), event);
		});
		
    //arrow keys to navigate through tabs 
		tab.tabList.addEventListener('keydown', function(event) {
			if( !event.target.closest('.js-loop-tabs__trigger') ) return;
			if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'next', true);
			} else if( event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'prev', true);
			}
		});
  };

  function initLoopTabAutoplay(tab) {
		if(!tab.options.autoplay || tab.autoplayPaused) return;
		tab.loopFill = 0;
		var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0];
		// reset css variables
		for(var i = 0; i < tab.triggers.length; i++) {
			if(cssVariableSupport) tab.triggers[i].style.setProperty('--loop-tabs-filling', 0);
		}
		
		tab.loopTabAutoId = setTimeout(function(){
      selectNewLoopTab(tab, 'next', false);
		}, tab.options.autoplayInterval);
		
		if(cssVariableSupport) { // tab fill effect
			tab.loopFillAutoId = setInterval(function(){
				tab.loopFill = tab.loopFill + 0.005;
				selectedTab.style.setProperty('--loop-tabs-filling', tab.loopFill);
			}, tab.options.autoplayInterval/200);
		}
  };

  function pauseLoopTabAutoplay(tab) { // pause autoplay
    if(tab.loopTabAutoId) {
			clearTimeout(tab.loopTabAutoId);
			tab.loopTabAutoId = false;
			clearInterval(tab.loopFillAutoId);
			tab.loopFillAutoId = false;
			// make sure the filling line is scaled up
			var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass);
			if(selectedTab.length > 0) selectedTab[0].style.setProperty('--loop-tabs-filling', 1);
		}
  };

  function selectNewLoopTab(tab, direction, bool) {
    var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0],
			index = Util.getIndexInArray(tab.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = tab.listItems.length - 1;
		if(index >= tab.listItems.length) index = 0;	
		triggerLoopTab(tab, tab.triggers[index]);
		bool && tab.triggers[index].focus();
  };

  function triggerLoopTab(tab, tabTrigger, event) {
		pauseLoopTabAutoplay(tab);
		event && event.preventDefault();	
		var index = Util.getIndexInArray(tab.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(Util.hasClass(tab.triggers[index], tab.controlActiveClass)) return;
		
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = (i == index),
				exit = Util.hasClass(tab.triggers[i], tab.controlActiveClass);
			Util.toggleClass(tab.triggers[i], tab.controlActiveClass, bool);
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetExitClass, exit);
			tab.triggers[i].setAttribute('aria-selected', bool);
			bool ? tab.triggers[i].setAttribute('tabindex', '0') : tab.triggers[i].setAttribute('tabindex', '-1');

			resetVideo(tab, i, bool); // play/pause video if available

			// listen for the end of animation on asset element and remove exit class
			if(exit) {(function(i){
				tab.assets[i].addEventListener('transitionend', function cb(event){
					tab.assets[i].removeEventListener('transitionend', cb);
					Util.removeClass(tab.assets[i], tab.assetExitClass);
				});
			})(i);}
		}
    
    // restart tab autoplay
    initLoopTabAutoplay(tab);
	};

	function resetVideo(tab, i, bool) {
		if(tab.videos[i]) {
			if(bool) {
				tab.videos[i].play();
			} else {
				tab.videos[i].pause();
				tab.videos[i].currentTime = 0;
			} 
		}
	};

  LoopTab.defaults = {
    element : '',
    autoplay : true,
    autoplayInterval: 5000
  };

  //initialize the Tab objects
	var loopTabs = document.getElementsByClassName('js-loop-tabs');
	if( loopTabs.length > 0 ) {
		var reducedMotion = Util.osHasReducedMotion(),
			cssVariableSupport = ('CSS' in window) && Util.cssSupports('color', 'var(--var)');
		for( var i = 0; i < loopTabs.length; i++) {
			(function(i){
        var autoplay = (loopTabs[i].getAttribute('data-autoplay') && loopTabs[i].getAttribute('data-autoplay') == 'off' || reducedMotion) ? false : true,
        autoplayInterval = (loopTabs[i].getAttribute('data-autoplay-interval')) ? loopTabs[i].getAttribute('data-autoplay-interval') : 5000;
        new LoopTab({element: loopTabs[i], autoplay : autoplay, autoplayInterval : autoplayInterval});
      })(i);
		}
	}
}());
// File#: _1_header
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header');
	if( mainHeader.length > 0 ) {
		var trigger = mainHeader[0].getElementsByClassName('js-header__trigger')[0],
			nav = mainHeader[0].getElementsByClassName('js-header__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		//detect click on nav trigger
		trigger.addEventListener("click", function(event) {
			event.preventDefault();
			toggleNavigation(!Util.hasClass(nav, 'header__nav--is-visible'));
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
					focusMenu = trigger; // move focus to menu trigger when menu is close
					trigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function doneResizing() {
			if( !isVisible(trigger) && Util.hasClass(mainHeader[0], 'header--expanded')) toggleNavigation(false); 
		};
	}

	function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

	function toggleNavigation(bool) { // toggle navigation visibility on small device
		Util.toggleClass(nav, 'header__nav--is-visible', bool);
		Util.toggleClass(mainHeader[0], 'header--expanded', bool);
		trigger.setAttribute('aria-expanded', bool);
		if(bool) { //opening menu -> move focus to first element inside nav
			nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
		} else if(focusMenu) {
			focusMenu.focus();
			focusMenu = false;
		}
	};
}());
// File#: _1_masonry
// Usage: codyhouse.co/license

(function() {
  var Masonry = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-masonry__list')[0];
    this.items = this.element.getElementsByClassName('js-masonry__item');
    this.activeColumns = 0;
    this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
    this.colWidth = 0; // effective column width
    this.colGap = 0;
    // store col heights and items
    this.colHeights = [];
    this.colItems = [];
    // flex full support
    this.flexSupported = checkFlexSupported(this.items[0]);
    getGridLayout(this); // get initial grid params
    setGridLayout(this); // set grid params (width of elements)
    initMasonryLayout(this); // init gallery layout
  };

  function checkFlexSupported(item) {
    var itemStyle = window.getComputedStyle(item);
    return itemStyle.getPropertyValue('flex-basis') != 'auto';
  };

  function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
    var itemStyle = window.getComputedStyle(grid.items[0]);
    if( grid.colStartWidth == 0) {
      grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
    }
    grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
  };

  function setGridLayout(grid) { // set width of items in the grid
    var contanerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
    grid.activeColumns = parseInt((contanerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
    if(grid.activeColumns == 0) grid.activeColumns = 1;
    grid.colWidth = parseFloat((contanerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
    for(var i = 0; i < grid.items.length; i++) {
      grid.items[i].style.width = grid.colWidth+'px'; // reset items width
    }
  };

  function initMasonryLayout(grid) {
    if(grid.flexSupported) {
      checkImgLoaded(grid); // reset layout when images are loaded
    } else {
      Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
    }

    grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
      getGridLayout(grid);
      setGridLayout(grid);
      if(grid.flexSupported) layItems(grid); 
    });

    grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
      if(grid.flexSupported) checkImgLoaded(grid); 
    });
  };

  function layItems(grid) {
    Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
    grid.colHeights = [];
    grid.colItems = [];

    // grid layout has already been set -> update container height and order of items
    for(var j = 0; j < grid.activeColumns; j++) {
      grid.colHeights.push(0); // reset col heights
      grid.colItems[j] = []; // reset items order
    }
    
    for(var i = 0; i < grid.items.length; i++) {
      var minHeight = Math.min.apply( Math, grid.colHeights ),
        index = grid.colHeights.indexOf(minHeight);
      grid.colItems[index].push(i);
      grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
      var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
      grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
    }

    // reset height of container
    var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
    grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';

    // go through elements and set flex order
    var order = 0;
    for(var i = 0; i < grid.colItems.length; i++) {
      for(var j = 0; j < grid.colItems[i].length; j++) {
        grid.items[grid.colItems[i][j]].style.order = order;
        order = order + 1;
      }
      // change flex-basis of last element of each column, so that next element shifts to next col
      var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
      lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
    }

    // emit custom event when grid has been reset
    grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
  };

  function checkImgLoaded(grid) {
    var imgs = grid.list.getElementsByTagName('img');

    function countLoaded() {
      var setTimeoutOn = false;
      for(var i = 0; i < imgs.length; i++) {
        if(!imgs[i].complete) {
          setTimeoutOn = true;
          break;
        } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
          setTimeoutOn = true;
          break;
        }
      }

      if(!setTimeoutOn) {
        layItems(grid);
      } else {
        setTimeout(function(){
          countLoaded();
        }, 100);
      }
    };

    if(imgs.length == 0) {
      layItems(grid); // no need to wait -> no img available
    } else {
      countLoaded();
    }
  };

  //initialize the Masonry objects
  var masonries = document.getElementsByClassName('js-masonry'), 
    flexSupported = Util.cssSupports('flex-basis', 'auto'),
    masonriesArray = [];

  if( masonries.length > 0) {
    for( var i = 0; i < masonries.length; i++) {
      if(!flexSupported) {
        Util.addClass(masonries[i], 'masonry--loaded'); // reveal gallery
      } else {
        (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
      }
    }

    if(!flexSupported) return;

    // listen to window resize -> reorganize items in gallery
    var resizingId = false,
      customEvent = new CustomEvent('masonry-resize');
      
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < masonriesArray.length; i++) {
        (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  };
}());
// File#: _1_menu
// Usage: codyhouse.co/license
(function() {
	var Menu = function(element) {
		this.element = element;
		this.elementId = this.element.getAttribute('id');
		this.menuItems = this.element.getElementsByClassName('js-menu__content');
		this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
		this.selectedTrigger = false;
		this.menuIsOpen = false;
		this.initMenu();
		this.initMenuEvents();
	};	

	Menu.prototype.initMenu = function() {
		// init aria-labels
		for(var i = 0; i < this.trigger.length; i++) {
			Util.setAttributes(this.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
		}
		// init tabindex
		for(var i = 0; i < this.menuItems.length; i++) {
			this.menuItems[i].setAttribute('tabindex', '0');
		}
	};

	Menu.prototype.initMenuEvents = function() {
		var self = this;
		for(var i = 0; i < this.trigger.length; i++) {(function(i){
			self.trigger[i].addEventListener('click', function(event){
				event.preventDefault();
				// if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
				if(Util.hasClass(self.element, 'menu--is-visible') && self.selectedTrigger !=  self.trigger[i]) {
					self.toggleMenu(false, false); // close menu
				}
				// toggle menu
				self.selectedTrigger = self.trigger[i];
				self.toggleMenu(!Util.hasClass(self.element, 'menu--is-visible'), true);
			});
		})(i);}
		
		// keyboard events
		this.element.addEventListener('keydown', function(event) {
			// use up/down arrow to navigate list of menu items
			if( !Util.hasClass(event.target, 'js-menu__content') ) return;
			if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
				self.navigateItems(event, 'next');
			} else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
				self.navigateItems(event, 'prev');
			}
		});
	};

	Menu.prototype.toggleMenu = function(bool, moveFocus) {
		var self = this;
		// toggle menu visibility
		Util.toggleClass(this.element, 'menu--is-visible', bool);
		this.menuIsOpen = bool;
		if(bool) {
			this.selectedTrigger.setAttribute('aria-expanded', 'true');
			Util.moveFocus(this.menuItems[0]);
			this.element.addEventListener("transitionend", function(event) {Util.moveFocus(self.menuItems[0]);}, {once: true});
			// position the menu element
			this.positionMenu();
			// add class to menu trigger
			Util.addClass(this.selectedTrigger, 'menu-control--active');
		} else if(this.selectedTrigger) {
			this.selectedTrigger.setAttribute('aria-expanded', 'false');
			if(moveFocus) Util.moveFocus(this.selectedTrigger);
			// remove class from menu trigger
			Util.removeClass(this.selectedTrigger, 'menu-control--active');
			this.selectedTrigger = false;
		}
	};

	Menu.prototype.positionMenu = function(event, direction) {
		var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
			menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
			// menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + this.element.offsetHeight;
			
		var left = selectedTriggerPosition.left,
			right = (window.innerWidth - selectedTriggerPosition.right),
			isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);

		var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
			vertical = menuOnTop
				? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
				: 'top: '+selectedTriggerPosition.bottom+'px;';
		// check right position is correct -> otherwise set left to 0
		if( isRight && (right + this.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - this.element.offsetWidth)/2)+'px;';
		var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;
		this.element.setAttribute('style', horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
	};

	Menu.prototype.navigateItems = function(event, direction) {
		event.preventDefault();
		var index = Util.getIndexInArray(this.menuItems, event.target),
			nextIndex = direction == 'next' ? index + 1 : index - 1;
		if(nextIndex < 0) nextIndex = this.menuItems.length - 1;
		if(nextIndex > this.menuItems.length - 1) nextIndex = 0;
		Util.moveFocus(this.menuItems[nextIndex]);
	};

	Menu.prototype.checkMenuFocus = function() {
		var menuParent = document.activeElement.closest('.js-menu');
		if (!menuParent || !this.element.contains(menuParent)) this.toggleMenu(false, false);
	};

	Menu.prototype.checkMenuClick = function(target) {
		if( !this.element.contains(target) && !target.closest('[aria-controls="'+this.elementId+'"]')) this.toggleMenu(false);
	};

	window.Menu = Menu;

	//initialize the Menu objects
	var menus = document.getElementsByClassName('js-menu');
	if( menus.length > 0 ) {
		var menusArray = [];
		var scrollingContainers = [];
		for( var i = 0; i < menus.length; i++) {
			(function(i){
				menusArray.push(new Menu(menus[i]));
				var scrollableElement = menus[i].getAttribute('data-scrollable-element');
				if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
			})(i);
		}

		// listen for key events
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) {
				//close menu if focus is outside menu element
				menusArray.forEach(function(element){
					element.checkMenuFocus();
				});
			} else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
				// close menu on 'Esc'
				menusArray.forEach(function(element){
					element.toggleMenu(false, false);
				});
			} 
		});
		// close menu when clicking outside it
		window.addEventListener('click', function(event){
			menusArray.forEach(function(element){
				element.checkMenuClick(event.target);
			});
		});
		// on resize -> close all menu elements
		window.addEventListener('resize', function(event){
			menusArray.forEach(function(element){
				element.toggleMenu(false, false);
			});
		});
		// on scroll -> close all menu elements
		window.addEventListener('scroll', function(event){
			menusArray.forEach(function(element){
				if(element.menuIsOpen) element.toggleMenu(false, false);
			});
		});
		// take into account additinal scrollable containers
		for(var j = 0; j < scrollingContainers.length; j++) {
			var scrollingContainer = document.querySelector(scrollingContainers[j]);
			if(scrollingContainer) {
				scrollingContainer.addEventListener('scroll', function(event){
					menusArray.forEach(function(element){
						if(element.menuIsOpen) element.toggleMenu(false, false);
					});
				});
			}
		}
	}
}());
// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
	var Modal = function(element) {
		this.element = element;
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null; // focus will be moved to this element when modal is open
		this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
		this.selectedTrigger = null;
		this.showClass = "modal--is-visible";
		this.initModal();
	};

	Modal.prototype.initModal = function() {
		var self = this;
		//open modal when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(self.element, self.showClass)) {
						self.closeModal();
						return;
					}
					self.selectedTrigger = event.target;
					self.showModal();
					self.initModalEvents();
				});
			}
		}

		// listen to the openModal event -> open modal without a trigger button
		this.element.addEventListener('openModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.showModal();
			self.initModalEvents();
		});

		// listen to the closeModal event -> close modal without a trigger button
		this.element.addEventListener('closeModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.closeModal();
		});

		// if modal is open by default -> initialise modal events
		if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
	};

	Modal.prototype.showModal = function() {
		var self = this;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		this.moveFocusEl.focus();
		// wait for the end of transitions before moving focus
		this.element.addEventListener("transitionend", function cb(event) {
			self.moveFocusEl.focus();
			self.element.removeEventListener("transitionend", cb);
		});
		this.emitModalEvents('modalIsOpen');
	};

	Modal.prototype.closeModal = function() {
		if(!Util.hasClass(this.element, this.showClass)) return;
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelModalEvents();
		this.emitModalEvents('modalIsClose');
	};

	Modal.prototype.initModalEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Modal.prototype.cancelModalEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Modal.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Modal.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside modal
			this.trapFocus(event);
		} else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
			event.preventDefault();
			this.closeModal(); // close modal when pressing Enter on close button
		}	
	};

	Modal.prototype.initClick = function(event) {
		//close modal when clicking on close button or modal bg layer 
		if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
		event.preventDefault();
		this.closeModal();
	};

	Modal.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Modal.prototype.getFocusableElements = function() {
		//get all focusable elements inside the modal
		var allFocusable = this.element.querySelectorAll(focusableElString);
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
		this.getFirstFocusable();
	};

	Modal.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( isVisible(elements[i]) ) {
				this.firstFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( isVisible(elements[i]) ) {
				this.lastFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getFirstFocusable = function() {
		if(!this.modalFocus || !Element.prototype.matches) {
			this.moveFocusEl = this.firstFocusable;
			return;
		}
		var containerIsFocusable = this.modalFocus.matches(focusableElString);
		if(containerIsFocusable) {
			this.moveFocusEl = this.modalFocus;
		} else {
			this.moveFocusEl = false;
			var elements = this.modalFocus.querySelectorAll(focusableElString);
			for(var i = 0; i < elements.length; i++) {
				if( isVisible(elements[i]) ) {
					this.moveFocusEl = elements[i];
					break;
				}
			}
			if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
		}
	};

	Modal.prototype.emitModalEvents = function(eventName) {
		var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
		this.element.dispatchEvent(event);
	};

	function isVisible(element) {
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

	//initialize the Modal objects
	var modals = document.getElementsByClassName('js-modal');
	// generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	if( modals.length > 0 ) {
		var modalArrays = [];
		for( var i = 0; i < modals.length; i++) {
			(function(i){modalArrays.push(new Modal(modals[i]));})(i);
		}

		window.addEventListener('keydown', function(event){ //close modal window on esc
			if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				for( var i = 0; i < modalArrays.length; i++) {
					(function(i){modalArrays[i].closeModal();})(i);
				};
			}
		});
	}
}());
// File#: _1_notice
// Usage: codyhouse.co/license
(function() {
  function initNoticeEvents(notice) {
    notice.addEventListener('click', function(event){
      if(event.target.closest('.js-notice__hide-control')) {
        event.preventDefault();
        Util.addClass(notice, 'notice--hide');
      }
    });
  };
  
  var noticeElements = document.getElementsByClassName('js-notice');
  if(noticeElements.length > 0) {
    for(var i=0; i < noticeElements.length; i++) {(function(i){
      initNoticeEvents(noticeElements[i]);
    })(i);}
  }
}());
// File#: _1_off-canvas-content
// Usage: codyhouse.co/license
(function() {
	var OffCanvas = function(element) {
		this.element = element;
		this.wrapper = document.getElementsByClassName('js-off-canvas')[0];
		this.main = document.getElementsByClassName('off-canvas__main')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.closeBtn = this.element.getElementsByClassName('js-off-canvas__close-btn');
		this.selectedTrigger = false;
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.animating = false;
		initOffCanvas(this);
	};	

	function initOffCanvas(panel) {
		panel.element.setAttribute('aria-hidden', 'true');
		for(var i = 0 ; i < panel.triggers.length; i++) { // lister to the click on off-canvas content triggers
			panel.triggers[i].addEventListener('click', function(event){
				panel.selectedTrigger = event.currentTarget;
				event.preventDefault();
				togglePanel(panel);
			});
		}
	};

	function togglePanel(panel) {
		var status = (panel.element.getAttribute('aria-hidden') == 'true') ? 'close' : 'open';
		if(status == 'close') openPanel(panel);
		else closePanel(panel);
	};

	function openPanel(panel) {
		if(panel.animating) return; // already animating
		emitPanelEvents(panel, 'openPanel', '');
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'false');
		Util.addClass(panel.wrapper, 'off-canvas--visible');
		getFocusableElements(panel);
		var transitionEl = panel.element;
		if(panel.closeBtn.length > 0 && !Util.hasClass(panel.closeBtn[0], 'js-off-canvas__a11y-close-btn')) transitionEl = 	panel.closeBtn[0];
		transitionEl.addEventListener('transitionend', function cb(){
			// wait for the end of transition to move focus and update the animating property
			panel.animating = false;
			Util.moveFocus(panel.element);
			transitionEl.removeEventListener('transitionend', cb);
		});
		if(!transitionSupported) panel.animating = false;
		initPanelEvents(panel);
	};

	function closePanel(panel, bool) {
		if(panel.animating) return;
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'true');
		Util.removeClass(panel.wrapper, 'off-canvas--visible');
		panel.main.addEventListener('transitionend', function cb(){
			panel.animating = false;
			if(panel.selectedTrigger) panel.selectedTrigger.focus();
			setTimeout(function(){panel.selectedTrigger = false;}, 10);
			panel.main.removeEventListener('transitionend', cb);
		});
		if(!transitionSupported) panel.animating = false;
		cancelPanelEvents(panel);
		emitPanelEvents(panel, 'closePanel', bool);
	};

	function initPanelEvents(panel) { //add event listeners
		panel.element.addEventListener('keydown', handleEvent.bind(panel));
		panel.element.addEventListener('click', handleEvent.bind(panel));
	};

	function cancelPanelEvents(panel) { //remove event listeners
		panel.element.removeEventListener('keydown', handleEvent.bind(panel));
		panel.element.removeEventListener('click', handleEvent.bind(panel));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'keydown':
				initKeyDown(this, event);
				break;
			case 'click':
				initClick(this, event);
				break;
		}
	};

	function initClick(panel, event) { // close panel when clicking on close button
		if( !event.target.closest('.js-off-canvas__close-btn')) return;
		event.preventDefault();
		closePanel(panel, 'close-btn');
	};

	function initKeyDown(panel, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close off-canvas panel on esc
			closePanel(panel, 'key');
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside panel
			trapFocus(panel, event);
		}
	};

	function trapFocus(panel, event) {
		if( panel.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of panel
			event.preventDefault();
			panel.lastFocusable.focus();
		}
		if( panel.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of panel
			event.preventDefault();
			panel.firstFocusable.focus();
		}
	};

	function getFocusableElements(panel) { //get all focusable elements inside the off-canvas content
		var allFocusable = panel.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(panel, allFocusable);
		getLastVisible(panel, allFocusable);
	};

	function getFirstVisible(panel, elements) { //get first visible focusable element inside the off-canvas content
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(panel, elements) { //get last visible focusable element inside the off-canvas content
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.lastFocusable = elements[i];
				return true;
			}
		}
	};

	function emitPanelEvents(panel, eventName, target) { // emit custom event
		var event = new CustomEvent(eventName, {detail: target});
		panel.element.dispatchEvent(event);
	};

	//initialize the OffCanvas objects
	var offCanvas = document.getElementsByClassName('js-off-canvas__panel'),
		transitionSupported = Util.cssSupports('transition');
	if( offCanvas.length > 0 ) {
		for( var i = 0; i < offCanvas.length; i++) {
			(function(i){new OffCanvas(offCanvas[i]);})(i);
		}
	}
}());
// File#: _1_overscroll-section
// Usage: codyhouse.co/license
(function() {
  var OverscrollSection = function(element) {
    this.element = element;
    this.stickyContent = this.element.getElementsByClassName('js-overscroll-section__sticky-content');
    this.scrollContent = this.element.getElementsByClassName('js-overscroll-section__scroll-content');
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    this.disabledClass = 'overscroll-section--disabled';
    initOverscrollSection(this);
  };

  function initOverscrollSection(element) {
    // set position of sticky element
    setTop(element);
    // create a new node - to be inserted before the scroll element
    createPrevElement(element);
    // on resize -> reset element top position
    element.element.addEventListener('update-overscroll-section', function(){
      setTop(element);
      setPrevElementTop(element);
    });
    // set initial opacity value
    animateOverscrollSection.bind(element)(); 
    // change opacity of layer
    var observer = new IntersectionObserver(overscrollSectionCallback.bind(element));
    observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    if(element.scrollContent.length == 0) return;
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.insertBefore(newElement, element.scrollContent[0]);
    element.prevElement =  element.scrollContent[0].previousElementSibling;
    element.prevElement.style.opacity = '0';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function overscrollSectionCallback(entries) {
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      overscrollSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };

  function overscrollSectionInitEvent(element) {
    element.scrollingFn = overscrollSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function overscrollSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateOverscrollSection.bind(this));
  };

  function animateOverscrollSection() {
    if(this.stickyContent.length == 0) return;
    setPrevElementTop(this);
    if( parseInt(this.stickyContent[0].style.top) != window.innerHeight - this.stickyContent[0].offsetHeight) {
      setTop(this);
    }
    if(this.prevElementTop - window.scrollY < window.innerHeight*2/3) {
      var opacity = Math.easeOutQuart(window.innerHeight*2/3 + window.scrollY - this.prevElementTop, 0, 1, window.innerHeight*2/3);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    } else {
      updateOpacityValue(this, 0);
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--overscroll-section-opacity', value);
  };

  function setTop(element) {
    if(element.stickyContent.length == 0) return;
    var translateValue = window.innerHeight - element.stickyContent[0].offsetHeight;
    element.stickyContent[0].style.top = translateValue+'px';
    // check if effect should be disabled
    Util.toggleClass(element.element, element.disabledClass, translateValue > 2);
  };

  //initialize the OverscrollSection objects
  var overscrollSections = document.getElementsByClassName('js-overscroll-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky'),
    intObservSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( overscrollSections.length > 0 && stickySupported && !reducedMotion && intObservSupported) {
    var overscrollSectionsArray = [];
		for( var i = 0; i < overscrollSections.length; i++) {
      (function(i){overscrollSectionsArray.push(new OverscrollSection(overscrollSections[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-overscroll-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    document.fonts.onloadingdone = function (fontFaceSetEvent) {
      doneResizing();
    };

    function doneResizing() {
      for( var i = 0; i < overscrollSectionsArray.length; i++) {
        (function(i){overscrollSectionsArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _1_parallax-image
// Usage: codyhouse.co/license
(function() {
  var ParallaxImg = function(element, rotationLevel) {
    this.element = element;
    this.figure = this.element.getElementsByClassName('js-parallax-img__assets')[0];
    this.imgs = this.element.getElementsByTagName('img');
    this.maxRotation = rotationLevel || 2; // rotate level
    if(this.maxRotation > 5) this.maxRotation = 5;
    this.scale = 1;
    this.animating = false;
    initParallax(this);
    initParallaxEvents(this);
  };

  function initParallax(element) {
    element.count = 0;
    window.requestAnimationFrame(checkImageLoaded.bind(element));
    for(var i = 0; i < element.imgs.length; i++) {(function(i){
      var loaded = false;
      element.imgs[i].addEventListener('load', function(){
        if(loaded) return;
        element.count = element.count + 1;
      });
      if(element.imgs[i].complete && !loaded) {
        loaded = true;
        element.count = element.count + 1;
      }
    })(i);}
  };

  function checkImageLoaded() {
    if(this.count >= this.imgs.length) {
      initScale(this);
      if(this.loaded) {
        window.cancelAnimationFrame(this.loaded);
        this.loaded = false;
      }
    } else {
      this.loaded = window.requestAnimationFrame(checkImageLoaded.bind(this));
    }
  };

  function initScale(element) {
    var maxImgResize = getMaxScale(element);
    element.scale = maxImgResize/(Math.sin(Math.PI / 2 - element.maxRotation*Math.PI/180));
    element.figure.style.transform = 'scale('+element.scale+')';  
    Util.addClass(element.element, 'parallax-img--loaded');  
  };

  function getMaxScale(element) {
    var minWidth = 0;
    var maxWidth = 0;
    for(var i = 0; i < element.imgs.length; i++) {
      var width = element.imgs[i].getBoundingClientRect().width;
      if(width < minWidth || i == 0 ) minWidth = width;
      if(width > maxWidth || i == 0 ) maxWidth = width;
    }
    var scale = Math.ceil(10*maxWidth/minWidth)/10;
    if(scale < 1.1) scale = 1.1;
    return scale;
  }

  function initParallaxEvents(element) {
    element.element.addEventListener('mousemove', function(event){
      if(element.animating) return;
      element.animating = true;
      window.requestAnimationFrame(moveImage.bind(element, event));
    });
  };

  function moveImage(event, timestamp) {
    var wrapperPosition = this.element.getBoundingClientRect();
    var rotateY = 2*(this.maxRotation/wrapperPosition.width)*(wrapperPosition.left - event.clientX + wrapperPosition.width/2);
    var rotateX = 2*(this.maxRotation/wrapperPosition.height)*(event.clientY - wrapperPosition.top - wrapperPosition.height/2);

    if(rotateY > this.maxRotation) rotateY = this.maxRotation;
		if(rotateY < -1*this.maxRotation) rotateY = -this.maxRotation;
		if(rotateX > this.maxRotation) rotateX = this.maxRotation;
    if(rotateX < -1*this.maxRotation) rotateX = -this.maxRotation;
    this.figure.style.transform = 'scale('+this.scale+') rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
    this.animating = false;
  };

  window.ParallaxImg = ParallaxImg;

  //initialize the ParallaxImg objects
	var parallaxImgs = document.getElementsByClassName('js-parallax-img');
	if( parallaxImgs.length > 0 && Util.cssSupports('transform', 'translateZ(0px)')) {
		for( var i = 0; i < parallaxImgs.length; i++) {
			(function(i){
        var rotationLevel = parallaxImgs[i].getAttribute('data-perspective');
        new ParallaxImg(parallaxImgs[i], rotationLevel);
      })(i);
		}
	};
}());
// File#: _1_pre-header
// Usage: codyhouse.co/license
(function() {
	var preHeader = document.getElementsByClassName('js-pre-header');
	if(preHeader.length > 0) {
		for(var i = 0; i < preHeader.length; i++) {
			(function(i){ addPreHeaderEvent(preHeader[i]);})(i);
		}

		function addPreHeaderEvent(element) {
			var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
			if(close) {
				close.addEventListener('click', function(event) {
					event.preventDefault();
					Util.addClass(element, 'pre-header--is-hidden');
				});
			}
		}
	}
}());
// File#: _1_read-more
// Usage: codyhouse.co/license
(function() {
  var ReadMore = function(element) {
    this.element = element;
    this.moreContent = this.element.getElementsByClassName('js-read-more__content');
    this.count = this.element.getAttribute('data-characters') || 200;
    this.counting = 0;
    this.btnClasses = this.element.getAttribute('data-btn-class');
    this.ellipsis = this.element.getAttribute('data-ellipsis') && this.element.getAttribute('data-ellipsis') == 'off' ? false : true;
    this.btnShowLabel = 'Read more';
    this.btnHideLabel = 'Read less';
    this.toggleOff = this.element.getAttribute('data-toggle') && this.element.getAttribute('data-toggle') == 'off' ? false : true;
    if( this.moreContent.length == 0 ) splitReadMore(this);
    setBtnLabels(this);
    initReadMore(this);
  };

  function splitReadMore(readMore) { 
    splitChildren(readMore.element, readMore); // iterate through children and hide content
  };

  function splitChildren(parent, readMore) {
    if(readMore.counting >= readMore.count) {
      Util.addClass(parent, 'js-read-more__content');
      return parent.outerHTML;
    }
    var children = parent.childNodes;
    var content = '';
    for(var i = 0; i < children.length; i++) {
      if (children[i].nodeType == Node.TEXT_NODE) {
        content = content + wrapText(children[i], readMore);
      } else {
        content = content + splitChildren(children[i], readMore);
      }
    }
    parent.innerHTML = content;
    return parent.outerHTML;
  };

  function wrapText(element, readMore) {
    var content = element.textContent;
    if(content.replace(/\s/g,'').length == 0) return '';// check if content is empty
    if(readMore.counting >= readMore.count) {
      return '<span class="js-read-more__content">' + content + '</span>';
    }
    if(readMore.counting + content.length < readMore.count) {
      readMore.counting = readMore.counting + content.length;
      return content;
    }
    var firstContent = content.substr(0, readMore.count - readMore.counting);
    firstContent = firstContent.substr(0, Math.min(firstContent.length, firstContent.lastIndexOf(" ")));
    var secondContent = content.substr(firstContent.length, content.length);
    readMore.counting = readMore.count;
    return firstContent + '<span class="js-read-more__content">' + secondContent + '</span>';
  };

  function setBtnLabels(readMore) { // set custom labels for read More/Less btns
    var btnLabels = readMore.element.getAttribute('data-btn-labels');
    if(btnLabels) {
      var labelsArray = btnLabels.split(',');
      readMore.btnShowLabel = labelsArray[0].trim();
      readMore.btnHideLabel = labelsArray[1].trim();
    }
  };

  function initReadMore(readMore) { // add read more/read less buttons to the markup
    readMore.moreContent = readMore.element.getElementsByClassName('js-read-more__content');
    if( readMore.moreContent.length == 0 ) {
      Util.addClass(readMore.element, 'read-more--loaded');
      return;
    }
    var btnShow = ' <button class="js-read-more__btn '+readMore.btnClasses+'">'+readMore.btnShowLabel+'</button>';
    var btnHide = ' <button class="js-read-more__btn is-hidden '+readMore.btnClasses+'">'+readMore.btnHideLabel+'</button>';
    if(readMore.ellipsis) {
      btnShow = '<span class="js-read-more__ellipsis" aria-hidden="true">...</span>'+ btnShow;
    }

    readMore.moreContent[readMore.moreContent.length - 1].insertAdjacentHTML('afterend', btnHide);
    readMore.moreContent[0].insertAdjacentHTML('afterend', btnShow);
    resetAppearance(readMore);
    initEvents(readMore);
  };

  function resetAppearance(readMore) { // hide part of the content
    for(var i = 0; i < readMore.moreContent.length; i++) Util.addClass(readMore.moreContent[i], 'is-hidden');
    Util.addClass(readMore.element, 'read-more--loaded'); // show entire component
  };

  function initEvents(readMore) { // listen to the click on the read more/less btn
    readMore.btnToggle = readMore.element.getElementsByClassName('js-read-more__btn');
    readMore.ellipsis = readMore.element.getElementsByClassName('js-read-more__ellipsis');

    readMore.btnToggle[0].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, true);
    });
    readMore.btnToggle[1].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, false);
    });
  };

  function updateVisibility(readMore, visibile) {
    for(var i = 0; i < readMore.moreContent.length; i++) Util.toggleClass(readMore.moreContent[i], 'is-hidden', !visibile);
    // reset btns appearance
    Util.toggleClass(readMore.btnToggle[0], 'is-hidden', visibile);
    Util.toggleClass(readMore.btnToggle[1], 'is-hidden', !visibile);
    if(readMore.ellipsis.length > 0 ) Util.toggleClass(readMore.ellipsis[0], 'is-hidden', visibile);
    if(!readMore.toggleOff) Util.addClass(readMore.btn, 'is-hidden');
    // move focus
    if(visibile) {
      var targetTabIndex = readMore.moreContent[0].getAttribute('tabindex');
      Util.moveFocus(readMore.moreContent[0]);
      resetFocusTarget(readMore.moreContent[0], targetTabIndex);
    } else {
      Util.moveFocus(readMore.btnToggle[0]);
    }
  };

  function resetFocusTarget(target, tabindex) {
    if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}
  };

  //initialize the ReadMore objects
	var readMore = document.getElementsByClassName('js-read-more');
	if( readMore.length > 0 ) {
		for( var i = 0; i < readMore.length; i++) {
			(function(i){new ReadMore(readMore[i]);})(i);
		}
	};
}());
// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
	var fxElements = document.getElementsByClassName('reveal-fx');
	var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(fxElements.length > 0) {
		// deactivate effect if Reduced Motion is enabled
		if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
			fxRemoveClasses();
			return;
		}
		//on small devices, do not animate elements -> reveal all
		if( fxDisabled(fxElements[0]) ) {
			fxRevealAll();
			return;
		}

		var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)
		
		var viewportHeight = window.innerHeight,
			fxChecking = false,
			fxRevealedItems = [],
			fxElementDelays = fxGetDelays(), //elements animation delay
			fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 
		
		
		// add event listeners
		window.addEventListener('load', fxReveal);
		window.addEventListener('resize', fxResize);

		// observe reveal elements
		var observer = [];
		initObserver();

		function initObserver() {
			for(var i = 0; i < fxElements.length; i++) {
				observer[i] = new IntersectionObserver(
					function(entries, observer) { 
						if(entries[0].isIntersecting) {
							fxRevealItemObserver(entries[0].target);
							observer.unobserve(entries[0].target);
						}
					}, 
					{rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
				);
	
				observer[i].observe(fxElements[i]);
			}
		};

		function fxRevealAll() { // reveal all elements - small devices
			for(var i = 0; i < fxElements.length; i++) {
				Util.addClass(fxElements[i], 'reveal-fx--is-visible');
			}
		};

		function fxResize() { // on resize - check new window height and reveal visible elements
			if(fxChecking) return;
			fxChecking = true;
			(!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
		};

		function fxReset() {
			viewportHeight = window.innerHeight;
			fxReveal();
		};

		function fxReveal() { // reveal visible elements
			for(var i = 0; i < fxElements.length; i++) {(function(i){
				if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
				if(fxElementIsVisible(fxElements[i], i)) {
					fxRevealItem(i);
					fxRevealedItems.push(i);
				}})(i); 
			}
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxRevealItem(index) {
			if(fxElementDelays[index] && fxElementDelays[index] != 0) {
				// wait before revealing element if a delay was added
				setTimeout(function(){
					Util.addClass(fxElements[index], 'reveal-fx--is-visible');
				}, fxElementDelays[index]);
			} else {
				Util.addClass(fxElements[index], 'reveal-fx--is-visible');
			}
		};

		function fxRevealItemObserver(item) {
			var index = Util.getIndexInArray(fxElements, item);
			if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
			fxRevealItem(index);
			fxRevealedItems.push(index);
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxGetDelays() { // get anmation delays
			var delays = [];
			for(var i = 0; i < fxElements.length; i++) {
				delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
			}
			return delays;
		};

		function fxGetDeltas() { // get reveal delta
			var deltas = [];
			for(var i = 0; i < fxElements.length; i++) {
				deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
			}
			return deltas;
		};

		function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
			return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
		};

		function fxElementIsVisible(element, i) { // element is inside viewport
			return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
		};

		function fxGetElementPosition(element) { // get top position of element
			return element.getBoundingClientRect().top;
		};

		function fxResetEvents() { 
			if(fxElements.length > fxRevealedItems.length) return;
			// remove event listeners if all elements have been revealed
			window.removeEventListener('load', fxReveal);
			window.removeEventListener('resize', fxResize);
		};

		function fxRemoveClasses() {
			// Reduced Motion on or Intersection Observer not supported
			while(fxElements[0]) {
				// remove all classes starting with 'reveal-fx--'
				var classes = fxElements[0].className.split(" ").filter(function(c) {
					return c.lastIndexOf('reveal-fx--', 0) !== 0;
				});
				fxElements[0].className = classes.join(" ").trim();
				Util.removeClass(fxElements[0], 'reveal-fx');
			}
		};
	}
}());
// File#: _1_revealing-section
// Usage: codyhouse.co/license
(function() {
  var RevealingSection = function(element) {
    this.element = element;
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    initRevealingSection(this);
  };

  function initRevealingSection(element) {
    // set position of sticky element
    setBottom(element);
    // create a new node - to be inserted before the sticky element
    createPrevElement(element);
    // on resize -> reset element bottom position
    element.element.addEventListener('update-reveal-section', function(){
      setBottom(element);
      setPrevElementTop(element);
    });
    animateRevealingSection.bind(element)(); // set initial status
    // change opacity of layer
    var observer = new IntersectionObserver(revealingSectionCallback.bind(element));
		observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.parentElement.insertBefore(newElement, element.element);
    element.prevElement =  element.element.previousElementSibling;
    element.prevElement.style.opacity = '0';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function revealingSectionCallback(entries, observer) {
		if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      revealingSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };
  
  function revealingSectionInitEvent(element) {
    element.scrollingFn = revealingSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function revealingSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateRevealingSection.bind(this));
  };

  function animateRevealingSection() {
    if(this.prevElementTop - window.scrollY < window.innerHeight) {
      var opacity = (1 - (window.innerHeight + window.scrollY - this.prevElementTop)/window.innerHeight).toFixed(2);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--reavealing-section-overlay-opacity', value);
  };

  function setBottom(element) {
    var translateValue = window.innerHeight - element.element.offsetHeight;
    if(translateValue > 0) translateValue = 0;
    element.element.style.bottom = ''+translateValue+'px';
  };

  //initialize the Revealing Section objects
  var revealingSection = document.getElementsByClassName('js-revealing-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky');
	if( revealingSection.length > 0 && stickySupported) {
    var revealingSectionArray = [];
		for( var i = 0; i < revealingSection.length; i++) {
      (function(i){revealingSectionArray.push(new RevealingSection(revealingSection[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-reveal-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    document.fonts.onloadingdone = function (fontFaceSetEvent) {
      doneResizing();
    };

    function doneResizing() {
      for( var i = 0; i < revealingSectionArray.length; i++) {
        (function(i){revealingSectionArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _1_side-navigation-v2
// Usage: codyhouse.co/license
(function() {
  var SideNav2 = function(element) {
    this.element = element;
    this.controller = this.element.getElementsByClassName('js-sidenav-v2__control');
    this.staticLayoutClass = 'sidenav-v2--static';
    this.expandedClass = 'sidenav-v2--expanded';
    this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
    this.layout = 'static';
    this.customStatic = this.element.getAttribute('data-static-class');
    this.sideNavItems = this.element.getElementsByClassName('js-sidenav-v2__link');
    initSideNav2(this);
  };

  function initSideNav2(element) {
    checkNavLayour(element);

    // custom event emitted when window is resized
    element.element.addEventListener('update-side-nav-v2', function(event){
      checkNavLayour(element);
    });

    // collapsed version only (mobile)
    initCollapsedVersion(element);
  };

  function initCollapsedVersion(element) { // collapsed version only (mobile)
    if(element.controller.length < 1) return;
    
    // toggle nav visibility
    element.controller[0].addEventListener('click', function(event){
      var isOpen = Util.hasClass(element.element, element.expandedClass);
      toggleSideNav(element, isOpen);
    });

    // close expanded version on esc
    element.element.addEventListener('keydown', function(event){
      if(element.layout == 'static') return;
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
        toggleSideNav(element, true);
        element.controller[0].focus();
      }
    });
  };

  function toggleSideNav(element, bool) {
    Util.toggleClass(element.element, element.expandedClass, !bool);
    bool ? element.controller[0].removeAttribute('aria-expanded') : element.controller[0].setAttribute('aria-expanded', 'true');
    if(!bool && element.sideNavItems.length > 0) {
      element.sideNavItems[0].focus();
    }
  };

  function checkNavLayour(element) {
    if(element.isStatic) return;
    element.layout = getComputedStyle(element.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(element.element, element.staticLayoutClass, element.layout == 'static');
    if(element.customStatic) Util.toggleClass(element.element, element.customStatic, element.layout == 'static');
  };

  //initialize the SideNav2 objects
	var sideNav = document.getElementsByClassName('js-sidenav-v2');
	if( sideNav.length > 0 ) {
    var sideNavArray = [];
		for( var i = 0; i < sideNav.length; i++) {
      (function(i){sideNavArray.push(new SideNav2(sideNav[i]));})(i);
    }

    var resizingId = false,
      customEvent = new CustomEvent('update-side-nav-v2');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 300);
    });

    function doneResizing() {
      for( var i = 0; i < sideNavArray.length; i++) {
        (function(i){sideNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };

    (window.requestAnimationFrame) // init side nav layout
      ? window.requestAnimationFrame(doneResizing)
      : doneResizing();
	}
}());
// File#: _1_side-navigation
// Usage: codyhouse.co/license
(function() {
  function initSideNav(nav) {
    nav.addEventListener('click', function(event){
      var btn = event.target.closest('.js-sidenav__sublist-control');
      if(!btn) return;
      var listItem = btn.parentElement,
        bool = Util.hasClass(listItem, 'sidenav__item--expanded');
      btn.setAttribute('aria-expanded', !bool);
      Util.toggleClass(listItem, 'sidenav__item--expanded', !bool);
    });
  };

	var sideNavs = document.getElementsByClassName('js-sidenav');
	if( sideNavs.length > 0 ) {
		for( var i = 0; i < sideNavs.length; i++) {
      (function(i){initSideNav(sideNavs[i]);})(i);
		}
	}
}());
// File#: _1_skip-link
// Usage: codyhouse.co/license
(function() {
  function initSkipLinkEvents(skipLink) {
    // toggle class skip-link--focus if link is in focus/loses focus
    skipLink.addEventListener('focusin', function(){
      Util.addClass(skipLink, 'skip-link--focus');
    });
    skipLink.addEventListener('focusout', function(){
      Util.removeClass(skipLink, 'skip-link--focus');
    });
  };

  var skipLinks = document.getElementsByClassName('skip-link');
	if( skipLinks.length > 0 ) {
		for( var i = 0; i < skipLinks.length; i++) {
			initSkipLinkEvents(skipLinks[i]);
		}
  }
}());
// File#: _1_sliding-panels
// Usage: codyhouse.co/license
(function() {
  var SlidingPanels = function(element) {
    this.element = element;
    this.itemsList = this.element.getElementsByClassName('js-s-panels__projects-list');
    this.items = this.itemsList[0].getElementsByClassName('js-s-panels__project-preview');
    this.navigationToggle = this.element.getElementsByClassName('js-s-panels__nav-control');
    this.navigation = this.element.getElementsByClassName('js-s-panels__nav-wrapper');
    this.transitionLayer = this.element.getElementsByClassName('js-s-panels__overlay-layer');
    this.selectedSection = false; // will be used to store the visible project content section
    this.animating = false;
    // aria labels for the navigationToggle button
    this.toggleAriaLabels = ['Toggle navigation', 'Close Project'];
    initSlidingPanels(this);
  };

  function initSlidingPanels(element) {
    // detect click on toggle menu
    if(element.navigationToggle.length > 0 && element.navigation.length > 0) {
      element.navigationToggle[0].addEventListener('click', function(event) {
        if(element.animating) return;
        
        // if project is open -> close project
        if(closeProjectIfVisible(element)) return;
        
        // toggle navigation
        var openNav = Util.hasClass(element.navigation[0], 'is-hidden');
        toggleNavigation(element, openNav);
      });
    }

    // open project
    element.element.addEventListener('click', function(event) {
      if(element.animating) return;

      var link = event.target.closest('.js-s-panels__project-control');
      if(!link) return;
      event.preventDefault();
      openProject(element, event.target.closest('.js-s-panels__project-preview'), link.getAttribute('href').replace('#', ''));
    });
    
    // on Esc -> close menu/project
    window.addEventListener('keydown', function(event) {
      if(element.animating) return;

      if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
        // check if there's a project to close
        if(closeProjectIfVisible(element)) return;
        // check if the navigation is visible and hide it
        var openNav = Util.hasClass(element.navigation[0], 'is-hidden');
        if(!openNav) toggleNavigation(element, openNav);
      }
    });
  };

  // check if there's a visible project to close and close it
  function closeProjectIfVisible(element) {
    var visibleProject = element.element.getElementsByClassName('s-panels__project-preview--selected');
    if(visibleProject.length > 0) {
      element.animating = true;
      closeProject(element);
      return true;
    }

    return false;
  };

  function toggleNavigation(element, openNavigation) {
    element.animating = true;
    if(openNavigation) Util.removeClass(element.navigation[0], 'is-hidden');
    slideProjects(element, openNavigation, false, function(){
      element.animating = false;
      if(!openNavigation) Util.addClass(element.navigation[0], 'is-hidden');
    });
    Util.toggleClass(element.navigationToggle[0], 's-panels__nav-control--arrow-down', openNavigation);
  };

  function openProject(element, project, id) {
    element.animating = true;
    var projectIndex = Util.getIndexInArray(element.items, project);
    // hide navigation
    Util.removeClass(element.itemsList[0], 'bg-opacity-0');
    // expand selected projects
    Util.addClass(project, 's-panels__project-preview--selected');
    // hide remaining projects
    slideProjects(element, true, projectIndex, function() {
      // reveal section content
      element.selectedSection = document.getElementById(id);
      if(element.selectedSection) Util.removeClass(element.selectedSection, 'is-hidden');
      element.animating = false;
    });
    // modify toggle button appearance
    Util.addClass(element.navigationToggle[0], 's-panels__nav-control--close');
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[1]);
  };

  function closeProject(element) {
    // remove transitions from projects
    toggleTransitionProjects(element, true);
    // hide navigation
    Util.removeClass(element.itemsList[0], 'bg-opacity-0');
    // reveal transition layer
    Util.addClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
    // wait for end of transition layer effect
    element.transitionLayer[0].addEventListener('transitionend', function cb(event) {
      if(event.propertyName != 'opacity') return;
      element.transitionLayer[0].removeEventListener('transitionend', cb);
      // update projects classes
      resetProjects(element);

      setTimeout(function(){
        // hide transition layer
        Util.removeClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
        // reveal projects
        slideProjects(element, false, false, function() {
          Util.addClass(element.itemsList[0], 'bg-opacity-0');
          element.animating = false;
        });
      }, 200);
    });

    // modify toggle button appearance
    Util.removeClass(element.navigationToggle[0], 's-panels__nav-control--close');
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[0]);
  };

  function slideProjects(element, openNav, exclude, cb) {
    // projects will slide out in a random order
    var randomList = getRandomList(element.items.length, exclude);
    for(var i = 0; i < randomList.length; i++) {(function(i){
      setTimeout(function(){
        Util.toggleClass(element.items[randomList[i]], 's-panels__project-preview--hide', openNav);
        toggleProjectAccessibility(element.items[randomList[i]], openNav);
        if(cb && i == randomList.length - 1) {
          // last item to be animated -> execute callback function at the end of the animation
          element.items[randomList[i]].addEventListener('transitionend', function cbt() {
            if(event.propertyName != 'transform') return;
            if(cb) cb();
            element.items[randomList[i]].removeEventListener('transitionend', cbt);
          });
        }
      }, i*100);
    })(i);}
  };

  function toggleTransitionProjects(element, bool) {
    // remove transitions from project elements
    for(var i = 0; i < element.items.length; i++) {
      Util.toggleClass(element.items[i], 's-panels__project-preview--no-transition', bool);
    }
  };

  function resetProjects(element) {
    // reset projects classes -> remove selected/no-transition class + add hide class
    for(var i = 0; i < element.items.length; i++) {
      Util.removeClass(element.items[i], 's-panels__project-preview--selected s-panels__project-preview--no-transition');
      Util.addClass(element.items[i], 's-panels__project-preview--hide');
    }

    // hide project content
    if(element.selectedSection) Util.addClass(element.selectedSection, 'is-hidden');
    element.selectedSection = false;
  };

  function getRandomList(maxVal, exclude) {
    // get list of random integer from 0 to (maxVal - 1) excluding (exclude) if defined
    var uniqueRandoms = [];
    var randomArray = [];
    
    function makeUniqueRandom() {
      // refill the array if needed
      if (!uniqueRandoms.length) {
        for (var i = 0; i < maxVal; i++) {
          if(exclude === false || i != exclude) uniqueRandoms.push(i);
        }
      }
      var index = Math.floor(Math.random() * uniqueRandoms.length);
      var val = uniqueRandoms[index];
      // now remove that value from the array
      uniqueRandoms.splice(index, 1);
      return val;
    }

    for(var j = 0; j < maxVal; j++) {
      randomArray.push(makeUniqueRandom());
    }

    return randomArray;
  };

  function toggleProjectAccessibility(project, bool) {
    bool ? project.setAttribute('aria-hidden', 'true') : project.removeAttribute('aria-hidden');
    var link = project.getElementsByClassName('js-s-panels__project-control');
    if(link.length > 0) {
      bool ? link[0].setAttribute('tabindex', '-1') : link[0].removeAttribute('tabindex');
    }
  };

  //initialize the SlidingPanels objects
	var slidingPanels = document.getElementsByClassName('js-s-panels');
	if( slidingPanels.length > 0 ) {
		for( var i = 0; i < slidingPanels.length; i++) {
			(function(i){new SlidingPanels(slidingPanels[i]);})(i);
		}
	}
}());
// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
	var SmoothScroll = function(element) {
		this.element = element;
		this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
		this.dataElement = this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
		this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window;
		this.initScroll();
	};

	SmoothScroll.prototype.initScroll = function() {
		var self = this;

		//detect click on link
		this.element.addEventListener('click', function(event){
			event.preventDefault();
			var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
				target = document.getElementById(targetId),
				targetTabIndex = target.getAttribute('tabindex'),
				windowScrollTop = self.scrollElement.scrollTop || document.documentElement.scrollTop;

			if(!self.dataElement) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

			var scrollElement = self.dataElement ? self.scrollElement : false;

			var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
			Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
				//move the focus to the target element - don't break keyboard navigation
				Util.moveFocus(target);
				history.pushState(false, false, '#'+targetId);
				self.resetTarget(target, targetTabIndex);
			}, scrollElement);
		});
	};

	SmoothScroll.prototype.resetTarget = function(target, tabindex) {
		if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}	
	};

	SmoothScroll.prototype.getFixedElementHeight = function() {
		var fixedElementDelta = parseInt(getComputedStyle(document.documentElement).getPropertyValue('scroll-padding'));
		if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
			fixedElementDelta = 0;
			var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
			if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
		}
		return fixedElementDelta;
	};
	
	//initialize the Smooth Scroll objects
	var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
	if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
		// you need javascript only if css scroll-behavior is not supported
		for( var i = 0; i < smoothScrollLinks.length; i++) {
			(function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
		}
	}
}());
// File#: _1_social-sharing
// Usage: codyhouse.co/license
(function() {
  function initSocialShare(button) {
    button.addEventListener('click', function(event){
      event.preventDefault();
      var social = button.getAttribute('data-social');
      var url = getSocialUrl(button, social);
      (social == 'mail')
        ? window.location.href = url
        : window.open(url, social+'-share-dialog', 'width=626,height=436');
    });
  };

  function getSocialUrl(button, social) {
    var params = getSocialParams(social);
    var newUrl = '';
    for(var i = 0; i < params.length; i++) {
      var paramValue = button.getAttribute('data-'+params[i]);
      if(params[i] == 'hashtags') paramValue = encodeURI(paramValue.replace(/\#| /g, ''));
      if(paramValue) {
        (social == 'facebook') 
          ? newUrl = newUrl + 'u='+encodeURIComponent(paramValue)+'&'
          : newUrl = newUrl + params[i]+'='+encodeURIComponent(paramValue)+'&';
      }
    }
    if(social == 'linkedin') newUrl = 'mini=true&'+newUrl;
    return button.getAttribute('href')+'?'+newUrl;
  };

  function getSocialParams(social) {
    var params = [];
    switch (social) {
      case 'twitter':
        params = ['text', 'hashtags'];
        break;
      case 'facebook':
      case 'linkedin':
        params = ['url'];
        break;
      case 'pinterest':
        params = ['url', 'media', 'description'];
        break;
      case 'mail':
        params = ['subject', 'body'];
        break;
    }
    return params;
  };

  var socialShare = document.getElementsByClassName('js-social-share');
  if(socialShare.length > 0) {
    for( var i = 0; i < socialShare.length; i++) {
      (function(i){initSocialShare(socialShare[i])})(i);
    }
  }
}());
// File#: _1_sticky-banner
// Usage: codyhouse.co/license
(function() {
  var StickyBanner = function(element) {
    this.element = element;
    this.offsetIn = 0;
    this.offsetOut = 0;
    this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false;
    this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false;
    this.reset = 0;
    getBannerOffsets(this);
    initBanner(this);
  };

  function getBannerOffsets(element) { // get offset in and offset out values
    // update offsetIn
    element.offsetIn = 0;
    if(element.targetIn) {
      var boundingClientRect = element.targetIn.getBoundingClientRect();
      element.offsetIn = boundingClientRect.top + document.documentElement.scrollTop + boundingClientRect.height;
    }
    var dataOffsetIn = element.element.getAttribute('data-offset-in');
    if(dataOffsetIn) {
      element.offsetIn = element.offsetIn + parseInt(dataOffsetIn);
    }
    // update offsetOut
    element.offsetOut = 0;
    if(element.targetOut) {
      var boundingClientRect = element.targetOut.getBoundingClientRect();
      element.offsetOut = boundingClientRect.top + document.documentElement.scrollTop - window.innerHeight;
    }
    var dataOffsetOut = element.element.getAttribute('data-offset-out');
    if(dataOffsetOut) {
      element.offsetOut = element.offsetOut + parseInt(dataOffsetOut);
    }
  };

  function initBanner(element) {
    resetBannerVisibility(element);

    element.element.addEventListener('resize-banner', function(){
      getBannerOffsets(element);
      resetBannerVisibility(element);
    });

    element.element.addEventListener('scroll-banner', function(){
      if(element.reset < 10) {
        getBannerOffsets(element);
        element.reset = element.reset + 1;
      }
      resetBannerVisibility(element);
    });
  };

  function resetBannerVisibility(element) {
    var scrollTop = document.documentElement.scrollTop,
      topTarget = false,
      bottomTarget = false;
    if(element.offsetIn < scrollTop) {
      topTarget = true;
    }
    if(element.offsetOut == 0 || scrollTop < element.offsetOut) {
      bottomTarget = true;
    }
    Util.toggleClass(element.element, 'sticky-banner--visible', bottomTarget && topTarget);
  };

  //initialize the Sticky Banner objects
	var stckyBanner = document.getElementsByClassName('js-sticky-banner');
	if( stckyBanner.length > 0 ) {
		for( var i = 0; i < stckyBanner.length; i++) {
			(function(i){new StickyBanner(stckyBanner[i]);})(i);
    }
    
    // init scroll/resize
    var resizingId = false,
      scrollingId = false,
      resizeEvent = new CustomEvent('resize-banner'),
      scrollEvent = new CustomEvent('scroll-banner');
    
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(function(){
        doneResizing(resizeEvent);
      }, 300);
    });

    window.addEventListener('scroll', function(event){
      if(scrollingId) return;
      scrollingId = true;
      window.requestAnimationFrame 
        ? window.requestAnimationFrame(function(){
          doneResizing(scrollEvent);
          scrollingId = false;
        })
        : setTimeout(function(){
          doneResizing(scrollEvent);
          scrollingId = false;
        }, 200);

      resizingId = setTimeout(function(){
        doneResizing(resizeEvent);
      }, 300);
    });

    function doneResizing(event) {
      for( var i = 0; i < stckyBanner.length; i++) {
        (function(i){stckyBanner[i].dispatchEvent(event)})(i);
      };
    };
	}
}());
// File#: _1_sticky-hero
// Usage: codyhouse.co/license
(function() {
	var StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
		observer.observe(element.scrollingElement);
		if(element.nextElement) observer.observe(element.nextElement);
	};

	function stickyCallback(entries, observer) {
		var threshold = entries[0].intersectionRatio.toFixed(1);
		(entries[0].target ==  this.scrollingElement)
			? this.scrollingTreshold = threshold
			: this.nextTreshold = threshold;

		Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
	};


	var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
		for(var i = 0; i < stickyBackground.length; i++) {
			(function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content));
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content));
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _1_switch-icon
// Usage: codyhouse.co/license
(function() {
	var switchIcons = document.getElementsByClassName('js-switch-icon');
	if( switchIcons.length > 0 ) {
		for(var i = 0; i < switchIcons.length; i++) {(function(i){
			if( !Util.hasClass(switchIcons[i], 'switch-icon--hover') ) initswitchIcons(switchIcons[i]);
		})(i);}

		function initswitchIcons(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'switch-icon--state-b');
				Util.toggleClass(btn, 'switch-icon--state-b', status);
				// emit custom event
				var event = new CustomEvent('switch-icon-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = 'is-hidden';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
// File#: _1_anim-card
// Usage: codyhouse.co/license
(function() {
  var AnimCards = function(element) {
    this.element = element;
    this.list = this.element.getElementsByTagName('ul')[0];
    this.cards = this.list.children;
    this.reverseDirection = Util.hasClass(this.element, 'anim-cards--reverse');
    this.translate = 0; // store container translate value
    this.animationId = false;
    this.animating = false;
    this.paused = false;
    // change speed of animation  
    this.animationSpeed = 1; // > 1 to increse speed, < 1 to reduce; always > 0
    initAnimCardsEvents(this);
  };

  function initAnimCardsEvents(cards) {
    // init observer
    var observer = new IntersectionObserver(animCardsObserve.bind(cards));
    observer.observe(cards.element);

    cards.element.addEventListener('update-card-width', function(event){ // reset animation on resize
      if(cards.animating) {
        cancelPrevAnimation(cards);
        if(!cards.paused) initAnimCards(cards);
      }
    });

    // play/pause button
    cards.element.addEventListener('anim-cards', function(event) {
      cards.paused = false;
      if(cards.animating) initAnimCards(cards);
    });
    cards.element.addEventListener('pause-cards', function(event) {
      cards.paused = true;
      if(cards.animating) {
        cancelPrevAnimation(cards);
        cards.timestamp = false;
      }
    });
  };

  function animCardsObserve(entries) {
    if(entries[0].isIntersecting) {
      this.animating = true;
      if(!this.paused) initAnimCards(this); // init animation
    } else {
      this.animating = false;
      cancelPrevAnimation(this);
    }
  };

  function initAnimCards(cards) {
    if(cards.paused) return;
    cards.cardWidth = getAnimCardsWidth(cards);
    cards.animationId = window.requestAnimationFrame(triggerAnimCards.bind(cards));
  };

  function triggerAnimCards(timestamp) {
    cancelPrevAnimation(this);
    if(!this.timestamp) this.timestamp = timestamp;
    var translateIncrease = (this.timestamp - timestamp)*0.06*this.animationSpeed;
    this.timestamp = timestamp;
    updateAnimCardsTranslate(this, translateIncrease);
    updateAnimCardsList(this);
    setTranslate(this);
    this.animationId = window.requestAnimationFrame(triggerAnimCards.bind(this));
  };

  function updateAnimCardsTranslate(cards, translate) {
    cards.translate = cards.reverseDirection ? cards.translate - translate : cards.translate + translate;
    cards.translate = Math.round(Math.abs(cards.translate));
    if(!cards.reverseDirection) cards.translate = cards.translate*-1;
  };

  function updateAnimCardsList(cards) {
    if(Math.abs(cards.translate) <= cards.cardWidth) return;
    // need to remove first item from the list and append it to the end of list
    cards.translate = Math.abs(cards.translate) - cards.cardWidth;
    if(!cards.reverseDirection) cards.translate = cards.translate*-1;
    var clone = cards.cards[0].cloneNode(true);
    cards.list.removeChild(cards.cards[0]);
    cards.list.appendChild(clone);
  };

  function setTranslate(cards) {
    cards.list.style.transform = 'translateX('+cards.translate+'px)';
    cards.list.style.msTransform = 'translateX('+cards.translate+'px)';
  };

  function getAnimCardsWidth(cards) {
    return parseFloat(window.getComputedStyle(cards.cards[0]).marginRight) + cards.cards[0].offsetWidth;
  };

  function cancelPrevAnimation(cards) {
    if(cards.animationId) {
      window.cancelAnimationFrame(cards.animationId);
      cards.animationId = false;
    }
  };

  function initAnimCardsController(controller) {
    // play/pause btn controller
    var cardsContainer = document.getElementById(controller.getAttribute('aria-controls'));
    if(!cardsContainer) return;
    var cardsList = cardsContainer.getElementsByClassName('js-anim-cards');
    if(cardsList.length < 1) return;

    // detect click
    controller.addEventListener('click', function(event){
      var playAnimation = controller.getAttribute('aria-pressed') == 'true';
      var animEvent = playAnimation ? 'anim-cards' : 'pause-cards';
      playAnimation ? controller.setAttribute('aria-pressed', 'false') : controller.setAttribute('aria-pressed', 'true');
      for(var i = 0; i < cardsList.length; i++) {
        cardsList[i].dispatchEvent(new CustomEvent(animEvent));
      }
    });
  };

  //initialize the AnimCards objects
  var animCards = document.getElementsByClassName('js-anim-cards'),
    requestAnimationFrameSupported = window.requestAnimationFrame,
    reducedMotion = Util.osHasReducedMotion(),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);

	if( animCards.length > 0 ) {
    var animCardsArray = [];
		for( var i = 0; i < animCards.length; i++) {
      if(!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
        // animation is off if requestAnimationFrame/IntersectionObserver is not supported or reduced motion is on
        Util.addClass(animCards[i], 'anim-cards--anim-off');
      } else {(function(i){animCardsArray.push(new AnimCards(animCards[i]));})(i);}
    }

    if(animCardsArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-card-width');
      
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      function doneResizing() {
        for( var i = 0; i < animCardsArray.length; i++) {
          (function(i){animCardsArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    };

    // check play/pause buttons
    var animCardsControl = document.getElementsByClassName('js-anim-cards-control');
    if(animCardsControl.length > 0) {
      for( var i = 0; i < animCardsControl.length; i++) {
        if(!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
          Util.addClass(animCardsControl[i], 'is-hidden');
        } else {
          (function(i){initAnimCardsController(animCardsControl[i]);})(i);
        } 
      }
    }
  }
}());
// File#: _2_carousel
// Usage: codyhouse.co/license
(function() {
  var Carousel = function(opts) {
    this.options = Util.extend(Carousel.defaults , opts);
    this.element = this.options.element;
    this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
    this.list = this.element.getElementsByClassName('carousel__list')[0];
    this.items = this.element.getElementsByClassName('carousel__item');
    this.initItems = []; // store only the original elements - will need this for cloning
    this.itemsNb = this.items.length; //original number of items
    this.visibItemsNb = 1; // tot number of visible items
    this.itemsWidth = 1; // this will be updated with the right width of items
    this.itemOriginalWidth = false; // store the initial width to use it on resize
    this.selectedItem = 0; // index of first visible item 
    this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
    this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
    this.ariaLive = false;
    // navigation
    this.controls = this.element.getElementsByClassName('js-carousel__control');
    this.animating = false;
    // autoplay
    this.autoplayId = false;
    this.autoplayPaused = false;
    //drag
    this.dragStart = false;
    // resize
    this.resizeId = false;
    // used to re-initialize js
    this.cloneList = [];
    // store items min-width
    this.itemAutoSize = false;
    // store translate value (loop = off)
    this.totTranslate = 0;
    // modify loop option if navigation is on
    if(this.options.nav) this.options.loop = false;
    // store counter elements (if present)
    this.counter = this.element.getElementsByClassName('js-carousel__counter');
    this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
    initCarouselLayout(this); // get number visible items + width items
    setItemsWidth(this, true); 
    insertBefore(this, this.visibItemsNb); // insert clones before visible elements
    updateCarouselClones(this); // insert clones after visible elements
    resetItemsTabIndex(this); // make sure not visible items are not focusable
    initAriaLive(this); // set aria-live region for SR
    initCarouselEvents(this); // listen to events
    initCarouselCounter(this);
    Util.addClass(this.element, 'carousel--loaded');
  };
  
  //public carousel functions
  Carousel.prototype.showNext = function() {
    showNextItems(this);
  };

  Carousel.prototype.showPrev = function() {
    showPrevItems(this);
  };

  Carousel.prototype.startAutoplay = function() {
    startAutoplay(this);
  };

  Carousel.prototype.pauseAutoplay = function() {
    pauseAutoplay(this);
  };
  
  //private carousel functions
  function initCarouselLayout(carousel) {
    // evaluate size of single elements + number of visible elements
    var itemStyle = window.getComputedStyle(carousel.items[0]),
      containerStyle = window.getComputedStyle(carousel.listWrapper),
      itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
      itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
      containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
      containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

    if(!carousel.itemAutoSize) {
      carousel.itemAutoSize = itemWidth;
    }

    // if carousel.listWrapper is hidden -> make sure to retrieve the proper width
    containerWidth = getCarouselWidth(carousel, containerWidth);

    if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
      carousel.itemOriginalWidth = itemWidth;
    } else {
      itemWidth = carousel.itemOriginalWidth;
    }

    if(carousel.itemAutoSize) {
      carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
      itemWidth = carousel.itemOriginalWidth;
    }
    // make sure itemWidth is smaller than container width
    if(containerWidth < itemWidth) {
      carousel.itemOriginalWidth = containerWidth
      itemWidth = carousel.itemOriginalWidth;
    }
    // get proper width of elements
    carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
    carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
    carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
    carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
    // flexbox fallback
    if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
    
    // this is used when loop == off
    carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
    if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;

    centerItems(carousel); // center items if carousel.items.length < visibItemsNb
    alignControls(carousel); // check if controls need to be aligned to a different element
  };

  function setItemsWidth(carousel, bool) {
    for(var i = 0; i < carousel.items.length; i++) {
      carousel.items[i].style.width = carousel.itemsWidth+"px";
      if(bool) carousel.initItems.push(carousel.items[i]);
    }
  };

  function updateCarouselClones(carousel) { 
    if(!carousel.options.loop) return;
    // take care of clones after visible items (needs to run after the update of clones before visible items)
    if(carousel.items.length < carousel.visibItemsNb*3) {
      insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
    } else if(carousel.items.length > carousel.visibItemsNb*3 ) {
      removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
    }
    // set proper translate value for the container
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function initCarouselEvents(carousel) {
    // listen for click on previous/next arrow
    // dots navigation
    if(carousel.options.nav) {
      carouselCreateNavigation(carousel);
      carouselInitNavigationEvents(carousel);
    }

    if(carousel.controls.length > 0) {
      carousel.controls[0].addEventListener('click', function(event){
        event.preventDefault();
        showPrevItems(carousel);
        updateAriaLive(carousel);
      });
      carousel.controls[1].addEventListener('click', function(event){
        event.preventDefault();
        showNextItems(carousel);
        updateAriaLive(carousel);
      });

      // update arrow visility -> loop == off only
      resetCarouselControls(carousel);
    }
    // autoplay
    if(carousel.options.autoplay) {
      startAutoplay(carousel);
      // pause autoplay if user is interacting with the carousel
      carousel.element.addEventListener('mouseenter', function(event){
        pauseAutoplay(carousel);
        carousel.autoplayPaused = true;
      });
      carousel.element.addEventListener('focusin', function(event){
        pauseAutoplay(carousel);
        carousel.autoplayPaused = true;
      });
      carousel.element.addEventListener('mouseleave', function(event){
        carousel.autoplayPaused = false;
        startAutoplay(carousel);
      });
      carousel.element.addEventListener('focusout', function(event){
        carousel.autoplayPaused = false;
        startAutoplay(carousel);
      });
    }
    // drag events
    if(carousel.options.drag && window.requestAnimationFrame) {
      //init dragging
      new SwipeContent(carousel.element);
      carousel.element.addEventListener('dragStart', function(event){
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
        if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
        Util.addClass(carousel.element, 'carousel--is-dragging');
        pauseAutoplay(carousel);
        carousel.dragStart = event.detail.x;
        animateDragEnd(carousel);
      });
      carousel.element.addEventListener('dragging', function(event){
        if(!carousel.dragStart) return;
        if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
        var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
        if(!carousel.options.loop) {
          translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
        }
        setTranslate(carousel, 'translateX('+translate+'px)');
      });
    }
    // reset on resize
    window.addEventListener('resize', function(event){
      pauseAutoplay(carousel);
      clearTimeout(carousel.resizeId);
      carousel.resizeId = setTimeout(function(){
        resetCarouselResize(carousel);
        // reset dots navigation
        resetDotsNavigation(carousel);
        resetCarouselControls(carousel);
        setCounterItem(carousel);
        startAutoplay(carousel);
        centerItems(carousel); // center items if carousel.items.length < visibItemsNb
        alignControls(carousel);
      }, 250)
    });
  };

  function showPrevItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
    animateList(carousel, '0', 'prev');
  };

  function showNextItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
    animateList(carousel, carousel.translateContainer*2+'px', 'next');
  };

  function animateDragEnd(carousel) { // end-of-dragging animation
    carousel.element.addEventListener('dragEnd', function cb(event){
      carousel.element.removeEventListener('dragEnd', cb);
      Util.removeClass(carousel.element, 'carousel--is-dragging');
      if(event.detail.x - carousel.dragStart < -40) {
        carousel.animating = false;
        showNextItems(carousel);
      } else if(event.detail.x - carousel.dragStart > 40) {
        carousel.animating = false;
        showPrevItems(carousel);
      } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
        return;
      } else { // not dragged enought -> do not update carousel, just reset
        carousel.animating = true;
        animateList(carousel, carousel.translateContainer+'px', false);
      }
      carousel.dragStart = false;
    });
  };

  function animateList(carousel, translate, direction) { // takes care of changing visible items
    pauseAutoplay(carousel);
    Util.addClass(carousel.list, 'carousel__list--animating');
    var initTranslate = carousel.totTranslate;
    if(!carousel.options.loop) {
      translate = noLoopTranslateValue(carousel, direction);
    }
    setTranslate(carousel, 'translateX('+translate+')');
    if(transitionSupported) {
      carousel.list.addEventListener('transitionend', function cb(event){
        if(event.propertyName && event.propertyName != 'transform') return;
        Util.removeClass(carousel.list, 'carousel__list--animating');
        carousel.list.removeEventListener('transitionend', cb);
        animateListCb(carousel, direction);
      });
    } else {
      animateListCb(carousel, direction);
    }
    if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
      // translate value was not updated -> trigger transitionend event to restart carousel
      carousel.list.dispatchEvent(new CustomEvent('transitionend'));
    }
    resetCarouselControls(carousel);
    setCounterItem(carousel);
  };

  function noLoopTranslateValue(carousel, direction) {
    var translate = carousel.totTranslate;
    if(direction == 'next') {
      translate = carousel.totTranslate + carousel.translateContainer;
    } else if(direction == 'prev') {
      translate = carousel.totTranslate - carousel.translateContainer;
    } else if(direction == 'click') {
      translate = carousel.selectedDotIndex*carousel.translateContainer;
    }
    if(translate > 0)  {
      translate = 0;
      carousel.selectedItem = 0;
    }
    if(translate < - carousel.translateContainer - carousel.containerWidth) {
      translate = - carousel.translateContainer - carousel.containerWidth;
      carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
    }
    if(carousel.visibItemsNb > carousel.items.length) translate = 0;
    carousel.totTranslate = translate;
    return translate + 'px';
  };

  function animateListCb(carousel, direction) { // reset actions after carousel has been updated
    if(direction) updateClones(carousel, direction);
    carousel.animating = false;
    // reset autoplay
    startAutoplay(carousel);
    // reset tab index
    resetItemsTabIndex(carousel);
  };

  function updateClones(carousel, direction) {
    if(!carousel.options.loop) return;
    // at the end of each animation, we need to update the clones before and after the visible items
    var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
    // remove clones you do not need anymore
    removeClones(carousel, index, false);
    // add new clones 
    (direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
    //reset transform
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function insertBefore(carousel, nb, delta) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    var start = 0;
    if(delta) start = delta;
    for(var i = start; i < nb; i++) {
      var index = getIndex(carousel, carousel.selectedItem - i - 1),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.insertBefore(clone, clones.firstChild);
    }
    carousel.list.insertBefore(clones, carousel.list.firstChild);
    emitCarouselUpdateEvent(carousel);
  };

  function insertAfter(carousel, nb, init) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    for(var i = init; i < nb + init; i++) {
      var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.appendChild(clone);
    }
    carousel.list.appendChild(clones);
    emitCarouselUpdateEvent(carousel);
  };

  function removeClones(carousel, index, bool) {
    if(!carousel.options.loop) return;
    if( !bool) {
      bool = carousel.visibItemsNb;
    }
    for(var i = 0; i < bool; i++) {
      if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
    }
  };

  function resetCarouselResize(carousel) { // reset carousel on resize
    var visibleItems = carousel.visibItemsNb;
    // get new items min-width value
    resetItemAutoSize(carousel);
    initCarouselLayout(carousel); 
    setItemsWidth(carousel, false);
    resetItemsWidth(carousel); // update the array of original items -> array used to create clones
    if(carousel.options.loop) {
      if(visibleItems > carousel.visibItemsNb) {
        removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
      } else if(visibleItems < carousel.visibItemsNb) {
        insertBefore(carousel, carousel.visibItemsNb, visibleItems);
      }
      updateCarouselClones(carousel); // this will take care of translate + after elements
    } else {
      // reset default translate to a multiple value of (itemWidth + margin)
      var translate = noLoopTranslateValue(carousel);
      setTranslate(carousel, 'translateX('+translate+')');
    }
    resetItemsTabIndex(carousel); // reset focusable elements
  };

  function resetItemAutoSize(carousel) {
    if(!cssPropertiesSupported) return;
    // remove inline style
    carousel.items[0].removeAttribute('style');
    // get original item width 
    carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
  };

  function resetItemsWidth(carousel) {
    for(var i = 0; i < carousel.initItems.length; i++) {
      carousel.initItems[i].style.width = carousel.itemsWidth+"px";
    }
  };

  function resetItemsTabIndex(carousel) {
    var carouselActive = carousel.items.length > carousel.visibItemsNb;
    var j = carousel.items.length;
    for(var i = 0; i < carousel.items.length; i++) {
      if(carousel.options.loop) {
        if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      } else {
        if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      }
    }
    resetVisibilityOverflowItems(carousel, j);
  };

  function startAutoplay(carousel) {
    if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
      carousel.autoplayId = setInterval(function(){
        showNextItems(carousel);
      }, carousel.options.autoplayInterval);
    }
  };

  function pauseAutoplay(carousel) {
    if(carousel.options.autoplay) {
      clearInterval(carousel.autoplayId);
      carousel.autoplayId = false;
    }
  };

  function initAriaLive(carousel) { // create an aria-live region for SR
    if(!carousel.options.ariaLive) return;
    // create an element that will be used to announce the new visible slide to SR
    var srLiveArea = document.createElement('div');
    Util.setAttributes(srLiveArea, {'class': 'sr-only js-carousel__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
    carousel.element.appendChild(srLiveArea);
    carousel.ariaLive = srLiveArea;
  };

  function updateAriaLive(carousel) { // announce to SR which items are now visible
    if(!carousel.options.ariaLive) return;
    carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
  };

  function getIndex(carousel, index) {
    if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
    if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
    return index;
  };

  function getPositiveValue(value, add) {
    value = value + add;
    if(value > 0) return value;
    else return getPositiveValue(value, add);
  };

  function setTranslate(carousel, translate) {
    carousel.list.style.transform = translate;
    carousel.list.style.msTransform = translate;
  };

  function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
    var closestHidden = carousel.listWrapper.closest('.sr-only');
    if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
      Util.removeClass(closestHidden, 'sr-only');
      computedWidth = carousel.listWrapper.offsetWidth;
      Util.addClass(closestHidden, 'sr-only');
    } else if(isNaN(computedWidth)){
      computedWidth = getHiddenParentWidth(carousel.element, carousel);
    }
    return computedWidth;
  };

  function getHiddenParentWidth(element, carousel) {
    var parent = element.parentElement;
    if(parent.tagName.toLowerCase() == 'html') return 0;
    var style = window.getComputedStyle(parent);
    if(style.display == 'none' || style.visibility == 'hidden') {
      parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
      var computedWidth = carousel.listWrapper.offsetWidth;
      parent.style.display = '';
      parent.style.visibility = '';
      return computedWidth;
    } else {
      return getHiddenParentWidth(parent, carousel);
    }
  };

  function resetCarouselControls(carousel) {
    if(carousel.options.loop) return;
    // update arrows status
    if(carousel.controls.length > 0) {
      (carousel.totTranslate == 0) 
        ? carousel.controls[0].setAttribute('disabled', true) 
        : carousel.controls[0].removeAttribute('disabled');
      (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
        ? carousel.controls[1].setAttribute('disabled', true) 
        : carousel.controls[1].removeAttribute('disabled');
    }
    // update carousel dots
    if(carousel.options.nav) {
      var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
      if(selectedDot.length > 0) Util.removeClass(selectedDot[0], carousel.options.navigationItemClass+'--selected');

      var newSelectedIndex = getSelectedDot(carousel);
      if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
        newSelectedIndex = carousel.navDots.length - 1;
      }
      Util.addClass(carousel.navDots[newSelectedIndex], carousel.options.navigationItemClass+'--selected');
    }
  };

  function emitCarouselUpdateEvent(carousel) {
    carousel.cloneList = [];
    var clones = carousel.element.querySelectorAll('.js-clone');
    for(var i = 0; i < clones.length; i++) {
      Util.removeClass(clones[i], 'js-clone');
      carousel.cloneList.push(clones[i]);
    }
    emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
  };

  function carouselCreateNavigation(carousel) {
    if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
  
    var navigation = document.createElement('ol'),
      navChildren = '';

    var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
    if(carousel.items.length <= carousel.visibItemsNb) {
      navClasses = navClasses + ' is-hidden';
    }
    navigation.setAttribute('class', navClasses);

    var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
      selectedDot = getSelectedDot(carousel),
      indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
    for(var i = 0; i < dotsNr; i++) {
      var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
      navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
    }
    navigation.innerHTML = navChildren;
    carousel.element.appendChild(navigation);
  };

  function carouselInitNavigationEvents(carousel) {
    carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
    carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
    carousel.navIdEvent = carouselNavigationClick.bind(carousel);
    carousel.navigation.addEventListener('click', carousel.navIdEvent);
  };

  function carouselRemoveNavigation(carousel) {
    if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
    if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
  };

  function resetDotsNavigation(carousel) {
    if(!carousel.options.nav) return;
    carouselRemoveNavigation(carousel);
    carouselCreateNavigation(carousel);
    carouselInitNavigationEvents(carousel);
  };

  function carouselNavigationClick(event) {
    var dot = event.target.closest('.js-carousel__nav-item');
    if(!dot) return;
    if(this.animating) return;
    this.animating = true;
    var index = Util.getIndexInArray(this.navDots, dot);
    this.selectedDotIndex = index;
    this.selectedItem = index*this.visibItemsNb;
    animateList(this, false, 'click');
  };

  function getSelectedDot(carousel) {
    return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
  };

  function initCarouselCounter(carousel) {
    if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
    setCounterItem(carousel);
  };

  function setCounterItem(carousel) {
    if(carousel.counter.length == 0) return;
    var totalItems = carousel.selectedItem + carousel.visibItemsNb;
    if(totalItems > carousel.items.length) totalItems = carousel.items.length;
    carousel.counter[0].textContent = totalItems;
  };

  function centerItems(carousel) {
    if(!carousel.options.justifyContent) return;
    Util.toggleClass(carousel.list, 'justify-center', carousel.items.length < carousel.visibItemsNb);
  };

  function alignControls(carousel) {
    if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
    if(!carousel.controlsAlignEl) {
      carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
    }
    if(!carousel.controlsAlignEl) return;
    var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
    for(var i = 0; i < carousel.controls.length; i++) {
      carousel.controls[i].style.marginBottom = translate + 'px';
    }
  };

  function emitCarouselEvents(carousel, eventName, eventDetail) {
    var event = new CustomEvent(eventName, {detail: eventDetail});
    carousel.element.dispatchEvent(event);
  };

  function resetVisibilityOverflowItems(carousel, j) {
    if(!carousel.options.overflowItems) return;
    var itemWidth = carousel.containerWidth/carousel.items.length,
      delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
      overflowItems = Math.ceil(delta/itemWidth);

    for(var i = 0; i < overflowItems; i++) {
      var indexPrev = j - 1 - i; // prev element
      if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
      var indexNext = j + carousel.visibItemsNb + i; // next element
      if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
    }
  };

  Carousel.defaults = {
    element : '',
    autoplay : false,
    autoplayInterval: 5000,
    loop: true,
    nav: false,
    navigationItemClass: 'carousel__nav-item',
    navigationClass: 'carousel__navigation',
    navigationPagination: false,
    drag: false,
    justifyContent: false,
    alignControls: false,
    overflowItems: false
  };

  window.Carousel = Carousel;

  //initialize the Carousel objects
  var carousels = document.getElementsByClassName('js-carousel'),
    flexSupported = Util.cssSupports('align-items', 'stretch'),
    transitionSupported = Util.cssSupports('transition'),
    cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));

  if( carousels.length > 0) {
    for( var i = 0; i < carousels.length; i++) {
      (function(i){
        var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
          autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
          drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
          loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
          nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
          navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
          navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
          navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
          overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
          alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
          justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
        new Carousel({element: carousels[i], autoplay : autoplay, autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
      })(i);
    }
  };
}());
// File#: _2_draggable-img-gallery
// Usage: codyhouse.co/license
(function() {
  var DragGallery = function(element) {
    this.element = element;
    this.list = this.element.getElementsByTagName('ul')[0];
    this.imgs = this.list.children;
    this.gestureHint = this.element.getElementsByClassName('drag-gallery__gesture-hint');// drag gesture hint
    this.galleryWidth = getGalleryWidth(this); 
    this.translate = 0; // store container translate value
    this.dragStart = false; // start dragging position
    // drag momentum option
    this.dragMStart = false;
    this.dragTimeMStart = false;
    this.dragTimeMEnd = false;
    this.dragMSpeed = false;
    this.dragAnimId = false;
    initDragGalleryEvents(this); 
  };

  function initDragGalleryEvents(gallery) {
    initDragging(gallery); // init dragging

    gallery.element.addEventListener('update-gallery-width', function(event){ // window resize
      gallery.galleryWidth = getGalleryWidth(gallery); 
      // reset translate value if not acceptable
      checkTranslateValue(gallery);
      setTranslate(gallery);
    });
     
    if(intersectionObsSupported) initOpacityAnim(gallery); // init image animation

    if(!reducedMotion && gallery.gestureHint.length > 0) initHintGesture(gallery); // init hint gesture element animation

    initKeyBoardNav(gallery);
  };

  function getGalleryWidth(gallery) {
    return gallery.list.scrollWidth - gallery.list.offsetWidth;
  };

  function initDragging(gallery) { // gallery drag
    new SwipeContent(gallery.element);
    gallery.element.addEventListener('dragStart', function(event){
      window.cancelAnimationFrame(gallery.dragAnimId);
      Util.addClass(gallery.element, 'drag-gallery--is-dragging'); 
      gallery.dragStart = event.detail.x;
      gallery.dragMStart = event.detail.x;
      gallery.dragTimeMStart = new Date().getTime();
      gallery.dragTimeMEnd = false;
      gallery.dragMSpeed = false;
      initDragEnd(gallery);
    });

    gallery.element.addEventListener('dragging', function(event){
      if(!gallery.dragStart) return;
      if(Math.abs(event.detail.x - gallery.dragStart) < 5) return;
      gallery.translate = Math.round(event.detail.x - gallery.dragStart + gallery.translate);
      gallery.dragStart = event.detail.x;
      checkTranslateValue(gallery);
      setTranslate(gallery);
    });
  };

  function initDragEnd(gallery) {
    gallery.element.addEventListener('dragEnd', function cb(event){
      gallery.element.removeEventListener('dragEnd', cb);
      Util.removeClass(gallery.element, 'drag-gallery--is-dragging');
      initMomentumDrag(gallery); // drag momentum
      gallery.dragStart = false;
    });
  };

  function initKeyBoardNav(gallery) {
    gallery.element.setAttribute('tabindex', 0);
    // navigate gallery using right/left arrows
    gallery.element.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
        keyboardNav(gallery, 'right');
      } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
        keyboardNav(gallery, 'left');
      }
    });
  };

  function keyboardNav(gallery, direction) {
    var delta = parseFloat(window.getComputedStyle(gallery.imgs[0]).marginRight) + gallery.imgs[0].offsetWidth;
    gallery.translate = (direction == 'right') ? gallery.translate - delta : gallery.translate + delta;
    checkTranslateValue(gallery);
    setTranslate(gallery);
  };

  function checkTranslateValue(gallery) { // make sure translate is in the right interval
    if(gallery.translate > 0) {
      gallery.translate = 0;
      gallery.dragMSpeed = 0;
    }
    if(Math.abs(gallery.translate) > gallery.galleryWidth) {
      gallery.translate = gallery.galleryWidth*-1;
      gallery.dragMSpeed = 0;
    }
  };

  function setTranslate(gallery) {
    gallery.list.style.transform = 'translateX('+gallery.translate+'px)';
    gallery.list.style.msTransform = 'translateX('+gallery.translate+'px)';
  };

  function initOpacityAnim(gallery) { // animate img opacities on drag
    for(var i = 0; i < gallery.imgs.length; i++) {
      var observer = new IntersectionObserver(opacityCallback.bind(gallery.imgs[i]), { threshold: [0, 0.1] });
		  observer.observe(gallery.imgs[i]);
    }
  };

  function opacityCallback(entries, observer) { // reveal images when they enter the viewport
    var threshold = entries[0].intersectionRatio.toFixed(1);
		if(threshold > 0) {
      Util.addClass(this, 'drag-gallery__item--visible');
      observer.unobserve(this);
    }
  };

  function initMomentumDrag(gallery) {
    // momentum effect when drag is over
    if(reducedMotion) return;
    var timeNow = new Date().getTime();
    gallery.dragMSpeed = 0.95*(gallery.dragStart - gallery.dragMStart)/(timeNow - gallery.dragTimeMStart);

    var currentTime = false;

    function animMomentumDrag(timestamp) {
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      currentTime = timestamp;
      if(Math.abs(gallery.dragMSpeed) < 0.01) {
        gallery.dragAnimId = false;
        return;
      } else {
        gallery.translate = Math.round(gallery.translate + (gallery.dragMSpeed*progress));
        checkTranslateValue(gallery);
        setTranslate(gallery);
        gallery.dragMSpeed = gallery.dragMSpeed*0.95;
        gallery.dragAnimId = window.requestAnimationFrame(animMomentumDrag);
      }
    };

    gallery.dragAnimId = window.requestAnimationFrame(animMomentumDrag);
  };

  function initHintGesture(gallery) { // show user a hint about gallery dragging
    var observer = new IntersectionObserver(hintGestureCallback.bind(gallery.gestureHint[0]), { threshold: [0, 1] });
		observer.observe(gallery.gestureHint[0]);
  };

  function hintGestureCallback(entries, observer) {
    var threshold = entries[0].intersectionRatio.toFixed(1);
		if(threshold > 0) {
      Util.addClass(this, 'drag-gallery__gesture-hint--animate');
      observer.unobserve(this);
    }
  };

  //initialize the DragGallery objects
  var dragGallery = document.getElementsByClassName('js-drag-gallery'),
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();

  if( dragGallery.length > 0 ) {
    var dragGalleryArray = [];
    for( var i = 0; i < dragGallery.length; i++) {
      (function(i){ 
        if(!intersectionObsSupported || reducedMotion) Util.addClass(dragGallery[i], 'drag-gallery--anim-off');
        dragGalleryArray.push(new DragGallery(dragGallery[i]));
      })(i);
    }

    // resize event
    var resizingId = false,
      customEvent = new CustomEvent('update-gallery-width');
    
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < dragGalleryArray.length; i++) {
        (function(i){dragGalleryArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  }
}());
// File#: _2_drawer-navigation
// Usage: codyhouse.co/license
(function() {
  function initDrNavControl(element) {
    var circle = element.getElementsByTagName('circle');
    if(circle.length > 0) {
      // set svg attributes to create fill-in animation on click
      initCircleAttributes(element, circle[0]);
    }

    var drawerId = element.getAttribute('aria-controls'),
      drawer = document.getElementById(drawerId);
    if(drawer) {
      // when the drawer is closed without click (e.g., user presses 'Esc') -> reset trigger status
      drawer.addEventListener('drawerIsClose', function(event){ 
        if(!event.detail || (event.detail && !event.detail.closest('.js-dr-nav-control[aria-controls="'+drawerId+'"]')) ) resetTrigger(element);
      });
    }
  };

  function initCircleAttributes(element, circle) {
    // set circle stroke-dashoffset/stroke-dasharray values
    var circumference = (2*Math.PI*circle.getAttribute('r')).toFixed(2);
    circle.setAttribute('stroke-dashoffset', circumference);
    circle.setAttribute('stroke-dasharray', circumference);
    Util.addClass(element, 'dr-nav-control--ready-to-animate');
  };

  function resetTrigger(element) {
    Util.removeClass(element, 'anim-menu-btn--state-b'); 
  };

  var drNavControl = document.getElementsByClassName('js-dr-nav-control');
  if(drNavControl.length > 0) initDrNavControl(drNavControl[0]);
}());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
	var Dropdown = function(element) {
		this.element = element;
		this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
		this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
		this.triggerFocus = false;
		this.dropdownFocus = false;
		this.hideInterval = false;
		// sublevels
		this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
		this.prevFocus = false; // store element that was in focus before focus changed
		this.addDropdownEvents();
	};
	
	Dropdown.prototype.addDropdownEvents = function(){
		//place dropdown
		var self = this;
		this.placeElement();
		this.element.addEventListener('placeDropdown', function(event){
			self.placeElement();
		});
		// init dropdown
		this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
		this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
		// init sublevels
		this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
	};

	Dropdown.prototype.placeElement = function() {
		var triggerPosition = this.trigger.getBoundingClientRect(),
			isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

		var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
		this.dropdown.setAttribute('style', xPosition);
	};

	Dropdown.prototype.initElementEvents = function(element, bool) {
		var self = this;
		element.addEventListener('mouseenter', function(){
			bool = true;
			self.showDropdown();
		});
		element.addEventListener('focus', function(){
			self.showDropdown();
		});
		element.addEventListener('mouseleave', function(){
			bool = false;
			self.hideDropdown();
		});
		element.addEventListener('focusout', function(){
			self.hideDropdown();
		});
	};

	Dropdown.prototype.showDropdown = function(){
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.showLevel(this.dropdown, true);
	};

	Dropdown.prototype.hideDropdown = function(){
		var self = this;
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.hideInterval = setTimeout(function(){
			var dropDownFocus = document.activeElement.closest('.js-dropdown'),
				inFocus = dropDownFocus && (dropDownFocus == self.element);
			// if not in focus and not hover -> hide
			if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
				self.hideLevel(self.dropdown);
				// make sure to hide sub/dropdown
				self.hideSubLevels();
				self.prevFocus = false;
			}
		}, 300);
	};

	Dropdown.prototype.initSublevels = function(){
		var self = this;
		var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
		for(var i = 0; i < dropdownMenu.length; i++) {
			var listItems = dropdownMenu[i].children;
			// bind hover
	    new menuAim({
	      menu: dropdownMenu[i],
	      activate: function(row) {
	      	var subList = row.getElementsByClassName('js-dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.showLevel(subList);
	      },
	      deactivate: function(row) {
	      	var subList = row.getElementsByClassName('dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.hideLevel(subList);
	      },
	      submenuSelector: '.js-dropdown__sub-wrapper',
	    });
		}
		// store focus element before change in focus
		this.element.addEventListener('keydown', function(event) { 
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				self.prevFocus = document.activeElement;
			}
		});
		// make sure that sublevel are visible when their items are in focus
		this.element.addEventListener('keyup', function(event) {
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				// focus has been moved -> make sure the proper classes are added to subnavigation
				var focusElement = document.activeElement,
					focusElementParent = focusElement.closest('.js-dropdown__menu'),
					focusElementSibling = focusElement.nextElementSibling;

				// if item in focus is inside submenu -> make sure it is visible
				if(focusElementParent && !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementParent);
				}
				// if item in focus triggers a submenu -> make sure it is visible
				if(focusElementSibling && !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementSibling);
				}

				// check previous element in focus -> hide sublevel if required 
				if( !self.prevFocus) return;
				var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
					prevFocusElementSibling = self.prevFocus.nextElementSibling;
				
				if( !prevFocusElementParent ) return;
				
				// element in focus and element prev in focus are siblings
				if( focusElementParent && focusElementParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}

				// element in focus is inside submenu triggered by element prev in focus
				if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
				
				// shift tab -> element in focus triggers the submenu of the element prev in focus
				if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
				
				var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
				
				// shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
				if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}
				
				if(prevFocusElementParent && Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')) {
					self.hideLevel(prevFocusElementParent);
				}
			}
		});
	};

	Dropdown.prototype.hideSubLevels = function(){
		var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
		if(visibleSubLevels.length == 0) return;
		while (visibleSubLevels[0]) {
			this.hideLevel(visibleSubLevels[0]);
	 	}
	 	var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
	 	while (hoveredItems[0]) {
			Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
	 	}
	};

	Dropdown.prototype.showLevel = function(level, bool){
		if(bool == undefined) {
			//check if the sublevel needs to be open to the left
			Util.removeClass(level, 'dropdown__menu--left');
			var boundingRect = level.getBoundingClientRect();
			if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) Util.addClass(level, 'dropdown__menu--left');
		}
		Util.addClass(level, 'dropdown__menu--is-visible');
		Util.removeClass(level, 'dropdown__menu--is-hidden');
	};

	Dropdown.prototype.hideLevel = function(level){
		if(!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
		Util.removeClass(level, 'dropdown__menu--is-visible');
		Util.addClass(level, 'dropdown__menu--is-hidden');
		
		level.addEventListener('animationend', function cb(){
			level.removeEventListener('animationend', cb);
			Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
		});
	};

	window.Dropdown = Dropdown;

	var dropdown = document.getElementsByClassName('js-dropdown');
	if( dropdown.length > 0 ) { // init Dropdown objects
		for( var i = 0; i < dropdown.length; i++) {
			(function(i){new Dropdown(dropdown[i]);})(i);
		}
	}
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
			toggleMenuNavigation(event.detail);
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function doneResizing() {
			if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
				menuTrigger.click();
			}
		};
		
		function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
			Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
			Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
			menuTrigger.setAttribute('aria-expanded', bool);
			if(bool) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		};
	}
}());
// File#: _2_floating-side-nav
// Usage: codyhouse.co/license
(function() {
  var FSideNav = function(element) {
		this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.list = this.element.getElementsByClassName('js-float-sidenav__list')[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.sectionsContainer = document.getElementsByClassName('js-float-sidenav-target');
		this.firstFocusable = getFSideNavFirstFocusable(this);
		this.selectedTrigger = null;
    this.showClass = "float-sidenav--is-visible";
    this.clickScrolling = false;
    this.intervalID = false;
		initFSideNav(this);
  };

  function getSections(nav) {
    var sections = [];
    // get all content sections
    for(var i = 0; i < nav.anchors.length; i++) {
      var section = document.getElementById(nav.anchors[i].getAttribute('href').replace('#', ''));
      if(section) sections.push(section);
    }
    return sections;
  };

  function getFSideNavFirstFocusable(nav) {
    var focusableEle = nav.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  };
  
  function initFSideNav(nav) {
    initButtonTriggers(nav); // mobile version behaviour

    initAnchorEvents(nav); // select anchor in list

    if(intersectionObserverSupported) {
      initSectionScroll(nav); // update anchor appearance on scroll
    } else {
      Util.addClass(nav.element, 'float-sidenav--on-target');
    }
  };

  function initButtonTriggers(nav) { // mobile only
    if ( !nav.triggers ) return;

    for(var i = 0; i < nav.triggers.length; i++) {
      nav.triggers[i].addEventListener('click', function(event) {
        openFSideNav(nav, event);
      });
    }

    // close side nav when clicking on close button/bg layer
    nav.element.addEventListener('click', function(event) {
      if(event.target.closest('.js-float-sidenav__close-btn') || Util.hasClass(event.target, 'js-float-sidenav')) {
        closeFSideNav(nav, event);
      }
    });

    // listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				closeFSideNav(nav, event);
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close navigation on mobile if open when nav loses focus
        if( !document.activeElement.closest('.js-float-sidenav')) closeFSideNav(nav, event, true);
			}
		});
  };

  function openFSideNav(nav, event) { // open side nav - mobile only
    event.preventDefault();
    nav.selectedTrigger = event.target;
    event.target.setAttribute('aria-expanded', 'true');
    Util.addClass(nav.element, nav.showClass);
    nav.element.addEventListener('transitionend', function cb(event){
      nav.element.removeEventListener('transitionend', cb);
      nav.firstFocusable.focus();
    });
  };

  function closeFSideNav(nav, event, bool) { // close side nav - mobile only
    if( !Util.hasClass(nav.element, nav.showClass) ) return;
    if(event) event.preventDefault();
    Util.removeClass(nav.element, nav.showClass);
    if(!nav.selectedTrigger) return;
    nav.selectedTrigger.setAttribute('aria-expanded', 'false');
    if(!bool) nav.selectedTrigger.focus();
    nav.selectedTrigger = false; 
  };

  function initAnchorEvents(nav) {
    nav.list.addEventListener('click', function(event){
      var anchor = event.target.closest('a[href^="#"]');
      if(!anchor || Util.hasClass(anchor, 'float-sidenav__link--selected')) return;
      if(nav.clickScrolling) { // a different link has already been clicked
        event.preventDefault();
        return;
      }
      // reset link apperance 
      nav.clickScrolling = true;
      resetAnchors(nav, anchor);
      closeFSideNav(nav, false, true);
      if(!canScroll()) window.dispatchEvent(new CustomEvent('scroll'));
    });
  };

  function canScroll() {
    var pageHeight = document.documentElement.offsetHeight,
      windowHeight = window.innerHeight,
      scrollPosition = window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
    
    return !(pageHeight - 2 <= windowHeight + scrollPosition);
  };

  function resetAnchors(nav, anchor) {
    if(!intersectionObserverSupported) return;
    for(var i = 0; i < nav.anchors.length; i++) Util.removeClass(nav.anchors[i], 'float-sidenav__link--selected');
    if(anchor) Util.addClass(anchor, 'float-sidenav__link--selected');
  };

  function initSectionScroll(nav) {
    // check when a new section enters the viewport
    var observer = new IntersectionObserver(
      function(entries, observer) { 
        entries.forEach(function(entry){
          var threshold = entry.intersectionRatio.toFixed(1);
          
          if(!nav.clickScrolling) { // do not update classes if user clicked on a link
            getVisibleSection(nav);
          }

          // if first section is not inside the viewport - reset anchors
          if(nav.sectionsContainer && entry.target == nav.sections[0] && threshold == 0 && nav.sections[0].getBoundingClientRect().top > 0) {
            setSectionsLimit(nav);
          }
        });

        // check if there's a selected dot and toggle the --on-target class from the nav
        Util.toggleClass(nav.element, 'float-sidenav--on-target', nav.list.getElementsByClassName('float-sidenav__link--selected').length != 0);
      }, 
      {
        rootMargin: "0px 0px -50% 0px"
      }
    );

    for(var i = 0; i < nav.sections.length; i++) {
      observer.observe(nav.sections[i]);
    }

    // detect when sections container is inside/outside the viewport
    if(nav.sectionsContainer) {
      var containerObserver = new IntersectionObserver(
        function(entries, observer) { 
          entries.forEach(function(entry){
            var threshold = entry.intersectionRatio.toFixed(1);

            if(entry.target.getBoundingClientRect().top < 0) {
              if(threshold == 0) {
                setSectionsLimit(nav);
              } else {
                activateLastSection(nav);
              }
            }
          });
        },
        {threshold: [0, 0.1, 1]}
      );

      containerObserver.observe(nav.sectionsContainer[0]);
    }

    // detect the end of scrolling -> reactivate IntersectionObserver on scroll
    nav.element.addEventListener('float-sidenav-scroll', function(event){
      if(!nav.clickScrolling) getVisibleSection(nav);
      nav.clickScrolling = false;
    });
  };

  function setSectionsLimit(nav) {
    if(!nav.clickScrolling) resetAnchors(nav, false);
    Util.removeClass(nav.element, 'float-sidenav--on-target');
  };

  function activateLastSection(nav) {
    Util.addClass(nav.element, 'float-sidenav--on-target');
    if(nav.list.getElementsByClassName('float-sidenav__link--selected').length == 0 ) {
      Util.addClass(nav.anchors[nav.anchors.length - 1], 'float-sidenav__link--selected');
    }
  };

  function getVisibleSection(nav) {
    if(nav.intervalID) return;
    nav.intervalID = setTimeout(function(){
      var halfWindowHeight = window.innerHeight/2,
      index = -1;
      for(var i = 0; i < nav.sections.length; i++) {
        var top = nav.sections[i].getBoundingClientRect().top;
        if(top < halfWindowHeight) index = i;
      }
      if(index > -1) {
        resetAnchors(nav, nav.anchors[index]);
      }
      nav.intervalID = false;
    }, 100);
  };

  //initialize the Side Nav objects
  var fixedNav = document.getElementsByClassName('js-float-sidenav'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  var fixedNavArray = [];
	if( fixedNav.length > 0 ) {
		for( var i = 0; i < fixedNav.length; i++) {
			(function(i){ fixedNavArray.push(new FSideNav(fixedNav[i])) ; })(i);
    }
    
    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      customEvent = new CustomEvent('float-sidenav-scroll');
      
    window.addEventListener('scroll', function() {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    function doneScrolling() {
      for( var i = 0; i < fixedNavArray.length; i++) {
        (function(i){fixedNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = Util.getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			Util.addClass(navigation, 'header-v3__nav--is-visible');
			Util.addClass(menuTrigger, 'switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				Util.toggleClass(navigation, 'header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					Util.removeClass(navigation, 'header-v3__nav--is-visible header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				Util.removeClass(menuTrigger, 'switch-icon--disabled');
			});
			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			Util.addClass(searchTrigger[0], 'switch-icon--disabled');
			Util.toggleClass(mainHeader[0], 'header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				Util.removeClass(searchTrigger[0], 'switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};
	}
}());
// File#: _2_menu-bar
// Usage: codyhouse.co/license
(function() {
  var MenuBar = function(element) {
    this.element = element;
    this.items = Util.getChildrenByClassName(this.element, 'menu-bar__item');
    this.mobHideItems = this.element.getElementsByClassName('menu-bar__item--hide');
    this.moreItemsTrigger = this.element.getElementsByClassName('js-menu-bar__trigger');
    initMenuBar(this);
  };

  function initMenuBar(menu) {
    setMenuTabIndex(menu); // set correct tabindexes for menu item
    initMenuBarMarkup(menu); // create additional markup
    checkMenuLayout(menu); // set menu layout
    Util.addClass(menu.element, 'menu-bar--loaded'); // reveal menu

    // custom event emitted when window is resized
    menu.element.addEventListener('update-menu-bar', function(event){
      checkMenuLayout(menu);
      if(menu.menuInstance) menu.menuInstance.toggleMenu(false, false); // close dropdown
    });

    // keyboard events 
    // open dropdown when pressing Enter on trigger element
    if(menu.moreItemsTrigger.length > 0) {
      menu.moreItemsTrigger[0].addEventListener('keydown', function(event) {
        if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
          if(!menu.menuInstance) return;
          menu.menuInstance.selectedTrigger = menu.moreItemsTrigger[0];
          menu.menuInstance.toggleMenu(!Util.hasClass(menu.subMenu, 'menu--is-visible'), true);
        }
      });

      // close dropdown on esc
      menu.subMenu.addEventListener('keydown', function(event) {
        if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) { // close submenu on esc
          if(menu.menuInstance) menu.menuInstance.toggleMenu(false, true);
        }
      });
    }
    
    // navigate menu items using left/right arrows
    menu.element.addEventListener('keydown', function(event) {
      if( (event.keyCode && event.keyCode == 39) || (event.key && event.key.toLowerCase() == 'arrowright') ) {
        navigateItems(menu.items, event, 'next');
      } else if( (event.keyCode && event.keyCode == 37) || (event.key && event.key.toLowerCase() == 'arrowleft') ) {
        navigateItems(menu.items, event, 'prev');
      }
    });
  };

  function setMenuTabIndex(menu) { // set tabindexes for the menu items to allow keyboard navigation
    var nextItem = false;
    for(var i = 0; i < menu.items.length; i++ ) {
      if(i == 0 || nextItem) menu.items[i].setAttribute('tabindex', '0');
      else menu.items[i].setAttribute('tabindex', '-1');
      if(i == 0 && menu.moreItemsTrigger.length > 0) nextItem = true;
      else nextItem = false;
    }
  };

  function initMenuBarMarkup(menu) {
    if(menu.mobHideItems.length == 0 ) { // no items to hide on mobile - remove trigger
      if(menu.moreItemsTrigger.length > 0) menu.element.removeChild(menu.moreItemsTrigger[0]);
      return;
    }

    if(menu.moreItemsTrigger.length == 0) return;

    // create the markup for the Menu element
    var content = '';
    menu.menuControlId = 'submenu-bar-'+Date.now();
    for(var i = 0; i < menu.mobHideItems.length; i++) {
      var item = menu.mobHideItems[i].cloneNode(true),
        svg = item.getElementsByTagName('svg')[0],
        label = item.getElementsByClassName('menu-bar__label')[0];

      svg.setAttribute('class', 'icon menu__icon');
      content = content + '<li role="menuitem"><span class="menu__content js-menu__content">'+svg.outerHTML+'<span>'+label.innerHTML+'</span></span></li>';
    }

    Util.setAttributes(menu.moreItemsTrigger[0], {'role': 'button', 'aria-expanded': 'false', 'aria-controls': menu.menuControlId, 'aria-haspopup': 'true'});

    var subMenu = document.createElement('menu'),
      customClass = menu.element.getAttribute('data-menu-class');
    Util.setAttributes(subMenu, {'id': menu.menuControlId, 'class': 'menu js-menu '+customClass});
    subMenu.innerHTML = content;
    document.body.appendChild(subMenu);

    menu.subMenu = subMenu;
    menu.subItems = subMenu.getElementsByTagName('li');

    menu.menuInstance = new Menu(menu.subMenu); // this will handle the dropdown behaviour
  };

  function checkMenuLayout(menu) { // switch from compressed to expanded layout and viceversa
    var layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(menu.element, 'menu-bar--collapsed', layout == 'collapsed');
  };

  function navigateItems(list, event, direction, prevIndex) { // keyboard navigation among menu items
    event.preventDefault();
    var index = (typeof prevIndex !== 'undefined') ? prevIndex : Util.getIndexInArray(list, event.target),
      nextIndex = direction == 'next' ? index + 1 : index - 1;
    if(nextIndex < 0) nextIndex = list.length - 1;
    if(nextIndex > list.length - 1) nextIndex = 0;
    // check if element is visible before moving focus
    (list[nextIndex].offsetParent === null) ? navigateItems(list, event, direction, nextIndex) : Util.moveFocus(list[nextIndex]);
  };

  function checkMenuClick(menu, target) { // close dropdown when clicking outside the menu element
    if(menu.menuInstance && !menu.moreItemsTrigger[0].contains(target) && !menu.subMenu.contains(target)) menu.menuInstance.toggleMenu(false, false);
  };

  // init MenuBars objects
  var menuBars = document.getElementsByClassName('js-menu-bar');
  if( menuBars.length > 0 ) {
    var j = 0,
      menuBarArray = [];
    for( var i = 0; i < menuBars.length; i++) {
      var beforeContent = getComputedStyle(menuBars[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){menuBarArray.push(new MenuBar(menuBars[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-menu-bar');
      // update Menu Bar layout on resize  
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 150);
      });

      // close menu when clicking outside it
      window.addEventListener('click', function(event){
        menuBarArray.forEach(function(element){
          checkMenuClick(element, event.target);
        });
      });

      function doneResizing() {
        for( var i = 0; i < menuBars.length; i++) {
          (function(i){menuBars[i].dispatchEvent(customEvent)})(i);
        };
      };
    }
  }
}());
// File#: _2_modal-video
// Usage: codyhouse.co/license
(function() {
	var ModalVideo = function(element) {
		this.element = element;
		this.modalContent = this.element.getElementsByClassName('js-modal-video__content')[0];
		this.media = this.element.getElementsByClassName('js-modal-video__media')[0];
		this.contentIsIframe = this.media.tagName.toLowerCase() == 'iframe';
		this.modalIsOpen = false;
		this.initModalVideo();
	};

	ModalVideo.prototype.initModalVideo = function() {
		var self = this;
		// reveal modal content when iframe is ready
		this.addLoadListener();
		// listen for the modal element to be open -> set new iframe src attribute
		this.element.addEventListener('modalIsOpen', function(event){
			self.modalIsOpen = true;
			self.media.setAttribute('src', event.detail.closest('[aria-controls]').getAttribute('data-url'));
		});
		// listen for the modal element to be close -> reset iframe and hide modal content
		this.element.addEventListener('modalIsClose', function(event){
			self.modalIsOpen = false;
			Util.addClass(self.element, 'modal--is-loading');
			self.media.setAttribute('src', '');
		});
	};

	ModalVideo.prototype.addLoadListener = function() {
		var self = this;
		if(this.contentIsIframe) {
			this.media.onload = function () {
				self.revealContent();
			};
		} else {
			this.media.addEventListener('loadedmetadata', function(){
				self.revealContent();
			});
		}
		
	};

	ModalVideo.prototype.revealContent = function() {
		if( !this.modalIsOpen ) return;
		Util.removeClass(this.element, 'modal--is-loading');
		this.contentIsIframe ? this.media.contentWindow.focus() : this.media.focus();
	};

	//initialize the ModalVideo objects
	var modalVideos = document.getElementsByClassName('js-modal-video__media');
	if( modalVideos.length > 0 ) {
		for( var i = 0; i < modalVideos.length; i++) {
			(function(i){new ModalVideo(modalVideos[i].closest('.js-modal'));})(i);
		}
	}
}());
// File#: _2_off-canvas-navigation
// Usage: codyhouse.co/license
(function() {
  var OffCanvasNav = function(element) {
    this.element = element;
    this.panel = this.element.getElementsByClassName('js-off-canvas__panel')[0];
    this.trigger = document.querySelectorAll('[aria-controls="'+this.panel.getAttribute('id')+'"]')[0];
    this.svgAnim = this.trigger.getElementsByTagName('circle');
    initOffCanvasNav(this);
  };

  function initOffCanvasNav(canvas) {
    if(transitionSupported) {
      // do not allow click on menu icon while the navigation is animating
      canvas.trigger.addEventListener('click', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('openPanel', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('transitionend', function(event){
        if(event.propertyName == 'visibility') {
          canvas.trigger.style.setProperty('pointer-events', '');
        }
      });
    }

    if(canvas.svgAnim.length > 0) { // create the circle fill-in effect
      var circumference = (2*Math.PI*canvas.svgAnim[0].getAttribute('r')).toFixed(2);
      canvas.svgAnim[0].setAttribute('stroke-dashoffset', circumference);
      canvas.svgAnim[0].setAttribute('stroke-dasharray', circumference);
      Util.addClass(canvas.trigger, 'offnav-control--ready-to-animate');
    }
    
    canvas.panel.addEventListener('closePanel', function(event){
      // if the navigation is closed using keyboard or a11y close btn -> change trigger icon appearance (from arrow to menu icon) 
      if(event.detail == 'key' || event.detail == 'close-btn') {
        canvas.trigger.click();
      }
    });
  };

  // init OffCanvasNav objects
  var offCanvasNav = document.getElementsByClassName('js-off-canvas--nav'),
    transitionSupported = Util.cssSupports('transition');
	if( offCanvasNav.length > 0 ) {
		for( var i = 0; i < offCanvasNav.length; i++) {
			(function(i){new OffCanvasNav(offCanvasNav[i]);})(i);
		}
	}
}());
// File#: _2_slideshow-preview-mode
// Usage: codyhouse.co/license
(function() {
	var SlideshowPrew = function(opts) {
		this.options = Util.extend(SlideshowPrew.defaults , opts);
		this.element = this.options.element;
		this.list = this.element.getElementsByClassName('js-slideshow-pm__list')[0];
		this.items = this.list.getElementsByClassName('js-slideshow-pm__item');
		this.controls = this.element.getElementsByClassName('js-slideshow-pm__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.itemWidth = false;
		this.itemMargin = false;
		this.containerWidth = false;
		this.resizeId = false;
		// we will need this to implement keyboard nav
		this.firstFocusable = false;
		this.lastFocusable = false;
		// fallback for browsers not supporting flexbox
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
		Util.addClass(this.element, 'slideshow-pm--js-loaded');
	};

	SlideshowPrew.prototype.showNext = function(autoplay) {
		showNewItem(this, this.selectedSlide + 1, 'next', autoplay);
	};

	SlideshowPrew.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	SlideshowPrew.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	SlideshowPrew.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext(true);
			}, self.options.autoplayInterval);
		}
	};

	SlideshowPrew.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow-pm__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow-pm__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow-pm__item--selected')[0]);
		// now set translate value to the container element
		setTranslateValue(slideshow);
		setTranslate(slideshow);
		resetSlideshowNav(slideshow, 0, slideshow.selectedSlide);
		setFocusableElements(slideshow);
		// if flexbox is not supported, set a width for the list element
		if(!flexSupported) resetSlideshowFlexFallback(slideshow);
		// now add class to animate while translating
		setTimeout(function(){Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');}, 50);
		// add arai-hidden to not selected slides
		for(var i = 0; i < slideshow.items.length; i++) {
			(i == slideshow.selectedSlide) ? slideshow.items[i].removeAttribute('aria-hidden') : slideshow.items[i].setAttribute('aria-hidden', 'true');
		}
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow-pm__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			var navigation = document.createElement('ol'),
				navChildren = '';
			
			navigation.setAttribute('class', 'slideshow-pm__navigation');
			for(var i = 0; i < slideshow.items.length; i++) {
				var className = (i == slideshow.selectedSlide) ? 'class="slideshow-pm__nav-item slideshow-pm__nav-item--selected js-slideshow-pm__nav-item"' :  'class="slideshow-pm__nav-item js-slideshow-pm__nav-item"',
					navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow-pm__nav-current-label">Current Item</span>' : '';
				navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
			}

			navigation.innerHTML = navChildren;
			slideshow.navCurrentLabel = navigation.getElementsByClassName('js-slideshow-pm__nav-current-label')[0]; 
			slideshow.element.appendChild(navigation);
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow-pm__nav-item');

			navigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			navigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext(false);
				updateAriaLive(slideshow);
			});
		}
		// navigate slideshow when clicking on preview
		if(slideshow.options.prewNav) {
			slideshow.element.addEventListener('click', function(event){
				var item = event.target.closest('.js-slideshow-pm__item');
				if(item && !Util.hasClass(item, 'slideshow-pm__item--selected')) {
					slideshow.showItem(Util.getIndexInArray(slideshow.items, item));
				}
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext(false);
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// keyboard navigation
		initKeyboardEvents(slideshow);
		// reset on resize
    window.addEventListener('resize', function(event){
    	slideshow.pauseAutoplay();
      clearTimeout(slideshow.resizeId);
      slideshow.resizeId = setTimeout(function(){
        resetSlideshowResize(slideshow);
        setTimeout(function(){slideshow.startAutoplay();}, 60);
      }, 250)
    });
	};

	function initKeyboardEvents(slideshow) {
		// tab on selected slide -> if last focusable -> move to prev or next arrow
		// tab + shift selected slide -> if first focusable -> move to container
		if(slideshow.controls.length > 0) {
			// tab+shift on prev arrow -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[0].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey ) moveFocusToLast(slideshow);
			});
			// tab+shift on next arrow -> if first slide selectes -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[1].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey && (slideshow.selectedSlide == 0)) moveFocusToLast(slideshow);
			});
		}
		// check tab is pressed when focus is inside selected slide
		slideshow.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				var target = event.target.closest('.js-slideshow-pm__item');
				if(target && Util.hasClass(target, 'slideshow-pm__item--selected')) moveFocusOutsideSlide(slideshow, event);
				else if(target || Util.hasClass(event.target, 'js-slideshow-pm') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			} 
		});

		// detect tab moves to slideshow 
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
				var target = event.target.closest('.js-slideshow-prew__item');
				if(target || Util.hasClass(event.target, 'js-slideshow-prew') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			}
		});
	};

	function moveFocusToLast(slideshow) {
		event.preventDefault();
		if(slideshow.lastFocusable)	{
			slideshow.lastFocusable.focus();
		} else {
			Util.moveFocus(slideshow.element);
		}
	};

	function moveFocusToSelectedSlide(slideshow) { // focus is inside a slide that is not selected
		event.preventDefault();
		if(slideshow.firstFocusable)	{
			slideshow.firstFocusable.focus();
		} else if(slideshow.controls.length > 0) {
			(slideshow.selectedSlide == 0) ? slideshow.controls[1].getElementsByTagName('button')[0].focus() : slideshow.controls[0].getElementsByTagName('button')[0].focus();
		} else if(slideshow.options.navigation) {
			slideshow.navigation.getElementsByClassName('js-slideshow-pm__nav-item')[0].getElementsByTagName('button')[0].focus();
		}
	};

	function moveFocusOutsideSlide(slideshow, event) {
		if(event.shiftKey && slideshow.firstFocusable && event.target == slideshow.firstFocusable) {
			// shift+tab -> focus was on first foucusable element inside selected slide -> move to container
			event.preventDefault();
			Util.moveFocus(slideshow.element);
		} else if( !event.shiftKey && slideshow.lastFocusable && event.target == slideshow.lastFocusable) {
			event.preventDefault();
			
			if(slideshow.selectedSlide != 0) slideshow.controls[0].getElementsByTagName('button')[0].focus();
			else slideshow.controls[1].getElementsByTagName('button')[0].focus();
		}
	};

	function initAnimationEndEvents(slideshow) {
		slideshow.list.addEventListener('transitionend', function(){
			setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
				resetAnimationEnd(slideshow);
			}, 100);
		});
	};

	function resetAnimationEnd(slideshow) {
		if(slideshow.moveFocus) Util.moveFocus(slideshow.items[slideshow.selectedSlide]);
		slideshow.items[slideshow.selectedSlide].removeAttribute('aria-hidden');
		slideshow.animating = false;
		slideshow.moveFocus = false;
		slideshow.startAutoplay();
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = event.target.closest('.js-slideshow-pm__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow-pm__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function showNewItem(slideshow, index, bool, autoplay) {
		if(slideshow.animating && slideshow.supportAnimation) return;
		if(autoplay) {
			if(index < 0) index = slideshow.items.length - 1;
			else if(index >= slideshow.items.length) index = 0;
		}
		if(index < 0 || index >= slideshow.items.length) return;
		slideshow.animating = true;
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow-pm__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		Util.addClass(slideshow.items[index], 'slideshow-pm__item--selected');
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		setTranslate(slideshow);
		slideshow.pauseAutoplay();
		setFocusableElements(slideshow);
		if(!transitionSupported) resetAnimationEnd(slideshow);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function resetSlideshowResize(slideshow) {
		Util.removeClass(slideshow.list, 'slideshow-pm__list--has-transition');
		setTimeout(function(){
			setTranslateValue(slideshow);
			setTranslate(slideshow);
			Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');
		}, 30)
	};

	function setTranslateValue(slideshow) {
		var itemStyle = window.getComputedStyle(slideshow.items[slideshow.selectedSlide]);

		slideshow.itemWidth = parseFloat(itemStyle.getPropertyValue('width'));
		slideshow.itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right'));
		slideshow.containerWidth = parseFloat(window.getComputedStyle(slideshow.element).getPropertyValue('width'));
	};

	function setTranslate(slideshow) {
		var translate = parseInt(((slideshow.itemWidth + slideshow.itemMargin) * slideshow.selectedSlide * (-1)) + ((slideshow.containerWidth - slideshow.itemWidth)*0.5));
    slideshow.list.style.transform = 'translateX('+translate+'px)';
    slideshow.list.style.msTransform = 'translateX('+translate+'px)';
  };

  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
  	if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow-pm__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow-pm__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
		if(slideshow.controls.length > 0) {
			Util.toggleClass(slideshow.controls[0], 'slideshow-pm__control--active', newIndex != 0);
			Util.toggleClass(slideshow.controls[1], 'slideshow-pm__control--active', newIndex != (slideshow.items.length - 1));
  	}
  };

  function setFocusableElements(slideshow) {
  	//get all focusable elements inside the selected slide
		var allFocusable = slideshow.items[slideshow.selectedSlide].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(slideshow, allFocusable);
		getLastVisible(slideshow, allFocusable);
  };

  function getFirstVisible(slideshow, elements) {
  	slideshow.firstFocusable = false;
		//get first visible focusable element inside the selected slide
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(slideshow, elements) {
  	//get last visible focusable element inside the selected slide
  	slideshow.lastFocusable = false;
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function resetSlideshowFlexFallback(slideshow) {
		slideshow.list.style.width = ((slideshow.items.length+1)*(slideshow.itemMargin+slideshow.itemWidth))+'px';
		for(var i = 0; i < slideshow.items.length; i++) {slideshow.items[i].style.width = slideshow.itemWidth+'px';}
  };

	SlideshowPrew.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    prewNav: false,
    swipe: false
  };

  window.SlideshowPrew = SlideshowPrew;
	
	// initialize the slideshowsPrew objects
	var slideshowsPrew = document.getElementsByClassName('js-slideshow-pm'),
		flexSupported = Util.cssSupports('align-items', 'stretch'),
		transitionSupported = Util.cssSupports('transition');
	if( slideshowsPrew.length > 0 ) {
		for( var i = 0; i < slideshowsPrew.length; i++) {
			(function(i){
				var navigation = (slideshowsPrew[i].getAttribute('data-navigation') && slideshowsPrew[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshowsPrew[i].getAttribute('data-autoplay') && slideshowsPrew[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshowsPrew[i].getAttribute('data-autoplay-interval')) ? slideshowsPrew[i].getAttribute('data-autoplay-interval') : 5000,
					prewNav = (slideshowsPrew[i].getAttribute('data-pm-nav') && slideshowsPrew[i].getAttribute('data-pm-nav') == 'on' ) ? true : false, 
					swipe = (slideshowsPrew[i].getAttribute('data-swipe') && slideshowsPrew[i].getAttribute('data-swipe') == 'on') ? true : false;
				new SlideshowPrew({element: slideshowsPrew[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, prewNav: prewNav});
			})(i);
		}
	}

}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
	var Slideshow = function(opts) {
		this.options = slideshowAssignOptions(Slideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function() {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function slideshowAssignOptions(defaults, opts) {
		// initialize the object options
		var mergeOpts = {};
		mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
		mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
		mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
		mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
		mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
		return mergeOpts;
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			// check if navigation has already been included
			if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = 'slideshow__navigation js-slideshow__navigation';
				if(slideshow.items.length <= 1) {
					navClasses = navClasses + ' is-hidden';
				} 
				
				navigation.setAttribute('class', navClasses);
				for(var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}
			
			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			// hide controls if one item available
			if(slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'is-hidden');
				Util.addClass(slideshow.controls[1], 'is-hidden');
			}
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if(slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
			for(var i = 0; i < externalControls.length; i++) {
				(function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function(event){
			// check if slide is already selected
			if(event.detail) {
				if(event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for( var i = 0; i < slideshow.items.length; i++) {
			(function(i){
				slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
				slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
			if(Util.hasClass(item,'slideshow__item--selected')) {
				if(slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass); 
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if(slideshow.items.length <= 1) return;
		if(slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass); 
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if(index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if(slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if(slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function(event){
			var index = button.getAttribute('data-index');
			if(!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    swipe: false
  };

	window.Slideshow = Slideshow;
	
	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
				new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
			})(i);
		}
	}
}());
// File#: _2_sticky-sharebar
// Usage: codyhouse.co/license
(function() {
  var StickyShareBar = function(element) {
    this.element = element;
    this.contentTarget = document.getElementsByClassName('js-sticky-sharebar-target');
    this.showClass = 'sticky-sharebar--on-target';
    this.threshold = '50%'; // Share Bar will be revealed when .js-sticky-sharebar-target element reaches 50% of the viewport
    initShareBar(this);
  };

  function initShareBar(shareBar) {
    if(shareBar.contentTarget.length < 1) {
      Util.addClass(shareBar.element, shareBar.showClass);
      return;
    }
    if(intersectionObserverSupported) {
      initObserver(shareBar); // update anchor appearance on scroll
    } else {
      Util.addClass(shareBar.element, shareBar.showClass);
    }
  };

  function initObserver(shareBar) {
    var observer = new IntersectionObserver(
      function(entries, observer) { 
        Util.toggleClass(shareBar.element, shareBar.showClass, entries[0].isIntersecting);
      }, 
      {rootMargin: "0px 0px -"+shareBar.threshold+" 0px"}
    );
    observer.observe(shareBar.contentTarget[0]);
  };

  //initialize the StickyShareBar objects
  var stickyShareBar = document.getElementsByClassName('js-sticky-sharebar'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
	if( stickyShareBar.length > 0 ) {
		for( var i = 0; i < stickyShareBar.length; i++) {
			(function(i){ new StickyShareBar(stickyShareBar[i]); })(i);
    }
	}
}());
// File#: _3_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
    var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--main');
    }),
    subNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--sub');
    });
    
    var scrolling = false,
      previousTop = window.scrollY,
      currentTop = window.scrollY,
      scrollDelta = 10,
      scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
      headerHeight = 0; 

    var navIsFixed = false; // check if main navigation is fixed
    if(mainNav.length > 0 && Util.hasClass(mainNav[0], 'hide-nav--fixed')) navIsFixed = true;

    // store button that triggers navigation on mobile
    var triggerMobile = getTriggerMobileMenu();
    var prevElement = createPrevElement();
    var mainNavTop = 0;
    // list of classes the hide-nav has when it is expanded -> do not hide if it has those classes
    var navOpenClasses = hidingNav[0].getAttribute('data-nav-target-class'),
      navOpenArrayClasses = [];
    if(navOpenClasses) navOpenArrayClasses = navOpenClasses.split(' ');
    getMainNavTop();
    if(mainNavTop > 0) {
      scrollOffset = scrollOffset + mainNavTop;
    }
    
    // init navigation and listen to window scroll event
    getHeaderHeight();
    initSecondaryNav();
    initFixedNav();
    resetHideNav();
    window.addEventListener('scroll', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(resetHideNav);
    });

    window.addEventListener('resize', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(function(){
        if(headerHeight > 0) {
          getMainNavTop();
          getHeaderHeight();
          initSecondaryNav();
          initFixedNav();
        }
        // reset both navigation
        hideNavScrollUp();

        scrolling = false;
      });
    });

    function getHeaderHeight() {
      headerHeight = mainNav[0].offsetHeight;
    };

    function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
      if(subNav.length < 1 || mainNav.length < 1) return;
      subNav[0].style.top = (headerHeight - 1)+'px';
    };

    function initFixedNav() {
      if(!navIsFixed || mainNav.length < 1) return;
      mainNav[0].style.marginBottom = '-'+headerHeight+'px';
    };

    function resetHideNav() { // check if navs need to be hidden/revealed
      currentTop = window.scrollY;
      if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
        hideNavScrollDown();
      } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
        hideNavScrollUp();
      } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
        setTranslate(subNav[0], '0%');
      }
      // if primary nav is fixed -> toggle bg class
      if(navIsFixed) {
        var scrollTop = window.scrollY || window.pageYOffset;
        Util.toggleClass(mainNav[0], 'hide-nav--has-bg', (scrollTop > headerHeight + mainNavTop));
      }
      previousTop = currentTop;
      scrolling = false;
    };

    function hideNavScrollDown() {
      // if there's a secondary nav -> it has to reach the top before hiding nav
      if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
      // on mobile -> hide navigation only if dropdown is not open
      if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
      // check if main nav has one of the following classes
      if( mainNav.length > 0 && (!navOpenClasses || !checkNavExpanded())) {
        setTranslate(mainNav[0], '-100%'); 
        mainNav[0].addEventListener('transitionend', addOffCanvasClass);
      }
      if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
    };

    function hideNavScrollUp() {
      if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); Util.removeClass(mainNav[0], 'hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
      if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
    };

    function addOffCanvasClass() {
      mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
      Util.addClass(mainNav[0], 'hide-nav--off-canvas');
    };

    function setTranslate(element, val) {
      element.style.transform = 'translateY('+val+')';
    };

    function getTriggerMobileMenu() {
      // store trigger that toggle mobile navigation dropdown
      var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
      if(!triggerMobileClass) return false;
      if(triggerMobileClass.indexOf('#') == 0) { // get trigger by ID
        var trigger = document.getElementById(triggerMobileClass.replace('#', ''));
        if(trigger) return trigger;
      } else { // get trigger by class name
        var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
        if(trigger.length > 0) return trigger[0];
      }
      
      return false;
    };

    function createPrevElement() {
      // create element to be inserted right before the mainNav to get its top value
      if( mainNav.length < 1) return false;
      var newElement = document.createElement("div"); 
      newElement.setAttribute('aria-hidden', 'true');
      mainNav[0].parentElement.insertBefore(newElement, mainNav[0]);
      var prevElement =  mainNav[0].previousElementSibling;
      prevElement.style.opacity = '0';
      return prevElement;
    };

    function getMainNavTop() {
      if(!prevElement) return;
      mainNavTop = prevElement.getBoundingClientRect().top + window.scrollY;
    };

    function checkNavExpanded() {
      var navIsOpen = false;
      for(var i = 0; i < navOpenArrayClasses.length; i++){
        if(Util.hasClass(mainNav[0], navOpenArrayClasses[i].trim())) {
          navIsOpen = true;
          break;
        }
      }
      return navIsOpen;
    };
    
  } else {
    // if window requestAnimationFrame is not supported -> add bg class to fixed header
    var mainNav = document.getElementsByClassName('js-hide-nav--main');
    if(mainNav.length < 1) return;
    if(Util.hasClass(mainNav[0], 'hide-nav--fixed')) Util.addClass(mainNav[0], 'hide-nav--has-bg');
  }
}());
// File#: _3_lightbox
// Usage: codyhouse.co/license

(function() {
  var Lightbox = function(element) {
    this.element = element;
    this.slideshow = this.element.getElementsByClassName('js-lightbox__body')[0];
    this.slides = this.slideshow.getElementsByClassName('js-slideshow__item');
    this.thumbWrapper = this.element.getElementsByClassName('js-lightbox_thumb-list');
    lazyLoadLightbox(this);
    initSlideshow(this);
    initThumbPreview(this);
    initThumbEvents(this);
  }

  function lazyLoadLightbox(modal) {
    // add no-transition class to lightbox - used to select the first visible slide
    Util.addClass(modal.element, 'lightbox--no-transition');
    //load first slide media when modal is open
    modal.element.addEventListener('modalIsOpen', function(event){
      setSelectedItem(modal, event);
      var selectedSlide = modal.slideshow.getElementsByClassName('slideshow__item--selected');
      modal.selectedSlide = Util.getIndexInArray(modal.slides, selectedSlide[0]);
      if(selectedSlide.length > 0) {
        if(modal.slideshowObj) modal.slideshowObj.selectedSlide = modal.selectedSlide;
        lazyLoadSlide(modal);
        resetVideos(modal, false);
        resetIframes(modal, false);
        updateThumb(modal);
      }
      Util.removeClass(modal.element, 'lightbox--no-transition');
    });
    modal.element.addEventListener('modalIsClose', function(event){ // add no-transition class
      Util.addClass(modal.element, 'lightbox--no-transition');
    });
    // lazyload media of selected slide/prev slide/next slide
    modal.slideshow.addEventListener('newItemSelected', function(event){
      // 'newItemSelected' is emitted by the Slideshow object when a new slide is selected
      var prevSelected = modal.selectedSlide;
      modal.selectedSlide = event.detail;
      lazyLoadSlide(modal);
      resetVideos(modal, prevSelected); // pause video of previous visible slide and start new video (if present)
      resetIframes(modal, prevSelected);
      updateThumb(modal);
    });
  };

  function lazyLoadSlide(modal) {
    setSlideMedia(modal, modal.selectedSlide);
    setSlideMedia(modal, modal.selectedSlide + 1);
    setSlideMedia(modal, modal.selectedSlide - 1);
  };

  function setSlideMedia(modal, index) {
    if(index < 0) index = modal.slides.length - 1;
    if(index > modal.slides.length - 1) index = 0;
    setSlideImgs(modal, index);
    setSlidesVideos(modal, index, 'video');
    setSlidesVideos(modal, index, 'iframe');
  };

  function setSlideImgs(modal, index) {
    var imgs = modal.slides[index].querySelectorAll('img[data-src]');
    for(var i = 0; i < imgs.length; i++) {
      imgs[i].src = imgs[i].getAttribute('data-src');
    }
  };

  function setSlidesVideos(modal, index, type) {
    var videos = modal.slides[index].querySelectorAll(type+'[data-src]');
    for(var i = 0; i < videos.length; i++) {
      videos[0].src = videos[0].getAttribute('data-src');
      videos[0].removeAttribute('data-src');
    }
  };

  function initSlideshow(modal) { 
    if(modal.slides.length <= 1) {
      hideSlideshowElements(modal);
      return;
    } 
    var swipe = (modal.slideshow.getAttribute('data-swipe') && modal.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
    modal.slideshowObj = new Slideshow({element: modal.slideshow, navigation: false, autoplay : false, swipe : swipe});
  };

  function hideSlideshowElements(modal) { // hide slideshow controls if gallery is composed by one item only
    var slideshowNav = modal.element.getElementsByClassName('js-slideshow__control');
    if(slideshowNav.length > 0) {
      for(var i = 0; i < slideshowNav.length; i++) Util.addClass(slideshowNav[i], 'is-hidden');
    }
    var slideshowThumbs = modal.element.getElementsByClassName('js-lightbox_footer');
    if(slideshowThumbs.length > 0) Util.addClass(slideshowThumbs[0], 'is-hidden');
  };

  function resetVideos(modal, index) {
    if(index) {
      var actualVideo = modal.slides[index].getElementsByTagName('video');
      if(actualVideo.length > 0 ) actualVideo[0].pause();
    }
    var newVideo = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(newVideo.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newVideo[0]);
      newVideo[0].play();
    }
  };

  function resetIframes(modal, index) {
    if(index) {
      var actualIframe = modal.slides[index].getElementsByTagName('iframe');
      if(actualIframe.length > 0 ) {
        actualIframe[0].setAttribute('data-src', actualIframe[0].src);
        actualIframe[0].removeAttribute('src');
      }
    }
    var newIframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(newIframe.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newIframe[0]);
    }
  };

  function resizeLightbox(modal) { // executed when window has been resized
    if(!modal.selectedSlide) return; // modal not active
    var video = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(video.length > 0 ) setVideoWidth(modal, modal.selectedSlide, video[0]);
    var iframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(iframe.length > 0 ) setVideoWidth(modal, modal.selectedSlide, iframe[0]);
  };

  function setVideoWidth(modal, index, video) {
    var videoContainer = modal.slides[index].getElementsByClassName('js-lightbox__media-outer');
    if(videoContainer.length == 0 ) return;
    var videoWrapper = videoContainer[0].getElementsByClassName('js-lightbox__media-inner');
    var maxWidth = (video.offsetWidth/video.offsetHeight)*videoContainer[0].offsetHeight;
    if(maxWidth < modal.slides[index].offsetWidth) {
      videoWrapper[0].style.width = maxWidth+'px';
      videoWrapper[0].style.paddingBottom = videoContainer[0].offsetHeight+'px';
    } else {
      videoWrapper[0].removeAttribute('style')
    }
  };

  function initThumbPreview(modal) {
    if(modal.thumbWrapper.length < 1) return;
    var content = '';
    for(var i = 0; i < modal.slides.length; i++) {
      var activeClass = Util.hasClass(modal.slides[i], 'slideshow__item--selected') ? ' lightbox__thumb--active': '';
      content = content + '<li class="lightbox__thumb js-lightbox__thumb'+activeClass+'"><img src="'+modal.slides[i].querySelector('[data-thumb]').getAttribute('data-thumb')+'">'+'</li>';
    }
    modal.thumbWrapper[0].innerHTML = content;
  };

  function initThumbEvents(modal) {
    if(modal.thumbWrapper.length < 1) return;
    modal.thumbSlides = modal.thumbWrapper[0].getElementsByClassName('js-lightbox__thumb');
    modal.thumbWrapper[0].addEventListener('click', function(event){
      var selectedThumb = event.target.closest('.js-lightbox__thumb');
      if(!selectedThumb || Util.hasClass(selectedThumb, 'lightbox__thumb--active')) return;
      modal.slideshowObj.showItem(Util.getIndexInArray(modal.thumbSlides, selectedThumb));
    });
  };

  function updateThumb(modal) {
    if(modal.thumbWrapper.length < 1) return;
    // update selected thumb classes
    var selectedThumb = modal.thumbWrapper[0].getElementsByClassName('lightbox__thumb--active');
    if(selectedThumb.length > 0) Util.removeClass(selectedThumb[0], 'lightbox__thumb--active');
    Util.addClass(modal.thumbSlides[modal.selectedSlide], 'lightbox__thumb--active');
    // update thumb list position (if selected thumb is outside viewport)
    var offsetThumb = modal.thumbSlides[modal.selectedSlide].getBoundingClientRect(),
      offsetThumbList = modal.thumbWrapper[0].getBoundingClientRect();
    if(offsetThumb.left < offsetThumbList.left) {
      modal.thumbWrapper[0].scrollTo(modal.thumbSlides[modal.selectedSlide].offsetLeft - offsetThumbList.left, 0);
    } else if(offsetThumb.right > offsetThumbList.right) {
      modal.thumbWrapper[0].scrollTo( (offsetThumb.right - offsetThumbList.right) + modal.thumbWrapper[0].scrollLeft, 0);
    }
  };

  function keyboardNavigateLightbox(modal, direction) {
    if(!Util.hasClass(modal.element, 'modal--is-visible')) return;
    if(!document.activeElement.closest('.js-lightbox__body') && document.activeElement.closest('.js-modal')) return
    (direction == 'next') ? modal.slideshowObj.showNext() : modal.slideshowObj.showPrev();
  };

  function setSelectedItem(modal, event) {
    // if a specific slide was selected -> make sure to show that item first
    var selectedItemId = event.detail ? event.detail.getAttribute('data-lightbox-item') : false;
    if(!selectedItemId || !modal.slideshowObj) return;
    var selectedItem = document.getElementById(selectedItemId);
    if(!selectedItem) return;
    var lastSelected = modal.slideshow.getElementsByClassName('slideshow__item--selected');
    if(lastSelected.length > 0 ) Util.removeClass(lastSelected[0], 'slideshow__item--selected');
    Util.addClass(selectedItem, 'slideshow__item--selected');
  };

  window.Lightbox = Lightbox;

  // init Lightbox objects
  var lightBoxes = document.getElementsByClassName('js-lightbox');
  if( lightBoxes.length > 0 ) {
    var lightBoxArray = [];
    for( var i = 0; i < lightBoxes.length; i++) {
      (function(i){ lightBoxArray.push(new Lightbox(lightBoxes[i]));})(i);
      
      // resize video/iframe
      var resizingId = false;
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){resizeLightbox(lightBoxArray[i]);})(i);
        };
      };

      // Lightbox gallery navigation with keyboard
      window.addEventListener('keydown', function(event){
        if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
          updateLightbox('next');
        } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
          updateLightbox('prev');
        }
      });

      function updateLightbox(direction) {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){keyboardNavigateLightbox(lightBoxArray[i], direction);})(i);
        };
      };
    }
  }
}());
// File#: _3_mega-site-navigation
// Usage: codyhouse.co/license
(function() {
  var MegaNav = function(element) {
    this.element = element;
    this.search = this.element.getElementsByClassName('js-mega-nav__search');
    this.searchActiveController = false;
    this.menu = this.element.getElementsByClassName('js-mega-nav__nav');
    this.menuItems = this.menu[0].getElementsByClassName('js-mega-nav__item');
    this.menuActiveController = false;
    this.itemExpClass = 'mega-nav__item--expanded';
    this.classIconBtn = 'mega-nav__icon-btn--state-b';
    this.classSearchVisible = 'mega-nav__search--is-visible';
    this.classNavVisible = 'mega-nav__nav--is-visible';
    this.classMobileLayout = 'mega-nav--mobile';
    this.classDesktopLayout = 'mega-nav--desktop';
    this.layout = 'mobile';
    // store dropdown elements (if present)
    this.dropdown = this.element.getElementsByClassName('js-dropdown');
    // expanded class - added to header when subnav is open
    this.expandedClass = 'mega-nav--expanded';
    initMegaNav(this);
  };

  function initMegaNav(megaNav) {
    setMegaNavLayout(megaNav); // switch between mobile/desktop layout
    initSearch(megaNav); // controll search navigation
    initMenu(megaNav); // control main menu nav - mobile only
    initSubNav(megaNav); // toggle sub navigation visibility
    
    megaNav.element.addEventListener('update-menu-layout', function(event){
      setMegaNavLayout(megaNav); // window resize - update layout
    });
  };

  function setMegaNavLayout(megaNav) {
    var layout = getComputedStyle(megaNav.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    if(layout == megaNav.layout) return;
    megaNav.layout = layout;
    Util.toggleClass(megaNav.element, megaNav.classDesktopLayout, megaNav.layout == 'desktop');
    Util.toggleClass(megaNav.element, megaNav.classMobileLayout, megaNav.layout != 'desktop');
    if(megaNav.layout == 'desktop') {
      closeSubNav(megaNav, false);
      // if the mega navigation has dropdown elements -> make sure they are in the right position (viewport awareness)
      triggerDropdownPosition(megaNav);
    } 
    closeSearch(megaNav, false);
    resetMegaNavOffset(megaNav); // reset header offset top value
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function resetMegaNavOffset(megaNav) {
    document.documentElement.style.setProperty('--mega-nav-offset-y', megaNav.element.getBoundingClientRect().top+'px');
  };

  function closeNavigation(megaNav) { // triggered by Esc key press
    // close search
    closeSearch(megaNav);
    // close nav
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    //close subnav 
    closeSubNav(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeFocusNavigation(megaNav) { // triggered by Tab key pressed
    // close search when focus is lost
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible) && !document.activeElement.closest('.js-mega-nav__search')) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, true);
    }
    // close nav when focus is lost
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible) && !document.activeElement.closest('.js-mega-nav__nav')) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    // close subnav when focus is lost
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(!Util.hasClass(megaNav.menuItems[i], megaNav.itemExpClass)) continue;
      var parentItem = document.activeElement.closest('.js-mega-nav__item');
      if(parentItem && parentItem == megaNav.menuItems[i]) continue;
      closeSingleSubnav(megaNav, i);
    }
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSearch(megaNav, bool) {
    if(megaNav.search.length < 1) return;
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, bool);
    }
  } ;

  function initSearch(megaNav) {
    if(megaNav.search.length == 0) return;
    // toggle search
    megaNav.searchToggles = document.querySelectorAll('[aria-controls="'+megaNav.search[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.searchToggles.length; i++) {(function(i){
      megaNav.searchToggles[i].addEventListener('click', function(event){
        // toggle search
        toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchToggles[i], true);
        // close nav if it was open
        if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
          toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, false);
        }
        // close subnavigation if open
        closeSubNav(megaNav, false);
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function initMenu(megaNav) {
    if(megaNav.menu.length == 0) return;
    // toggle nav
    megaNav.menuToggles = document.querySelectorAll('[aria-controls="'+megaNav.menu[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.menuToggles.length; i++) {(function(i){
      megaNav.menuToggles[i].addEventListener('click', function(event){
        // toggle nav
        toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuToggles[i], true);
        // close search if it was open
        if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
          toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, false);
        }
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function toggleMenu(megaNav, element, controller, visibleClass, toggle, moveFocus) {
    var menuIsVisible = Util.hasClass(element, visibleClass);
    Util.toggleClass(element, visibleClass, !menuIsVisible);
    Util.toggleClass(toggle, megaNav.classIconBtn, !menuIsVisible);
    menuIsVisible ? toggle.removeAttribute('aria-expanded') : toggle.setAttribute('aria-expanded', 'true');
    if(menuIsVisible) {
      if(toggle && moveFocus) toggle.focus();
      megaNav[controller] = false;
    } else {
      if(toggle) megaNav[controller] = toggle;
			getFirstFocusable(element).focus(); // move focus to first focusable element
    }
  };

  function getFirstFocusable(element) {
    var focusableEle = element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
		  firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }
    return firstFocusable;
  };

  function initSubNav(megaNav) {
    // toggle subnavigation visibility
    megaNav.element.addEventListener('click', function(event){
      var triggerBtn = event.target.closest('.js-mega-nav__control');
      if(!triggerBtn) return;
      var mainItem = triggerBtn.closest('.js-mega-nav__item');
      if(!mainItem) return;
      var itemExpanded = Util.hasClass(mainItem, megaNav.itemExpClass);
      Util.toggleClass(mainItem, megaNav.itemExpClass, !itemExpanded);
      itemExpanded ? triggerBtn.removeAttribute('aria-expanded') : triggerBtn.setAttribute('aria-expanded', 'true');
      if(megaNav.layout == 'desktop' && !itemExpanded) closeSubNav(megaNav, mainItem);
      // close search if open
      closeSearch(megaNav, false);
      resetNavAppearance(megaNav); // reset nav expanded appearance
    });
  };

  function closeSubNav(megaNav, selectedItem) {
    // close subnav when a new sub nav element is open
    if(megaNav.menuItems.length == 0 ) return;
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(megaNav.menuItems[i] != selectedItem) closeSingleSubnav(megaNav, i);
    }
  };

  function closeSingleSubnav(megaNav, index) {
    Util.removeClass(megaNav.menuItems[index], megaNav.itemExpClass);
    var triggerBtn = megaNav.menuItems[index].getElementsByClassName('js-mega-nav__control');
    if(triggerBtn.length > 0) triggerBtn[0].removeAttribute('aria-expanded');
  };

  function triggerDropdownPosition(megaNav) {
    // emit custom event to properly place dropdown elements - viewport awarness
    if(megaNav.dropdown.length == 0) return;
    for(var i = 0; i < megaNav.dropdown.length; i++) {
      megaNav.dropdown[i].dispatchEvent(new CustomEvent('placeDropdown'));
    }
  };

  function resetNavAppearance(megaNav) {
    ( (megaNav.element.getElementsByClassName(megaNav.itemExpClass).length > 0 && megaNav.layout == 'desktop') || megaNav.element.getElementsByClassName(megaNav.classSearchVisible).length > 0 ||(megaNav.element.getElementsByClassName(megaNav.classNavVisible).length > 0 && megaNav.layout == 'mobile'))
      ? Util.addClass(megaNav.element, megaNav.expandedClass)
      : Util.removeClass(megaNav.element, megaNav.expandedClass);
  };

  //initialize the MegaNav objects
  var megaNav = document.getElementsByClassName('js-mega-nav');
  if(megaNav.length > 0) {
    var megaNavArray = [];
    for(var i = 0; i < megaNav.length; i++) {
      (function(i){megaNavArray.push(new MegaNav(megaNav[i]));})(i);
    }

    // key events
    window.addEventListener('keyup', function(event){
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) { // listen for esc key events
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeNavigation(megaNavArray[i]);
        })(i);}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close search or nav if it looses focus
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeFocusNavigation(megaNavArray[i]);
        })(i);}
			}
    });

    window.addEventListener('click', function(event){
      if(!event.target.closest('.js-mega-nav')) closeNavigation(megaNavArray[0]);
    });
    
    // resize - update menu layout
    var resizingId = false,
      customEvent = new CustomEvent('update-menu-layout');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 200);
    });

    function doneResizing() {
      for( var i = 0; i < megaNavArray.length; i++) {
        (function(i){megaNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  }
}());
// File#: _3_thumbnail-slideshow
// Usage: codyhouse.co/license
(function() {
	var ThumbSlideshow = function(element) {
		this.element = element;
		this.slideshow = this.element.getElementsByClassName('slideshow')[0];
		this.slideshowItems = this.slideshow.getElementsByClassName('js-slideshow__item');
		this.carousel = this.element.getElementsByClassName('thumbslide__nav-wrapper')[0];
		this.carouselList = this.carousel.getElementsByClassName('thumbslide__nav-list')[0];
		this.carouselListWrapper = this.carousel.getElementsByClassName('thumbslide__nav')[0];
		this.carouselControls = this.element.getElementsByClassName('js-thumbslide__tb-control');
		// custom obj
		this.slideshowObj = false;
		// thumb properties
		this.thumbItems = false;
		this.thumbOriginalWidth = false;
		this.thumbOriginalHeight = false;
		this.thumbVisibItemsNb = false;
		this.itemsWidth = false;
		this.itemsHeight = false;
		this.itemsMargin = false;
		this.thumbTranslateContainer = false;
		this.thumbTranslateVal = 0;
		// vertical variation
		this.thumbVertical = Util.hasClass(this.element, 'thumbslide--vertical');
		// recursive update 
		this.recursiveDirection = false;
		// drag events 
		this.thumbDragging = false;
		this.dragStart = false;
		// resize
		this.resize = false;
		// image load -> store info about thumb image being loaded
		this.loaded = false;
		initThumbs(this);
		initSlideshow(this);
		checkImageLoad(this);
	};

	function initThumbs(thumbSlider) { // create thumb items
		var carouselItems = '';
		for(var i = 0; i < thumbSlider.slideshowItems.length; i++) {
			var url = thumbSlider.slideshowItems[i].getAttribute('data-thumb'),
				alt = thumbSlider.slideshowItems[i].getAttribute('data-alt');
			if(!alt) alt = 'Image Preview';
			carouselItems = carouselItems + '<li class="thumbslide__nav-item"><img src="'+url+'" alt="'+alt+'">'+'</li>';
		}
		thumbSlider.carouselList.innerHTML = carouselItems;
		if(!thumbSlider.thumbVertical) initThumbsLayout(thumbSlider);
		else loadThumbsVerticalLayout(thumbSlider);
	};

	function initThumbsLayout(thumbSlider) {  // set thumbs visible numbers + width
		// evaluate size of single elements + number of visible elements
		thumbSlider.thumbItems = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item');
		
		var itemStyle = window.getComputedStyle(thumbSlider.thumbItems[0]),
      containerStyle = window.getComputedStyle(thumbSlider.carouselListWrapper),
			itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
			itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
      containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
      containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

    if( !thumbSlider.thumbOriginalWidth) { // on resize -> use initial width of items to recalculate 
      thumbSlider.thumbOriginalWidth = itemWidth;
    } else {
      itemWidth = thumbSlider.thumbOriginalWidth;
    }
    // get proper width of elements
    thumbSlider.thumbVisibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
    thumbSlider.itemsWidth = ((containerWidth - 2*containerPadding + itemMargin)/thumbSlider.thumbVisibItemsNb) - itemMargin;
    thumbSlider.thumbTranslateContainer = (((thumbSlider.itemsWidth+itemMargin)* thumbSlider.thumbVisibItemsNb));
    thumbSlider.itemsMargin = itemMargin;
    // flexbox fallback
    if(!flexSupported) thumbSlider.carouselList.style.width = (thumbSlider.itemsWidth + itemMargin)*thumbSlider.slideshowItems.length+'px';
		setThumbsWidth(thumbSlider);
	};

	function checkImageLoad(thumbSlider) {
		if(!thumbSlider.thumbVertical) { // no need to wait for image load, we already have their width
			updateVisibleThumb(thumbSlider, 0);
			updateThumbControls(thumbSlider);
			initTbSlideshowEvents(thumbSlider);
		} else { // wait for image to be loaded -> need to know the right height
			var image = new Image();
			image.onload = function () {thumbSlider.loaded = true;}
			image.onerror = function () {thumbSlider.loaded = true;}
			image.src = thumbSlider.slideshowItems[0].getAttribute('data-thumb');
		}
	};

	function loadThumbsVerticalLayout(thumbSlider) {
		// this is the vertical layout -> we need to make sure the thumb are loaded before checking the value of their height
		if(thumbSlider.loaded) {
			initThumbsVerticalLayout(thumbSlider);
			updateVisibleThumb(thumbSlider, 0);
			updateThumbControls(thumbSlider);
			initTbSlideshowEvents(thumbSlider);
		} else { // wait for thumbs to be loaded
			setTimeout(function(){
				loadThumbsVerticalLayout(thumbSlider);
			}, 100);
		}
	}

	function initThumbsVerticalLayout(thumbSlider) {
		// evaluate size of single elements + number of visible elements
		thumbSlider.thumbItems = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item');
		
		var itemStyle = window.getComputedStyle(thumbSlider.thumbItems[0]),
      containerStyle = window.getComputedStyle(thumbSlider.carouselListWrapper),
			itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
			itemHeight = parseFloat(itemStyle.getPropertyValue('height')),
			itemRatio = itemWidth/itemHeight,
			itemMargin = parseFloat(itemStyle.getPropertyValue('margin-bottom')),
      containerPadding = parseFloat(containerStyle.getPropertyValue('padding-top')),
      containerWidth = parseFloat(containerStyle.getPropertyValue('width')),
      containerHeight = parseFloat(containerStyle.getPropertyValue('height'));

    if(!flexSupported) containerHeight = parseFloat(window.getComputedStyle(thumbSlider.element).getPropertyValue('height'));
    
    if( !thumbSlider.thumbOriginalHeight ) { // on resize -> use initial width of items to recalculate 
      thumbSlider.thumbOriginalHeight = itemHeight;
      thumbSlider.thumbOriginalWidth = itemWidth;
    } else {
    	resetOriginalSize(thumbSlider);
      itemHeight = thumbSlider.thumbOriginalHeight;
    }
    // get proper height of elements
    thumbSlider.thumbVisibItemsNb = parseInt((containerHeight - 2*containerPadding + itemMargin)/(itemHeight+itemMargin));
    thumbSlider.itemsHeight = ((containerHeight - 2*containerPadding + itemMargin)/thumbSlider.thumbVisibItemsNb) - itemMargin;
    thumbSlider.itemsWidth = thumbSlider.itemsHeight*itemRatio,
    thumbSlider.thumbTranslateContainer = (((thumbSlider.itemsHeight+itemMargin)* thumbSlider.thumbVisibItemsNb));
    thumbSlider.itemsMargin = itemMargin;
    // flexbox fallback
    if(!flexSupported) {
    	thumbSlider.carousel.style.height = (thumbSlider.itemsHeight + itemMargin)*thumbSlider.slideshowItems.length+'px';
			thumbSlider.carouselListWrapper.style.height = containerHeight+'px';
    }
		setThumbsWidth(thumbSlider);
	};

	function setThumbsWidth(thumbSlider) { // set thumbs width
    for(var i = 0; i < thumbSlider.thumbItems.length; i++) {
      thumbSlider.thumbItems[i].style.width = thumbSlider.itemsWidth+"px";
      if(thumbSlider.thumbVertical) thumbSlider.thumbItems[i].style.height = thumbSlider.itemsHeight+"px";
    }

    if(thumbSlider.thumbVertical) {
    	var padding = parseFloat(window.getComputedStyle(thumbSlider.carouselListWrapper).getPropertyValue('padding-left'));
    	thumbSlider.carousel.style.width = (thumbSlider.itemsWidth + 2*padding)+"px";
    	if(!flexSupported) thumbSlider.slideshow.style.width = (parseFloat(window.getComputedStyle(thumbSlider.element).getPropertyValue('width')) - (thumbSlider.itemsWidth + 2*padding) - 10) + 'px';
    }
  };

	function initSlideshow(thumbSlider) { // for the main slideshow, we are using the Slideshow component -> we only need to initialize the object
		var autoplay = (thumbSlider.slideshow.getAttribute('data-autoplay') && thumbSlider.slideshow.getAttribute('data-autoplay') == 'on') ? true : false,
			autoplayInterval = (thumbSlider.slideshow.getAttribute('data-autoplay-interval')) ? thumbSlider.slideshow.getAttribute('data-autoplay-interval') : 5000,
			swipe = (thumbSlider.slideshow.getAttribute('data-swipe') && thumbSlider.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
		thumbSlider.slideshowObj = new Slideshow({element: thumbSlider.slideshow, navigation: false, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
	};

	function initTbSlideshowEvents(thumbSlider) {
    // listen for new slide selection -> 'newItemSelected' custom event is emitted each time a new slide is selected
    thumbSlider.slideshowObj.element.addEventListener('newItemSelected', function(event){
			updateVisibleThumb(thumbSlider, event.detail);
    });

		// click on a thumbnail -> update slide in slideshow
		thumbSlider.carouselList.addEventListener('click', function(event){
			if(thumbSlider.thumbDragging) return;
			var selectedOption = event.target.closest('.thumbslide__nav-item');
			if(!selectedOption || Util.hasClass(selectedOption, 'thumbslide__nav-item--active')) return;
			thumbSlider.slideshowObj.showItem(Util.getIndexInArray(thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item'), selectedOption));
		});

		// reset thumbnails on resize
    window.addEventListener('resize', function(event){
    	if(thumbSlider.resize) return;
    	thumbSlider.resize = true;
      window.requestAnimationFrame(resetThumbsResize.bind(thumbSlider));
    });

    // enable drag on thumbnails
		new SwipeContent(thumbSlider.carouselList);
		thumbSlider.carouselList.addEventListener('dragStart', function(event){
			var coordinate =  getDragCoordinate(thumbSlider, event);
			thumbSlider.dragStart = coordinate;
			thumbDragEnd(thumbSlider);
		});
		thumbSlider.carouselList.addEventListener('dragging', function(event){
			if(!thumbSlider.dragStart) return;
			var coordinate =  getDragCoordinate(thumbSlider, event);
			if(thumbSlider.slideshowObj.animating || Math.abs(coordinate - thumbSlider.dragStart) < 20) return;
			Util.addClass(thumbSlider.element, 'thumbslide__nav-list--dragging');
			thumbSlider.thumbDragging = true;
			Util.addClass(thumbSlider.carouselList, 'thumbslide__nav-list--no-transition');
			var translate = thumbSlider.thumbVertical ? 'translateY' : 'translateX';
			setTranslate(thumbSlider, translate+'('+(thumbSlider.thumbTranslateVal + coordinate - thumbSlider.dragStart)+'px)');
		});
	};

	function thumbDragEnd(thumbSlider) {
		thumbSlider.carouselList.addEventListener('dragEnd', function cb(event){
			var coordinate = getDragCoordinate(thumbSlider, event);
			thumbSlider.thumbTranslateVal = resetTranslateToRound(thumbSlider, thumbSlider.thumbTranslateVal + coordinate - thumbSlider.dragStart);
			thumbShowNewItems(thumbSlider, false);
			thumbSlider.dragStart = false;
			Util.removeClass(thumbSlider.carouselList, 'thumbslide__nav-list--no-transition');
			thumbSlider.carouselList.removeEventListener('dragEnd', cb);
			setTimeout(function(){
				thumbSlider.thumbDragging = false;
			}, 50);
			Util.removeClass(thumbSlider.element, 'thumbslide__nav-list--dragging');
		});
	};

	function getDragCoordinate(thumbSlider, event) { // return the drag value based on direction of thumbs navugation
		return thumbSlider.thumbVertical ? event.detail.y : event.detail.x;
	}

	function resetTranslateToRound(thumbSlider, value) { // at the ed of dragging -> set translate of coontainer to right value
		var dimension = getItemDimension(thumbSlider);
		return Math.round(value/(dimension+thumbSlider.itemsMargin))*(dimension+thumbSlider.itemsMargin);
	};

	function resetThumbsResize() { // reset thumbs width on resize
		var thumbSlider = this;
		if(!thumbSlider.thumbVertical) initThumbsLayout(thumbSlider);
		else initThumbsVerticalLayout(thumbSlider);
    setThumbsWidth(thumbSlider);
    var dimension = getItemDimension(thumbSlider);
    // reset the translate value of the thumbs container as well
    if( (-1)*thumbSlider.thumbTranslateVal % (dimension + thumbSlider.itemsMargin) > 0 ) {
			thumbSlider.thumbTranslateVal = -1 * parseInt(((-1)*thumbSlider.thumbTranslateVal)/(dimension + thumbSlider.itemsMargin)) * (dimension + thumbSlider.itemsMargin); 
    	thumbShowNewItems(thumbSlider, false);
    }
    thumbSlider.resize = false;
	};

	function thumbShowNewItems(thumbSlider, direction) { // when a new slide is selected -> update position of thumbs navigation
		var dimension = getItemDimension(thumbSlider);
		if(direction == 'next') thumbSlider.thumbTranslateVal = thumbSlider.thumbTranslateVal - thumbSlider.thumbTranslateContainer;
		else if(direction == 'prev') thumbSlider.thumbTranslateVal = thumbSlider.thumbTranslateVal + thumbSlider.thumbTranslateContainer;
		// make sure translate value is correct
		if(-1*thumbSlider.thumbTranslateVal >= (thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin)) thumbSlider.thumbTranslateVal = -1*((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin));
		if(thumbSlider.thumbTranslateVal > 0) thumbSlider.thumbTranslateVal = 0;

		var translate = thumbSlider.thumbVertical ? 'translateY' : 'translateX';
		setTranslate(thumbSlider, translate+'('+thumbSlider.thumbTranslateVal+'px)');
		updateThumbControls(thumbSlider);
	};

	function updateVisibleThumb(thumbSlider, index) { // update selected thumb
		// update selected thumbnails
		var selectedThumb = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item--active');
		if(selectedThumb.length > 0) Util.removeClass(selectedThumb[0], 'thumbslide__nav-item--active');
		Util.addClass(thumbSlider.thumbItems[index], 'thumbslide__nav-item--active');
		// update carousel translate value if new thumb is not visible
		recursiveUpdateThumb(thumbSlider, index);
	};

	function recursiveUpdateThumb(thumbSlider, index) { // recursive function used to update the position of thumbs navigation (eg when going from last slide to first one)
		var dimension = getItemDimension(thumbSlider);
		if( ((index + 1 - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal >= 0) || ( index*(dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal <= 0 && thumbSlider.thumbTranslateVal < 0) ) {
			var increment = ((index + 1 - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal >= 0) ? 1 : -1;
			if( !thumbSlider.recursiveDirection || thumbSlider.recursiveDirection == increment) {
				thumbSlider.thumbTranslateVal = -1 * increment * (dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal;
				thumbSlider.recursiveDirection = increment;
				recursiveUpdateThumb(thumbSlider, index);
			} else {
				thumbSlider.recursiveDirection = false;
				thumbShowNewItems(thumbSlider, false);
			}
		} else {
			thumbSlider.recursiveDirection = false;
			thumbShowNewItems(thumbSlider, false);
		}
	}

	function updateThumbControls(thumbSlider) { // reset thumb controls style
		var dimension = getItemDimension(thumbSlider);
		Util.toggleClass(thumbSlider.carouselListWrapper, 'thumbslide__nav--scroll-start', (thumbSlider.thumbTranslateVal != 0));
		Util.toggleClass(thumbSlider.carouselListWrapper, 'thumbslide__nav--scroll-end', (thumbSlider.thumbTranslateVal != -1*((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin))) && (thumbSlider.thumbItems.length > thumbSlider.thumbVisibItemsNb));
		if(thumbSlider.carouselControls.length == 0) return;
		Util.toggleClass(thumbSlider.carouselControls[0], 'thumbslide__tb-control--disabled', (thumbSlider.thumbTranslateVal == 0));
		Util.toggleClass(thumbSlider.carouselControls[1], 'thumbslide__tb-control--disabled', (thumbSlider.thumbTranslateVal == -1*((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb)*(dimension + thumbSlider.itemsMargin))));
	};

	function getItemDimension(thumbSlider) {
		return thumbSlider.thumbVertical ? thumbSlider.itemsHeight : thumbSlider.itemsWidth;
	}

	function setTranslate(thumbSlider, translate) {
    thumbSlider.carouselList.style.transform = translate;
    thumbSlider.carouselList.style.msTransform = translate;
  };

  function resetOriginalSize(thumbSlider) {
		if( !Util.cssSupports('color', 'var(--var-name)') ) return;
		var thumbWidth = parseInt(getComputedStyle(thumbSlider.element).getPropertyValue('--thumbslide-thumbnail-auto-size'));
		if(thumbWidth == thumbSlider.thumbOriginalWidth) return;
		thumbSlider.thumbOriginalHeight = parseFloat((thumbSlider.thumbOriginalHeight)*(thumbWidth/thumbSlider.thumbOriginalWidth));
  	thumbSlider.thumbOriginalWidth = thumbWidth;
  };
	
	//initialize the ThumbSlideshow objects
	var thumbSlideshows = document.getElementsByClassName('js-thumbslide'),
		flexSupported = Util.cssSupports('align-items', 'stretch');
	if( thumbSlideshows.length > 0 ) {
		for( var i = 0; i < thumbSlideshows.length; i++) {
			(function(i){
				new ThumbSlideshow(thumbSlideshows[i]);
			})(i);
		}
	}
}());
