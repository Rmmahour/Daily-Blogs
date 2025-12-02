/**
 * Blog Theme Scripts
 * JavaScript/jQuery functionality for the WordPress theme
 */

;(() => {
  // ========================================
  // DOM Ready
  // ========================================
  document.addEventListener("DOMContentLoaded", () => {
    initDarkMode()
    initNewsletterForm()
    initSmoothScroll()
    initImageLazyLoad()
  })

  // ========================================
  // Dark Mode Toggle
  // ========================================
  function initDarkMode() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark")
    }

    // Listen for system preference changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    })
  }

  // Toggle dark mode manually (can be called from a button)
  window.toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }

  // ========================================
  // Newsletter Form Handling
  // ========================================
  function initNewsletterForm() {
    const form = document.getElementById("newsletter-form")
    const messageEl = document.getElementById("newsletter-message")

    if (!form || !messageEl) return

    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const submitButton = form.querySelector('button[type="submit"]')
      const emailInput = form.querySelector('input[name="email"]')
      const email = emailInput.value.trim()

      // Validate email
      if (!isValidEmail(email)) {
        showMessage(messageEl, "Please enter a valid email address.", "error")
        return
      }

      // Disable form during submission
      submitButton.disabled = true
      submitButton.textContent = "Subscribing..."

      try {
        // Simulate API call (replace with actual endpoint in WordPress)
        await simulateApiCall(email)

        showMessage(messageEl, "Thanks for subscribing! You'll receive our latest updates.", "success")
        form.reset()
      } catch (error) {
        showMessage(messageEl, "Something went wrong. Please try again later.", "error")
        console.error("Newsletter submission error:", error)
      } finally {
        submitButton.disabled = false
        submitButton.textContent = "Subscribe"
      }
    })
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function showMessage(element, text, type) {
    element.textContent = text
    element.className = "newsletter__message"
    element.classList.add(type === "success" ? "newsletter__message--success" : "newsletter__message--error")
  }

  function simulateApiCall(email) {
    // Replace this with actual WordPress AJAX call
    // Example:
    // return fetch('/wp-admin/admin-ajax.php', {
    //   method: 'POST',
    //   body: new FormData().append('action', 'subscribe_newsletter').append('email', email)
    // });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve({ success: true })
        } else {
          reject(new Error("API Error"))
        }
      }, 1000)
    })
  }

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href")

        if (targetId === "#") return

        const targetElement = document.querySelector(targetId)

        if (targetElement) {
          e.preventDefault()
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  }

  // ========================================
  // Image Lazy Loading (Fallback for older browsers)
  // ========================================
  function initImageLazyLoad() {
    // Use native lazy loading if supported
    if ("loading" in HTMLImageElement.prototype) {
      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.dataset.src
      })
    } else {
      // Fallback using Intersection Observer
      const lazyImages = document.querySelectorAll("img[data-src]")

      if (lazyImages.length === 0) return

      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target
              img.src = img.dataset.src
              img.removeAttribute("data-src")
              observer.unobserve(img)
            }
          })
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.01,
        },
      )

      lazyImages.forEach((img) => {
        imageObserver.observe(img)
      })
    }
  }

  // ========================================
  // Date Formatting Helper
  // ========================================
  window.formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // ========================================
  // Copy to Clipboard (for code blocks)
  // ========================================
  window.copyToClipboard = (button) => {
    const codeBlock = button.closest("pre").querySelector("code")
    const text = codeBlock.textContent

    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalText = button.textContent
        button.textContent = "Copied!"

        setTimeout(() => {
          button.textContent = originalText
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }
})()

// ========================================
// jQuery Version (if jQuery is loaded)
// ========================================
if (typeof window.jQuery !== "undefined") {
  ;(($) => {
    $(document).ready(() => {
      // Newsletter form with jQuery
      $("#newsletter-form").on("submit", function (e) {
        e.preventDefault()

        var $form = $(this)
        var $button = $form.find('button[type="submit"]')
        var $message = $("#newsletter-message")
        var email = $form.find('input[name="email"]').val().trim()

        // Validate
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          $message
            .removeClass("newsletter__message--success")
            .addClass("newsletter__message--error")
            .text("Please enter a valid email address.")
          return
        }

        // Disable form
        $button.prop("disabled", true).text("Subscribing...")

        // WordPress AJAX call example
        $.ajax({
          url: "/wp-admin/admin-ajax.php",
          type: "POST",
          data: {
            action: "subscribe_newsletter",
            email: email,
            nonce: $("#newsletter_nonce").val(), // Add nonce field for security
          },
          success: (response) => {
            if (response.success) {
              $message
                .removeClass("newsletter__message--error")
                .addClass("newsletter__message--success")
                .text("Thanks for subscribing! You'll receive our latest updates.")
              $form[0].reset()
            } else {
              $message
                .removeClass("newsletter__message--success")
                .addClass("newsletter__message--error")
                .text(response.data || "Something went wrong. Please try again.")
            }
          },
          error: () => {
            $message
              .removeClass("newsletter__message--success")
              .addClass("newsletter__message--error")
              .text("Something went wrong. Please try again later.")
          },
          complete: () => {
            $button.prop("disabled", false).text("Subscribe")
          },
        })
      })

      // Smooth scroll with jQuery
      $('a[href^="#"]').on("click", function (e) {
        var target = $(this.getAttribute("href"))

        if (target.length) {
          e.preventDefault()
          $("html, body").animate(
            {
              scrollTop: target.offset().top,
            },
            600,
          )
        }
      })

      // Image hover effects
      $(".post-preview__image, .hero-post__image")
        .on("mouseenter", function () {
          $(this).css("transform", "scale(1.02)")
        })
        .on("mouseleave", function () {
          $(this).css("transform", "scale(1)")
        })
    })
  })(window.jQuery)
}
