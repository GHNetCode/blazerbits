  // ============================================================
  // COMPLETE FIX - SHOW ARROW IMMEDIATELY WITH DELAYED ACTION
  // FOR ALL TILES (Real Links & Modal Triggers)
  // ============================================================
  
  document.addEventListener('DOMContentLoaded', () => {
    // ── Fade-in animation for tiles on scroll ──
    const tiles = document.querySelectorAll('.project-tile');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    tiles.forEach((tile, i) => {
      tile.style.opacity = '0';
      tile.style.transform = 'translateY(20px)';
      tile.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      observer.observe(tile);
    });

    // ============================================================
    // SHOW ARROW IMMEDIATELY WITH DELAYED ACTION
    // FOR ALL TILES (Real Links & Modal Triggers)
    // ============================================================
    
    // Check if touch device
    const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Shared timing constants
    const ARROW_DELAY = 10;   // Show arrow almost instantly
    const NAV_DELAY = 230;    // Wait 230ms before action (navigation or modal)
    
    // Flag to track if navigation has been triggered
    let navigationTriggered = false;
    
    // Function to handle delayed action (navigation or modal)
    function performDelayedAction(tile, actionType) {
      if (actionType === 'real-link') {
        // Real link - navigate to the href
        const href = tile.getAttribute('href');
        const target = tile.getAttribute('target');
        if (href && href !== '#') {
          if (target === '_blank') {
            window.open(href, '_blank');
          } else {
            window.location.href = href;
          }
        }
      } else if (actionType === 'modal') {
        // Modal trigger - find and open the modal
        const modal = document.getElementById('loginModal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    }
    
    // Store timers and state globally
    let pressTimers = new Map();
    let actionTimers = new Map();
    let touchActive = new Map();
    let touchStartPositions = new Map(); // Store touch start position to detect scroll
    
    document.querySelectorAll('.project-tile').forEach((tile) => {
      // Determine tile type
      const href = tile.getAttribute('href');
      const isModal = tile.hasAttribute('data-modal-trigger');
      const isRealLink = href && href !== '#';
      const actionType = isRealLink ? 'real-link' : (isModal ? 'modal' : 'none');
      
      if (actionType === 'none') return;
      
      // --- Touch events ---
      tile.addEventListener('touchstart', function(e) {
        // Reset navigation flag
        navigationTriggered = false;
        
        // Store touch start position to detect scrolling
        const touch = e.touches[0];
        touchStartPositions.set(this, {
          x: touch.clientX,
          y: touch.clientY
        });
        
        // Clear any existing timers
        if (pressTimers.has(this)) {
          clearTimeout(pressTimers.get(this));
          pressTimers.delete(this);
        }
        if (actionTimers.has(this)) {
          clearTimeout(actionTimers.get(this));
          actionTimers.delete(this);
        }
        
        // Mark touch as active
        touchActive.set(this, true);
        
        // Show immediate visual feedback (highlight)
        this.classList.add('touch-active');
        
        // Show arrow after 10ms (almost instantly)
        const arrowTimer = setTimeout(() => {
          if (touchActive.get(this)) {
            this.classList.add('touch-arrow');
          }
          pressTimers.delete(this);
        }, ARROW_DELAY);
        
        pressTimers.set(this, arrowTimer);
        
      }, { passive: true });
      
      // Touch move - detect if user is scrolling
      tile.addEventListener('touchmove', function(e) {
        // Check if touch moved significantly (scrolling)
        const startPos = touchStartPositions.get(this);
        if (startPos) {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - startPos.x);
          const deltaY = Math.abs(touch.clientY - startPos.y);
          
          // If moved more than 10px in any direction, it's a scroll, not a tap
          if (deltaX > 10 || deltaY > 10) {
            // Cancel any pending actions
            touchActive.set(this, false);
            
            if (pressTimers.has(this)) {
              clearTimeout(pressTimers.get(this));
              pressTimers.delete(this);
            }
            if (actionTimers.has(this)) {
              clearTimeout(actionTimers.get(this));
              actionTimers.delete(this);
            }
            
            this.classList.remove('touch-active', 'touch-arrow');
          }
        }
      }, { passive: true });
      
      // Touch end - handle delayed action
      tile.addEventListener('touchend', function(e) {
        // Check if this was a scroll (touch moved significantly)
        const startPos = touchStartPositions.get(this);
        let isScroll = false;
        
        if (startPos) {
          // Use the last touch position or the current one
          const touch = e.changedTouches[0];
          const deltaX = Math.abs(touch.clientX - startPos.x);
          const deltaY = Math.abs(touch.clientY - startPos.y);
          
          // If moved more than 10px, it was a scroll
          if (deltaX > 10 || deltaY > 10) {
            isScroll = true;
          }
        }
        
        // Clear touch start position
        touchStartPositions.delete(this);
        
        // Mark touch as inactive
        touchActive.set(this, false);
        
        // Clear arrow timer if still pending
        if (pressTimers.has(this)) {
          clearTimeout(pressTimers.get(this));
          pressTimers.delete(this);
        }
        
        // Remove touch-active class
        this.classList.remove('touch-active');
        
        // If this was a scroll, don't trigger navigation
        if (isScroll) {
          this.classList.remove('touch-arrow');
          return;
        }
        
        // Only prevent default if the event is cancelable
        if (e.cancelable) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Start delayed action
        const actionTimer = setTimeout(() => {
          if (!navigationTriggered) {
            navigationTriggered = true;
            performDelayedAction(this, actionType);
          }
          actionTimers.delete(this);
        }, NAV_DELAY);
        
        actionTimers.set(this, actionTimer);
        
        // Remove arrow after delay (after action has started)
        setTimeout(() => {
          this.classList.remove('touch-arrow');
        }, 100);
        
      }, { passive: false });
      
      // Touch cancel - cancel everything
      tile.addEventListener('touchcancel', function() {
        touchActive.set(this, false);
        touchStartPositions.delete(this);
        
        if (pressTimers.has(this)) {
          clearTimeout(pressTimers.get(this));
          pressTimers.delete(this);
        }
        if (actionTimers.has(this)) {
          clearTimeout(actionTimers.get(this));
          actionTimers.delete(this);
        }
        
        this.classList.remove('touch-active', 'touch-arrow');
      }, { passive: true });
      
      // --- Mouse events (for desktop and trackpad) ---
      tile.addEventListener('mousedown', function(e) {
        // Only handle if not a touch device or if it's a real mouse click
        if (!isTouchDevice || e.pointerType === 'mouse') {
          navigationTriggered = false;
          
          // Show visual feedback
          this.classList.add('touch-active');
          
          // Show arrow after 10ms
          const arrowTimer = setTimeout(() => {
            this.classList.add('touch-arrow');
            pressTimers.delete(this);
          }, ARROW_DELAY);
          
          pressTimers.set(this, arrowTimer);
        }
      });
      
      tile.addEventListener('mouseup', function(e) {
        // Only handle if not a touch device or if it's a real mouse click
        if (!isTouchDevice || e.pointerType === 'mouse') {
          if (pressTimers.has(this)) {
            clearTimeout(pressTimers.get(this));
            pressTimers.delete(this);
          }
          
          this.classList.remove('touch-active');
          
          // For real links, navigate after delay
          if (actionType === 'real-link') {
            if (e.cancelable) {
              e.preventDefault();
              e.stopPropagation();
            }
            
            const actionTimer = setTimeout(() => {
              if (!navigationTriggered) {
                navigationTriggered = true;
                performDelayedAction(this, actionType);
              }
              actionTimers.delete(this);
            }, NAV_DELAY);
            actionTimers.set(this, actionTimer);
          }
          
          setTimeout(() => {
            this.classList.remove('touch-arrow');
          }, 100);
        }
      });
      
      tile.addEventListener('mouseleave', function() {
        if (pressTimers.has(this)) {
          clearTimeout(pressTimers.get(this));
          pressTimers.delete(this);
        }
        if (actionTimers.has(this)) {
          clearTimeout(actionTimers.get(this));
          actionTimers.delete(this);
        }
        this.classList.remove('touch-active', 'touch-arrow');
      });
      
      // --- Click event (fallback) - PREVENTS DOUBLE NAVIGATION ---
      tile.addEventListener('click', function(e) {
        // Always prevent default for any tile with an action
        if (e.cancelable) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // If navigation already triggered (by touch or mouse), do nothing
        if (navigationTriggered) {
          return;
        }
        
        // For non-touch devices or fallback, handle with delay
        this.classList.add('touch-active', 'touch-arrow');
        
        // Clear any existing timers
        if (actionTimers.has(this)) {
          clearTimeout(actionTimers.get(this));
          actionTimers.delete(this);
        }
        
        // Perform action after delay
        const actionTimer = setTimeout(() => {
          if (!navigationTriggered) {
            navigationTriggered = true;
            performDelayedAction(this, actionType);
          }
          actionTimers.delete(this);
        }, NAV_DELAY);
        
        actionTimers.set(this, actionTimer);
        
        // Remove arrow after delay
        setTimeout(() => {
          this.classList.remove('touch-arrow', 'touch-active');
        }, NAV_DELAY + 100);
      });
    });

    // ── Aggressive touch prevention for ALL project tiles ──
    document.querySelectorAll('.project-tile').forEach((tile) => {
      tile.addEventListener('touchstart', function() {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
      }, { passive: true });

      tile.addEventListener('touchend', function() {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
      }, { passive: true });

      tile.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });

      tile.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
      });
    });

    // ── Global selection prevention ──
    document.addEventListener('selectstart', function(e) {
      if (e.target.closest('.project-tile')) {
        e.preventDefault();
      }
    });

    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('.project-tile')) {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
      }
    }, { passive: true });

    // ============================================================
    // AGGRESSIVE HOVER STATE RESET
    // ============================================================
    
    function forceResetAllTiles() {
      const tiles = document.querySelectorAll('.project-tile');
      
      tiles.forEach((tile) => {
        // Remove touch classes
        tile.classList.remove('touch-active', 'touch-arrow');
        
        // Remove all inline styles
        tile.style.cssText = '';
        
        // Force remove hover state
        tile.classList.add('force-reset');
        void tile.offsetHeight;
        
        setTimeout(() => {
          tile.classList.remove('force-reset');
        }, 50);
        
        // Dispatch events
        const events = ['mouseleave', 'mouseout', 'blur'];
        events.forEach(eventType => {
          const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
          });
          tile.dispatchEvent(event);
        });
        
        if (tile.tagName !== 'A') {
          tile.blur();
        }
        
        tile.style.transform = 'translateY(0)';
        tile.style.boxShadow = 'none';
        tile.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        
        if (tile.tagName === 'A') {
          tile.blur();
        }
      });
      
      void document.body.offsetHeight;
    }

    function checkAndReset() {
      const returning = sessionStorage.getItem('returningFromExternal');
      if (returning === 'true') {
        sessionStorage.removeItem('returningFromExternal');
        setTimeout(() => {
          forceResetAllTiles();
          setTimeout(() => {
            forceResetAllTiles();
          }, 100);
        }, 50);
      } else {
        setTimeout(forceResetAllTiles, 150);
      }
    }

    checkAndReset();

    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        setTimeout(() => {
          forceResetAllTiles();
        }, 10);
      }
    });

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        setTimeout(() => {
          forceResetAllTiles();
        }, 50);
      }
    });

    window.addEventListener('focus', function() {
      setTimeout(() => {
        forceResetAllTiles();
      }, 50);
    });

    // ── Add CSS class for force reset ──
    const style = document.createElement('style');
    style.textContent = `
      /* Force reset styles */
      .project-tile.force-reset {
        transform: translateY(0) !important;
        box-shadow: none !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
        transition: none !important;
      }
      .project-tile.force-reset::after {
        opacity: 0 !important;
        transform: translateX(-8px) !important;
        transition: none !important;
      }
      .project-tile.force-reset:hover {
        transform: translateY(0) !important;
        box-shadow: none !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      .project-tile.force-reset:hover::after {
        opacity: 0 !important;
        transform: translateX(-8px) !important;
      }

      /* Touch device styles - visual feedback on touch */
      .project-tile.touch-active {
        transform: translateY(-4px) !important;
        box-shadow: 0 10px 30px rgba(2, 89, 143, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
      }

      /* Arrow appears after 10ms delay */
      .project-tile.touch-arrow::after {
        opacity: 0.6 !important;
        transform: translateX(0) !important;
        transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out !important;
      }

      /* Desktop hover styles - unchanged */
      @media (hover: hover) {
        .project-tile:hover::after {
          opacity: 0.6;
          transform: translateX(0);
        }
      }

      /* Light theme overrides for touch states */
      body.light-theme .project-tile.touch-active {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        border-color: rgba(0, 0, 0, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
  });
  